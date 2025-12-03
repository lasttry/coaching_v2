import { FpbGameOfficialInterface } from '@/types/fpb/gameOfficial/type';
import { FpbResultInterface } from '@/types/fpb/result/type';
import { FpbStandingInterface } from '@/types/fpb/standing/type';
import * as cheerio from 'cheerio';

export async function fetchFpbLatestResults(
  fpbTeamId: number,
  limit = 3
): Promise<FpbResultInterface[]> {
  const url = `https://www.fpb.pt/equipa/equipa_${fpbTeamId}/`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`FPB request failed: ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const results: FpbResultInterface[] = [];

  // Procurar o bloco de equipa atual com título "Resultados"
  const resultadosWrapper = $('.team-wrapper')
    .filter((_, el) => {
      const title = $(el).find('h2.title').first().text().trim();
      return title === 'Resultados';
    })
    .first();

  if (!resultadosWrapper.length) {
    return results;
  }

  // Cada bloco de dia/jogo dentro do wrapper de resultados
  resultadosWrapper.find('.day-wrapper').each((_, dayEl) => {
    if (results.length >= limit) {
      return false; // break no each do cheerio
    }

    const day = $(dayEl);

    const dateText = day.find('h3.date').first().text().trim();

    const link = day.find('a.game-wrapper-a').first();
    if (!link.length) {
      return;
    }

    const href = link.attr('href');
    const detailUrl = href ? new URL(href, 'https://www.fpb.pt').toString() : undefined;

    // Dentro do bloco do dia, a estrutura é:
    // .teams-wrapper
    //   .team-container (home)
    //   .results_wrapper (scores)
    //   .team-container.right (away)
    const teamsWrapper = day.find('.teams-wrapper').first();

    if (!teamsWrapper.length) {
      return;
    }

    const homeContainer = teamsWrapper.find('.team-container').first();
    const awayContainer = teamsWrapper.find('.team-container.right').first();

    const homeName = homeContainer.find('.fullName').first().text().trim();
    const awayName = awayContainer.find('.fullName').first().text().trim();

    // Scores: primeiros e últimos .results_text dentro do day-wrapper
    const scoreNodes = day.find('.results_wrapper .results_text');
    const homeScoreText = scoreNodes.first().text().trim();
    const awayScoreText = scoreNodes.last().text().trim();
    const homeScore = parseInt(homeScoreText, 10);
    const awayScore = parseInt(awayScoreText, 10);

    // Se não houver resultado numérico (ex: jogo futuro, sem resultado), ignorar este jogo
    if (Number.isNaN(homeScore) || Number.isNaN(awayScore)) {
      return;
    }

    const safeHomeTeam = homeName || '';
    const safeAwayTeam = awayName || '';

    results.push({
      date: dateText,
      homeTeam: safeHomeTeam,
      awayTeam: safeAwayTeam,
      homeScore,
      awayScore,
      detailUrl,
    });
  });

  return results;
}

/**
 * Busca a classificação da fase regular (tabela) para uma competição + fase da FPB.
 *
 * Se competitionId ou phaseId forem null/undefined/0, devolve [].
 */
export async function fetchFpbPhaseStandings(
  competitionId: number | null | undefined,
  phaseId: number | null | undefined,
  opponentFpbId: number | null | undefined
): Promise<FpbStandingInterface[]> {
  // Se algum for null, undefined ou 0, sair
  if (!competitionId || !phaseId || !opponentFpbId) {
    return [];
  }

  const searchParams = new URLSearchParams();
  searchParams.append('action', 'get_more_fase_regular');
  searchParams.append('competicao[]', String(competitionId));
  searchParams.append('fase', String(phaseId));
  const url = `https://www.fpb.pt/wp-admin/admin-ajax.php?action=get_more_fase_regular&competicao%5B%5D=${competitionId}&fase=${phaseId}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  if (!res.ok) {
    throw new Error(`FPB standings fetch failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as { result?: { body?: string } };

  const html = json?.result?.body;
  if (!html) {
    return [];
  }

  const $ = cheerio.load(html);
  const rows: FpbStandingInterface[] = [];

  // Cada linha da classificação
  $('.games-wrapper .team-row').each((_i, rowEl) => {
    const row = $(rowEl);

    const teamWrapper = row.find('.team-wrapper').first();
    if (!teamWrapper.length) return;

    // Posição (coluna com o número a bold)
    const posText = teamWrapper.find('.number h5').first().text().trim();
    const position = parseInt(posText, 10);
    if (Number.isNaN(position)) return;

    // Link do tipo /equipa/equipa_58260 => fpbTeamId = 58260
    const link = teamWrapper.find('a.team-name').first();
    const href = link.attr('href') ?? '';
    const match = href.match(/equipa_(\d+)/);
    const fpbTeamId = match ? Number(match[1]) : undefined;
    if (!fpbTeamId) return;

    // Se foi passado opponentFPBId, só queremos a linha dessa equipa
    if (opponentFpbId && fpbTeamId !== opponentFpbId) {
      return;
    }

    const name = link.find('h5.only-desktop').text().trim();
    const shortName = link.find('h5.only-mobile').text().trim() || name;

    // Colunas numéricas da linha, excluindo o bloco da equipa
    // Ordem no HTML:
    // 0: J, 1: V, 2: D, 3: FC, 4: PM, 5: PS, 6: DIF, 7: PTS
    const numericCols = row.children('div').not('.team-wrapper');

    const getNum = (index: number): number | undefined => {
      const col = numericCols.eq(index);
      const text = col.find('h5').text().trim();
      if (!text) return undefined;
      const n = Number(text);
      return Number.isNaN(n) ? undefined : n;
    };

    const games = getNum(0) ?? 0;
    const wins = getNum(1) ?? 0;
    const losses = getNum(2) ?? 0;
    const fc = getNum(3);
    const pm = getNum(4);
    const ps = getNum(5);
    const dif = getNum(6);
    const points = getNum(7) ?? 0;

    rows.push({
      position,
      name,
      shortName,
      fpbTeamId,
      games,
      wins,
      losses,
      fc,
      pm,
      ps,
      dif,
      points,
    });
  });

  return rows;
}

/**
 * Vai buscar a tabela de Juízes da ficha de jogo da FPB.
 * internalId é o valor do parâmetro ?internalID=... na URL.
 */
export async function fetchFpbGameOfficials(
  internalId: number | string
): Promise<FpbGameOfficialInterface[]> {
  const url = `https://www.fpb.pt/ficha-de-jogo/?internalID=${internalId}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`FPB game sheet fetch failed: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const officials: FpbGameOfficialInterface[] = [];

  // Encontrar o bloco com título "Juízes"
  const judgesWrapper = $('.game-stats-wrapper')
    .filter((_i, el) => {
      const title = $(el).find('h2.title').first().text().trim();
      return title === 'Juízes';
    })
    .first();

  if (!judgesWrapper.length) {
    return officials;
  }

  // Tabela dentro do wrapper
  const rows = judgesWrapper.find('table.fpb-table tbody tr');

  rows.each((index, row) => {
    // primeira linha é o header (th), ignorar
    if (index === 0) return;

    const $row = $(row);
    const cols = $row.find('td');

    if (cols.length < 3) return;

    const role = cols.eq(0).text().trim();
    const name = cols.eq(1).text().replace(/\s+/g, ' ').trim(); // limpa espaços extra
    const license = cols.eq(2).text().trim();

    if (!role && !name && !license) return;

    officials.push({
      role,
      name,
      license,
    });
  });

  return officials;
}
