import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import { generateVsBanner } from '@/utils/generateVsBanner';
import { GameInterface, jsPDFWithAutoTable } from '@/types/game/types';
import { ClubInterface } from '@/types/club/types';
import { log } from '@/lib/logger';

import { scienceGothicRegular } from './fonts/ScienceGothic-Regular';
import { FpbResultInterface } from '@/types/fpb/result/types';
import { FpbStandingInterface } from '@/types/fpb/standing/types';
import { FpbGameOfficialInterface } from '@/types/fpb/gameOfficial/types';

const lineWidthNormal = 0.1;
const lineWidthBold = 0.5;
const padding = 10;
const bannerWidth = 45;
const bannerHeight = 25;

export const toCamelCaseName = (value: string | undefined | null): string => {
  if (!value) return '';

  return value
    .trim()
    .toLowerCase()
    .split(/\s+/) // separa por espaços múltiplos
    .map((part) => {
      if (!part) return '';
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
};

const generateCells = (
  contentOrArray: string | string[],
  numberOfCells: number
): {
  content: string;
  styles: {
    lineWidth: {
      bottom: number;
      top: number;
      left: number;
      right: number;
    };
  };
}[] => {
  const isArray = Array.isArray(contentOrArray);
  return Array.from({ length: numberOfCells }, (v, i) => ({
    content: isArray ? contentOrArray[i] || '' : contentOrArray,
    styles: {
      lineWidth: {
        bottom: lineWidthBold,
        top: lineWidthNormal,
        left: i === 0 ? lineWidthBold : lineWidthNormal,
        right: i === numberOfCells - 1 ? lineWidthBold : lineWidthNormal,
      },
    },
  }));
};

const statisticsTimesHeaderStyle = (
  text: string,
  colSpan: number
): {
  content: string;
  colSpan: number;
  styles: {
    fontSize: number;
    cellPadding: number;
    halign: 'center';
  };
} => {
  const cell = {
    content: text,
    colSpan: colSpan,
    styles: {
      fontSize: 8,
      cellPadding: 0,
      halign: 'center' as const,
    },
  };
  if (colSpan > 0) {
    cell.colSpan = colSpan;
  }
  return cell;
};

const timedPeriod = (): (
  | {
      content: string;
      styles: { lineWidth: { left: number; right: number; top: number; bottom: number } };
    }
  | string
)[] => {
  return [
    {
      content: '',
      styles: {
        lineWidth: {
          left: lineWidthBold,
          right: lineWidthNormal,
          top: lineWidthBold,
          bottom: lineWidthBold,
        },
      },
    },
    '', // Minute
    '', // Second
    '', // Period
    '', // Minute
    {
      content: '',
      styles: {
        lineWidth: {
          right: lineWidthBold,
          left: lineWidthNormal,
          top: lineWidthBold,
          bottom: lineWidthBold,
        },
      },
    },
  ];
};

const formatAthleteName = (fullName: string | undefined): string => {
  if (fullName === undefined) {
    return '';
  }
  const parts = fullName.trim().split(' ');
  if (parts.length === 0) return '';

  const firstInitial = parts[0]; //.charAt(0).toUpperCase();
  const lastName = parts[parts.length - 1];

  return `${firstInitial} ${lastName}`;
};

const getGameEquipmentColor = (game: GameInterface): { color: string; colorHex: string } | null => {
  const firstAssignment = game.gameEquipments?.[0];
  if (!firstAssignment?.equipment) return null;
  const equipment = firstAssignment.equipment;
  const color = equipment.color || equipment.equipmentColor?.color || '';
  const colorHex = equipment.colorHex || equipment.equipmentColor?.colorHex || '';
  return color ? { color, colorHex } : null;
};

const athletesTableBody = (
  game: GameInterface
): { content: string; styles?: { fillColor?: string } }[][] => {
  return (
    game.gameAthletes
      ?.sort((a, b) => {
        // First, sort by number, with -1 always last
        const numberA = parseInt(a.number);
        const numberB = parseInt(b.number);

        if (numberA === -1 && numberB !== -1) return 1;
        if (numberB === -1 && numberA !== -1) return -1;
        if (numberA !== numberB) return numberA - numberB;

        // ✅ Safely handle missing athlete or athlete.name
        const nameA = a.athlete?.name ?? '';
        const nameB = b.athlete?.name ?? '';
        return nameA.localeCompare(nameB);
      })
      .map((entry) => {
        return [
          { content: formatAthleteName(entry.athlete?.name) },
          { content: entry.number === '-1' ? '' : entry.number },
          { content: entry.period1 ? 'X' : '' },
          { content: entry.period2 ? 'X' : '' },
          { content: entry.period3 ? 'X' : '' },
          { content: entry.period4 ? 'X' : '' },
        ];
      }) || []
  );
};

const timedAthletesTableBody = (
  game: GameInterface
):
  | (
      | string
      | {
          content: string;
          styles?: {
            lineWidth?: {
              left: number;
              right: number;
              top: number;
              bottom: number;
            };
          };
        }
    )[][]
  | undefined => {
  return athletesTableBody(game)?.flatMap((entry) => {
    return [
      [
        {
          content: entry[2]?.content ?? '',
          styles: {
            font: 'scienceGothic',
            lineWidth: {
              left: lineWidthBold,
              right: lineWidthNormal,
              top: lineWidthBold,
              bottom: lineWidthBold,
            },
          },
        },
        { content: entry[3]?.content ?? '' },
        ...timedPeriod(),
        ...timedPeriod(),
        ...timedPeriod(),
        ...timedPeriod(),
        ...timedPeriod(),
        ...timedPeriod(),
      ],
    ];
  });
};

const statisticsAthletesTableBody = (
  game: GameInterface
):
  | (
      | string
      | {
          content: string;
          rowSpan?: number;
          styles?: {
            lineWidth?: {
              left: number;
              right: number;
              top: number;
              bottom: number;
            };
          };
        }
    )[][]
  | undefined => {
  return athletesTableBody(game)?.flatMap((entry) => {
    return [
      [
        {
          content: entry[2]?.content ?? '',
          rowSpan: 2,
          styles: {
            lineWidth: {
              left: lineWidthBold,
              bottom: lineWidthBold,
              top: lineWidthNormal,
              right: lineWidthNormal,
            },
          },
        },
        {
          content: entry[3]?.content ?? '',
          rowSpan: 2,
          styles: {
            lineWidth: {
              bottom: lineWidthBold,
              top: lineWidthNormal,
              right: lineWidthNormal,
              left: lineWidthNormal,
            },
          },
        }, // Athlete's period markers, spans 2 rows
        '1',
        '1',
        '1',
        '1',
        '1',
        '1',
        '1',
        '1',
        '1',
        '1',
        '2',
        '2',
        '2',
        '2',
        '2',
        '2',
        '2',
        '2',
        '2',
        '2',
        '3',
        '3',
        '3',
        '3',
        '3',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '1',
        '2',
        {
          content: '3',
          styles: {
            lineWidth: {
              right: lineWidthBold,
              top: lineWidthNormal,
              left: lineWidthNormal,
              bottom: lineWidthNormal,
            },
          },
        },
      ],
      [
        ...generateCells('1', 10),
        ...generateCells('2', 10),
        ...generateCells('3', 5),
        ...generateCells('', 5),
        ...generateCells('', 5),
        ...generateCells('', 5),
        ...generateCells('', 3),
        ...generateCells('', 3),
        ...generateCells('', 4),
        ...generateCells(['4', '5', ''], 3),
      ],
    ];
  });
};
const fetchClub = async (clubId: number): Promise<ClubInterface | null> => {
  try {
    const res = await fetch(`/api/clubs/${clubId}`);
    if (!res.ok) throw new Error('Failed to fetch club');
    const data = await res.json();
    return data;
  } catch (err) {
    log.error('Error fetching club:', err);
    return null;
  }
};

const generateTopLeft = async (
  doc: jsPDF,
  startX: number,
  startY: number,
  game: GameInterface,
  club: ClubInterface,
  bannerImage: string
): Promise<void> => {
  doc.setFontSize(12);
  doc.text('Jogadores', startX, startY);

  // Show equipment color indicator
  const equipmentColor = getGameEquipmentColor(game);
  if (equipmentColor) {
    const colorBoxX = startX + 30;
    const colorBoxY = startY - 3;
    // Draw color box
    doc.setFillColor(equipmentColor.colorHex || '#000000');
    doc.rect(colorBoxX, colorBoxY, 8, 5, 'F');
    doc.setDrawColor(0);
    doc.rect(colorBoxX, colorBoxY, 8, 5, 'S');
    // Draw color name
    doc.setFontSize(9);
    doc.text(equipmentColor.color, colorBoxX + 10, startY);
  }

  if (bannerImage) {
    doc.addImage(bannerImage, 'PNG', startX + 55, startY - padding, bannerWidth, bannerHeight);
  }

  const tableWidth = doc.internal.pageSize.getWidth() / 2 - padding * 2;
  const columns = 4;
  const columnWidths = [
    40, // Nome
    10, // #
    ...Array(columns).fill((tableWidth - 50) / columns), // Periods
  ];
  type ColumnStyle = {
    cellWidth: number;
    halign: 'left' | 'center' | 'right';
  };
  const columnStyles = columnWidths.reduce<Record<number, ColumnStyle>>((acc, width, index) => {
    acc[index] = {
      cellWidth: width,
      halign: index === 0 ? 'left' : 'center', // Nome is left, rest are centered
    };
    return acc;
  }, {});

  autoTable(doc, {
    startY: startY + 15,
    margin: { left: startX },
    tableWidth: tableWidth + 10,
    columnStyles,
    head: [['Nome', '#', '1', '2', '3', '4']],
    body: athletesTableBody(game),
    headStyles: {
      font: 'scienceGothic',
      fontStyle: 'normal', // <- não tentar bold na fonte custom
      fillColor: club?.backgroundColor,
      textColor: club?.foregroundColor,
      halign: 'center',
      fontSize: 9, // compensa o “bold” com tamanho
    },
    styles: {
      font: 'scienceGothic',
      lineColor: [0, 0, 0], // Black borders
      lineWidth: 0.2, // Border thickness
      fontSize: 8,
      cellPadding: 1,
    },
    theme: 'grid', // Use grid to draw borders
  });
};

const generateTopRight = async (
  doc: jsPDF,
  startX: number,
  startY: number,
  game: GameInterface,
  club: ClubInterface,
  bannerImage: string
): Promise<void> => {
  doc.setFontSize(20);
  doc.text(club?.name, startX, startY);
  doc.setFontSize(14);
  //doc.text(game?.season as string, startX, startY + 10);

  const imageSource = bannerImage || club?.image;

  if (imageSource) {
    try {
      doc.addImage(imageSource, 'PNG', startX + 55, startY - padding, bannerWidth, bannerHeight);
    } catch (err) {
      log.warn('Error loading club image:', err);
    }
  }

  let officials: FpbGameOfficialInterface[] = [];

  try {
    const officialsRes = await fetch(`/api/games/${game.number}/fpb/officials`);
    if (officialsRes.ok) {
      officials = (await officialsRes.json()) as FpbGameOfficialInterface[];
    }
  } catch (err) {
    log.error('Error fetching FPB officials:', err);
  }
  const bodyRows: string[][] = [
    ['Jogo', game.number !== null && game.number !== undefined ? `${game.number}` : ''],
    ['Competição', game.competition?.name || ''],
    ['Local', game.venue?.name || ''],
    ['Série', game.competitionSerie?.name || ''],
    ['Adversário', game.opponent?.name || ''],
    ['Data/Hora', game.date ? dayjs(game.date).format('YYYY-MM-DD HH:mm') : ''],
  ];
  // Adicionar informação dos juízes no fim da tabela, se existir
  if (officials.length > 0) {
    bodyRows.push(['Juízes', '']);
    officials.forEach((o) => {
      bodyRows.push([o.role, `${toCamelCaseName(o.name)} (${o.license})`]);
    });
  }

  autoTable(doc, {
    startY: startY + 15,
    margin: { left: startX },
    head: [],
    body: bodyRows,
    styles: {
      font: 'scienceGothic',
      fontSize: 8,
      lineWidth: 0.2, // “espessura” da linha (mais grosso, ~1px visual)
      lineColor: [0, 0, 0], // preto
    },
    headStyles: {
      fontSize: 8,
      fillColor: club?.backgroundColor, // cor de fundo do cabeçalho
      textColor: club?.foregroundColor, // cor do texto do cabeçalho
      fontStyle: 'bold',
      halign: 'center',
    },
  });
};

const generateBottomLeft = async (
  doc: jsPDF,
  startX: number,
  startY: number,
  game: GameInterface,
  club: ClubInterface
): Promise<void> => {
  // FPB latest results for opponent
  if (game.opponent && game.opponent.fpbTeamId) {
    try {
      const resultsCount = game.opponentResultsCount ?? 5;
      const res = await fetch(
        `/api/opponents/${game.opponent.id}/fpb/results?limit=${resultsCount}`
      );
      const resultsJson = (await res.json()) as { results?: FpbResultInterface[] };

      const latestResults: FpbResultInterface[] = resultsJson.results ?? [];

      if (latestResults.length > 0) {
        //        const afterResultsY =
        //          (doc as jsPDFWithAutoTable).lastAutoTable?.finalY ?? resultsStartY + 25;

        doc.setFontSize(10);
        doc.text(`Últimos Resultados (FPB - ${game.opponent.shortName})`, startX, startY);
        autoTable(doc, {
          startY: startY + 2,
          margin: { left: startX },
          tableWidth: doc.internal.pageSize.getWidth() / 2 - padding * 2,
          head: [['Data', 'Casa', 'Resultado', 'Fora']],
          body: latestResults.map((r) => [
            r.date ?? '',
            r.homeTeam ?? '',
            r.homeScore !== null && r.awayScore !== null ? `${r.homeScore} - ${r.awayScore}` : '',
            r.awayTeam ?? '',
          ]),
          theme: 'grid',
          styles: {
            font: 'scienceGothic',
            fontSize: 7,
            lineWidth: 0.2,
            lineColor: [0, 0, 0],
            cellPadding: 1,
          },
          headStyles: {
            font: 'scienceGothic',
            fontStyle: 'normal',
            fillColor: club?.backgroundColor,
            textColor: club?.foregroundColor,
            halign: 'center',
            fontSize: 8,
          },
        });
        const afterLatestResultsY =
          (doc as jsPDFWithAutoTable).lastAutoTable?.finalY ?? startY + padding;

        const standingsRes = await fetch(
          `/api/opponents/${game.opponent.id}/fpb/standings?competitionId=${game.competition?.fpbCompetitionId}&phaseId=${game.competitionSerie?.fpbSerieId}`
        );
        if (standingsRes.ok) {
          const standingsJson = (await standingsRes.json()) as {
            standings?: FpbStandingInterface[];
          };
          const standings: FpbStandingInterface[] = standingsJson.standings ?? [];

          if (standings.length > 0) {
            // tentar encontrar a linha da equipa do adversário pelo fpbTeamId
            const opponentRow =
              standings.find((row) => row.fpbTeamId === game.opponent?.fpbTeamId) ?? standings[0];

            doc.setFontSize(10);
            doc.text(
              `Classificação FPB (${game.competitionSerie?.name})`,
              startX,
              afterLatestResultsY + 6
            );

            autoTable(doc, {
              startY: afterLatestResultsY + 8,
              margin: { left: startX },
              tableWidth: doc.internal.pageSize.getWidth() / 2 - padding * 2,
              head: [['Pos', 'Equipa', 'J', 'V', 'D', 'PTS', 'DIF']],
              body: [
                [
                  String(opponentRow.position),
                  opponentRow.name,
                  String(opponentRow.games),
                  String(opponentRow.wins),
                  String(opponentRow.losses),
                  String(opponentRow.points),
                  opponentRow.dif !== undefined ? String(opponentRow.dif) : '',
                ],
              ],
              theme: 'grid',
              styles: {
                font: 'scienceGothic',
                fontSize: 7,
                lineWidth: 0.2,
                lineColor: [0, 0, 0],
                cellPadding: 1,
              },
              headStyles: {
                font: 'scienceGothic',
                fontStyle: 'normal',
                fillColor: club?.backgroundColor,
                textColor: club?.foregroundColor,
                halign: 'center',
                fontSize: 8,
              },
            });
          }
        }
      }
    } catch (err) {
      log.error('Error fetching FPB latest results:', err);
    }
  } else {
    if (!game.opponent) {
      doc.text('Adversário não definido', startX, startY);
    } else if (!game.opponent?.fpbTeamId) {
      doc.text('FPB do adversário não definido', startX, startY);
    }
  }
};

const generateBottomRight = async (
  doc: jsPDF,
  startX: number,
  startY: number,
  game: GameInterface
): Promise<void> => {
  doc.setFontSize(12);
  doc.text('Notas', startX, startY);

  const wrappedText = doc.splitTextToSize(game.notes ?? '', doc.internal.pageSize.width - 40);
  doc.setFontSize(7);
  doc.text(wrappedText, startX - 5, startY + 6);

  // Render game images (2x2 grid)
  const imageSizeWidth = 43;
  const imageSizeHeigth = 30; // 30x30 small images
  const imageGap = 10;

  const images = [game.image1, game.image2, game.image3, game.image4];

  let imgX = startX;
  let imgY = startY + 6 + wrappedText.length * 3;

  images.forEach((img, index) => {
    if (img) {
      try {
        const base64Data = img.replace(/^data:image\/\w+;base64,/, '');
        doc.addImage(base64Data, 'PNG', imgX, imgY, imageSizeWidth, imageSizeHeigth);
      } catch {
        // ignore broken image
      }
    }

    imgX += imageSizeWidth + imageGap;

    if ((index + 1) % 2 === 0) {
      imgX = startX;
      imgY += imageSizeHeigth + imageGap;
    }
  });
};

export const generatePDF = async (game: GameInterface, clubId?: number): Promise<void> => {
  if (!clubId) {
    log.error('ClubId is missing');
    return;
  }
  // Fetch club
  const club = await fetchClub(clubId);
  if (club === null) {
    log.debug('Failed to find the club');
    return;
  }

  const doc = new jsPDF() as jsPDFWithAutoTable;
  doc.addFileToVFS('ScienceGothic-Regular.ttf', scienceGothicRegular);
  doc.addFont('ScienceGothic-Regular.ttf', 'scienceGothic', 'normal');
  doc.setFont('scienceGothic', 'normal');
  //  const pageWidth = doc.internal.pageSize.getWidth();
  //  const pageHeight = doc.internal.pageSize.getHeight();

  //  const midX = pageWidth / 2;
  //  const midY = pageHeight / 2;

  // generate banner image

  const clubName = club.shortName || club.name || 'Clube';
  const opponentName = game.opponent?.shortName || game.opponent?.name || 'Adversário';

  const bannerHomeTeam = {
    image: game.away
      ? (game.opponent?.image ?? '/images/logos/logo-dark.svg')
      : club.image || '/images/logos/logo-dark.svg',
    name: game.away ? opponentName : clubName,
    isClub: !game.away,
  };
  const bannerAwayTeam = {
    image: !game.away
      ? (game.opponent?.image ?? '/images/logos/logo-dark.svg')
      : club.image || '/images/logos/logo-dark.svg',
    name: !game.away ? opponentName : clubName,
    isClub: game.away,
  };

  const bannerImage = await generateVsBanner(bannerHomeTeam, bannerAwayTeam);

  // parte 1
  await generateTopLeft(doc, padding, padding, game, club, bannerImage);
  await generateTopRight(
    doc,
    doc.internal.pageSize.getWidth() / 2 + padding,
    padding,
    game,
    club,
    bannerImage
  );
  await generateBottomLeft(
    doc,
    padding,
    doc.internal.pageSize.getHeight() / 2 + padding,
    game,
    club
  );
  await generateBottomRight(
    doc,
    doc.internal.pageSize.getWidth() / 2 + padding,
    doc.internal.pageSize.getHeight() / 2 + padding,
    game
  );

  // 🔹 Opcional: Linhas divisórias visuais
  doc.setDrawColor(150);
  doc.line(
    doc.internal.pageSize.getWidth() / 2,
    0,
    doc.internal.pageSize.getWidth() / 2,
    doc.internal.pageSize.getHeight()
  ); // Vertical
  doc.line(
    0,
    doc.internal.pageSize.getHeight() / 2,
    doc.internal.pageSize.getWidth(),
    doc.internal.pageSize.getHeight() / 2
  ); // Horizontal

  // Add speech page if speech exists
  if (game.speech && game.speech.trim()) {
    doc.addPage();
    doc.setFont('scienceGothic', 'normal');
    doc.setFontSize(11);
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    const lines = doc.splitTextToSize(game.speech, maxWidth);
    doc.text(lines, margin, margin);
  }

  doc.save(`Folha_de_Jogo_${game.id}.pdf`);
};

// Helper function for statistics PDF
export const generateStatisticsPDF = (game: GameInterface): void => {
  const doc = new jsPDF({
    orientation: 'landscape',
  }) as jsPDFWithAutoTable;

  autoTable(doc, {
    startY: 2,
    margin: { left: 10 },
    head: [], // Table headers
    body: [
      [
        'Jogo',
        `${game.number}`,
        'Data/Hora',
        `${dayjs(game.date).format('YYYY-MM-DD HH:mm')}`,
        'Adversário',
        `${game.opponent?.name}`,
      ],
    ],
    theme: 'grid', // Use grid to draw borders
  });
  let afterTableY = doc.lastAutoTable?.finalY ?? 0; // Get Y position after the table

  autoTable(doc, {
    startY: afterTableY,
    margin: { left: 10, right: 10 },
    head: [
      [
        { content: 'Atleta', colSpan: 2, styles: { halign: 'center' } },
        { content: 'FT', colSpan: 10, styles: { halign: 'center' } },
        { content: 'FG', colSpan: 10, styles: { halign: 'center' } },
        { content: '3PTS', colSpan: 5, styles: { halign: 'center' } },
        { content: 'A', colSpan: 5, styles: { halign: 'center' } },
        { content: 'DR', colSpan: 5, styles: { halign: 'center' } },
        { content: 'OR', colSpan: 5, styles: { halign: 'center' } },
        { content: 'BL', colSpan: 3, styles: { halign: 'center' } },
        { content: 'STL', colSpan: 3, styles: { halign: 'center' } },
        { content: 'TO', colSpan: 4, styles: { halign: 'center' } },
        { content: 'Fauls', colSpan: 3, styles: { halign: 'center' } },
      ],
    ],
    body: statisticsAthletesTableBody(game),
    theme: 'grid',
    headStyles: {
      fillColor: game.club?.backgroundColor, // Background color (RGB)
      textColor: game.club?.foregroundColor, // Foreground text color (white)
      fontStyle: 'bold', // Optional: make the header text bold
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: {
        top: 0, // Padding for the top
        right: 1, // Padding for the right
        bottom: 0, // Padding for the bottom
        left: 1, // Padding for the left
      },
      halign: 'center',
      valign: 'middle',
    },
    styles: {
      lineColor: [0, 0, 0], // Black borders
      lineWidth: lineWidthNormal, // Border thickness
    },
    columnStyles: {
      2: {
        lineWidth: {
          left: lineWidthBold,
          right: lineWidthNormal,
          top: lineWidthNormal,
          bottom: lineWidthNormal,
        },
      },
      12: {
        lineWidth: {
          left: lineWidthBold,
          right: lineWidthNormal,
          top: lineWidthNormal,
          bottom: lineWidthNormal,
        },
      },
      22: {
        lineWidth: {
          left: lineWidthBold,
          right: lineWidthNormal,
          top: lineWidthNormal,
          bottom: lineWidthNormal,
        },
      },
      27: {
        lineWidth: {
          left: lineWidthBold,
          right: lineWidthNormal,
          top: lineWidthNormal,
          bottom: lineWidthNormal,
        },
      },
      32: {
        lineWidth: {
          left: lineWidthBold,
          right: lineWidthNormal,
          top: lineWidthNormal,
          bottom: lineWidthNormal,
        },
      },
      37: {
        lineWidth: {
          left: lineWidthBold,
          right: lineWidthNormal,
          top: lineWidthNormal,
          bottom: lineWidthNormal,
        },
      },
      42: {
        lineWidth: {
          left: lineWidthBold,
          right: lineWidthNormal,
          top: lineWidthNormal,
          bottom: lineWidthNormal,
        },
      },
      45: {
        lineWidth: {
          left: lineWidthBold,
          right: lineWidthNormal,
          top: lineWidthNormal,
          bottom: lineWidthNormal,
        },
      },
      48: {
        lineWidth: {
          left: lineWidthBold,
          right: lineWidthNormal,
          top: lineWidthNormal,
          bottom: lineWidthNormal,
        },
      },
      52: {
        lineWidth: {
          left: lineWidthBold,
          right: lineWidthNormal,
          top: lineWidthNormal,
          bottom: lineWidthNormal,
        },
      },
      55: {
        lineWidth: {
          left: lineWidthBold,
          right: lineWidthNormal,
          top: lineWidthNormal,
          bottom: lineWidthNormal,
        },
      },
    },
    didParseCell: function (data) {
      // Apply the background color only to the body rows (ignoring the header)
      if (data.row.section === 'body' && (data.row.index % 4 === 0 || data.row.index % 4 === 1)) {
        data.cell.styles.fillColor = [240, 240, 240]; // Light gray color
      }
    },
  });
  afterTableY = doc.lastAutoTable?.finalY ?? 0; // Get Y position after the table
  autoTable(doc, {
    startY: afterTableY + 1,
    margin: { left: 10, right: 10 },
    //head: [[{ content: 'Equipa', colSpan: 40, styles: { halign: 'center' }, }]],
    body: [
      [
        'DR Lost',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: `backgroundColor`, // Background color (RGB)
      textColor: `foregroundColor`, // Foreground text color (white)
      fontStyle: 'bold', // Optional: make the header text bold
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 1,
      halign: 'center',
      valign: 'middle',
    },
    styles: {
      lineColor: [0, 0, 0], // Black borders
      lineWidth: 0.1, // Border thickness
    },
  });
  afterTableY = doc.lastAutoTable?.finalY ?? 0; // Get Y position after the table
  autoTable(doc, {
    startY: afterTableY + 3,
    margin: { left: 10, right: 10 },
    head: [
      [{ content: 'Tempos', colSpan: 38, styles: { halign: 'center' } }],
      [
        statisticsTimesHeaderStyle('', 2),
        statisticsTimesHeaderStyle('In', 3),
        statisticsTimesHeaderStyle('Out', 3),
        statisticsTimesHeaderStyle('In', 3),
        statisticsTimesHeaderStyle('Out', 3),
        statisticsTimesHeaderStyle('In', 3),
        statisticsTimesHeaderStyle('Out', 3),
        statisticsTimesHeaderStyle('In', 3),
        statisticsTimesHeaderStyle('Out', 3),
        statisticsTimesHeaderStyle('In', 3),
        statisticsTimesHeaderStyle('Out', 3),
        statisticsTimesHeaderStyle('In', 3),
        statisticsTimesHeaderStyle('Out', 3),
      ],
      [
        statisticsTimesHeaderStyle('', 2),
        statisticsTimesHeaderStyle('P', 0),
        statisticsTimesHeaderStyle('M', 0),
        statisticsTimesHeaderStyle('S', 0),
        statisticsTimesHeaderStyle('P', 0),
        statisticsTimesHeaderStyle('M', 0),
        statisticsTimesHeaderStyle('S', 0),
        statisticsTimesHeaderStyle('P', 0),
        statisticsTimesHeaderStyle('M', 0),
        statisticsTimesHeaderStyle('S', 0),
        statisticsTimesHeaderStyle('P', 0),
        statisticsTimesHeaderStyle('M', 0),
        statisticsTimesHeaderStyle('S', 0),
        statisticsTimesHeaderStyle('P', 0),
        statisticsTimesHeaderStyle('M', 0),
        statisticsTimesHeaderStyle('S', 0),
        statisticsTimesHeaderStyle('P', 0),
        statisticsTimesHeaderStyle('M', 0),
        statisticsTimesHeaderStyle('S', 0),
        statisticsTimesHeaderStyle('P', 0),
        statisticsTimesHeaderStyle('M', 0),
        statisticsTimesHeaderStyle('S', 0),
        statisticsTimesHeaderStyle('P', 0),
        statisticsTimesHeaderStyle('M', 0),
        statisticsTimesHeaderStyle('S', 0),
        statisticsTimesHeaderStyle('P', 0),
        statisticsTimesHeaderStyle('M', 0),
        statisticsTimesHeaderStyle('S', 0),
        statisticsTimesHeaderStyle('P', 0),
        statisticsTimesHeaderStyle('M', 0),
        statisticsTimesHeaderStyle('S', 0),
        statisticsTimesHeaderStyle('P', 0),
        statisticsTimesHeaderStyle('M', 0),
        statisticsTimesHeaderStyle('S', 0),
        statisticsTimesHeaderStyle('P', 0),
        statisticsTimesHeaderStyle('M', 0),
        statisticsTimesHeaderStyle('S', 0),
      ],
    ],
    body: timedAthletesTableBody(game),
    theme: 'grid',
    headStyles: {
      fillColor: `backgroundColor`, // Background color (RGB)
      textColor: `foregroundColor`, // Foreground text color (white)
      fontStyle: 'bold', // Optional: make the header text bold
    },
    styles: {
      lineColor: [0, 0, 0], // Black borders
      lineWidth: {
        left: lineWidthNormal,
        right: lineWidthNormal,
        bottom: lineWidthBold,
        top: lineWidthBold,
      }, // Border thickness
    },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 1.5,
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      4: { cellWidth: 8 },
      7: { cellWidth: 8 },
      10: { cellWidth: 8 },
      13: { cellWidth: 8 },
      16: { cellWidth: 8 },
      19: { cellWidth: 8 },
      22: { cellWidth: 8 },
      25: { cellWidth: 8 },
      28: { cellWidth: 8 },
      31: { cellWidth: 8 },
      34: { cellWidth: 8 },
      37: { cellWidth: 8 },
    },
  });

  doc.save(`Folha_de_Estatisticas_${game.id}.pdf`);
  return;
};
