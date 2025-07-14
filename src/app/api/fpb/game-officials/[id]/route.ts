import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';
import * as cheerio from 'cheerio';

type Params = Promise<{ id: number }>;

export async function GET(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const session = await auth();
  if (
    !session?.user ||
    !session.user.selectedClubId ||
    isNaN(Number(session.user.selectedClubId))
  ) {
    log.error('games/[id]/route.ts>GET: session invalid or club not selected');
    return NextResponse.json({ status: 401 });
  }

  const params = await segmentData.params;
  const id = Number(params.id);

  if (!id) {
    return NextResponse.json({ error: 'Game id is invalid' }, { status: 400 });
  }

  const url = `https://www.fpb.pt/ficha-de-jogo/?internalID=${id}`;
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const officials = {
    refereeMain: $('td:contains("Árbitro Principal")').next().text().trim(),
    referee1: $('td:contains("Árbitro Auxiliar 1")').next().text().trim(),
    scorer: $('td:contains("Marcador")').next().text().trim(),
    timekeeper: $('td:contains("Cronometrista")').next().text().trim(),
    shotClock: $('td:contains("Operador 24")').next().text().trim(),
  };

  return NextResponse.json(officials);
}