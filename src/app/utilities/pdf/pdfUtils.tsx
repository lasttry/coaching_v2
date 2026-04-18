import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import { generateVsBanner } from '@/utils/generateVsBanner';
import { GameInterface, jsPDFWithAutoTable } from '@/types/game/types';
import { ClubInterface } from '@/types/club/types';
import { log } from '@/lib/logger';

import { scienceGothicRegular } from './fonts/ScienceGothic-Regular';
import arialNormal from './fonts/Arial-normal';
import arialBold from './fonts/Arial-bold';
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

const getGameEquipmentColor = (
  game: GameInterface,
  selectedColorId?: number
): { color: string; colorHex: string } | null => {
  if (!game.gameEquipments?.length) return null;

  let assignment;
  if (selectedColorId) {
    assignment = game.gameEquipments.find((ge) => ge.equipmentColorId === selectedColorId);
  }
  if (!assignment) {
    assignment = game.gameEquipments[0];
  }

  if (!assignment?.equipment) return null;
  const equipment = assignment.equipment;
  const color = equipment.color || equipment.equipmentColor?.color || '';
  const colorHex = equipment.colorHex || equipment.equipmentColor?.colorHex || '';
  return color ? { color, colorHex } : null;
};

export const getDistinctEquipmentColorsFromGame = (
  game: GameInterface
): { colorId: number; color: string; colorHex: string }[] => {
  const colorMap = new Map<number, { color: string; colorHex: string }>();

  game.gameEquipments?.forEach((ge) => {
    if (ge.equipmentColorId && !colorMap.has(ge.equipmentColorId)) {
      const eq = ge.equipment;
      if (eq) {
        colorMap.set(ge.equipmentColorId, {
          color: eq.color || eq.equipmentColor?.color || '',
          colorHex: eq.colorHex || eq.equipmentColor?.colorHex || '#000000',
        });
      }
    }
  });

  return Array.from(colorMap.entries())
    .map(([colorId, { color, colorHex }]) => ({ colorId, color, colorHex }))
    .filter((c) => c.color)
    .sort((a, b) => a.color.localeCompare(b.color));
};

const athletesTableBody = (
  game: GameInterface,
  selectedColorId?: number
): { content: string; styles?: { fillColor?: string } }[][] => {
  return (
    game.gameAthletes
      ?.map((entry) => {
        let number = entry.number;
        if (selectedColorId && game.gameEquipments) {
          const colorEquipment = game.gameEquipments.find(
            (ge) => ge.athleteId === entry.athleteId && ge.equipmentColorId === selectedColorId
          );
          if (colorEquipment?.equipment) {
            number = String(colorEquipment.equipment.number);
          }
        }
        return { ...entry, displayNumber: number };
      })
      .sort((a, b) => {
        const numberA = parseInt(a.displayNumber);
        const numberB = parseInt(b.displayNumber);

        if (numberA === -1 && numberB !== -1) return 1;
        if (numberB === -1 && numberA !== -1) return -1;
        if (numberA !== numberB) return numberA - numberB;

        const nameA = a.athlete?.name ?? '';
        const nameB = b.athlete?.name ?? '';
        return nameA.localeCompare(nameB);
      })
      .map((entry) => {
        return [
          { content: formatAthleteName(entry.athlete?.name) },
          { content: entry.displayNumber === '-1' ? '' : entry.displayNumber },
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
  bannerImage: string,
  selectedColorId?: number
): Promise<void> => {
  doc.setFontSize(12);
  doc.text('Jogadores', startX, startY);

  // Show equipment color indicator
  const equipmentColor = getGameEquipmentColor(game, selectedColorId);
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
    body: athletesTableBody(game, selectedColorId),
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

export const generatePDF = async (
  game: GameInterface,
  clubId?: number,
  selectedColorId?: number
): Promise<void> => {
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
  await generateTopLeft(doc, padding, padding, game, club, bannerImage, selectedColorId);
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

  // Get color name for filename
  const equipmentColor = getGameEquipmentColor(game, selectedColorId);
  const colorSuffix = equipmentColor ? `_${equipmentColor.color}` : '';
  doc.save(`Folha_de_Jogo_${game.id}${colorSuffix}.pdf`);
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

// Types for registration PDF
interface RegistrationAthlete {
  id: number;
  name: string;
  birthdate: string | Date | null;
  fpbNumber: number | null;
  number: string | null;
  photo: string | null;
}

interface RegistrationStaff {
  id: number;
  name: string;
  birthdate: string | Date | null;
  tptdNumber: number | null;
  fpbLicense: number | null;
  grade: string | null;
  role: string;
  isPrimary: boolean;
}

interface RegistrationTeam {
  id: number;
  name: string;
  type: string | null;
  echelon: {
    id: number;
    name: string;
    gender: string;
  };
  club: {
    id: number;
    name: string;
    shortName: string | null;
    image: string | null;
    federationLogo: string | null;
    backgroundColor: string | null;
    foregroundColor: string | null;
  };
}

interface RegistrationData {
  team: RegistrationTeam;
  athletes: RegistrationAthlete[];
  staff: RegistrationStaff[];
}

const STAFF_ROLE_LABELS_PDF: Record<string, string> = {
  HEAD_COACH: 'Treinador Principal',
  ASSISTANT_COACH: 'Treinador Adjunto',
  DIRECTOR: 'Diretor',
  TEAM_MANAGER: 'Delegado',
  PHYSIOTHERAPIST: 'Fisioterapeuta',
  STATISTICIAN: 'Estatístico',
  OTHER: 'Outro',
};

const COACH_GRADE_LABELS_PDF: Record<string, string> = {
  GRADE_1: 'Grau 1',
  GRADE_2: 'Grau 2',
  GRADE_3: 'Grau 3',
  GRADE_4: 'Grau 4',
  TRAINEE: 'Estagiário',
};

const STAFF_FUNCTION_PDF: Record<string, string> = {
  HEAD_COACH: 'PRI',
  ASSISTANT_COACH: 'ADJ',
  DIRECTOR: 'Director',
  TEAM_MANAGER: 'Seccionista',
  PHYSIOTHERAPIST: 'Fisioterapeuta',
  STATISTICIAN: 'Estatístico',
  OTHER: 'Outro',
};

// Generate FPB-style registration PDF for a game
export const generateRegistrationPDF = async (game: GameInterface): Promise<void> => {
  try {
    if (!game.teamId) {
      throw new Error('Game has no team assigned');
    }

    // Fetch registration data
    const res = await fetch(`/api/teams/${game.teamId}/registration`);
    if (!res.ok) throw new Error('Failed to fetch registration data');
    const data: RegistrationData = await res.json();

    const { team, athletes, staff } = data;
    const club = team.club;

    const doc = new jsPDF() as jsPDFWithAutoTable;

    // Add Arial fonts
    doc.addFileToVFS('Arial.ttf', arialNormal);
    doc.addFont('Arial.ttf', 'Arial', 'normal');
    doc.addFileToVFS('Arial-Bold.ttf', arialBold);
    doc.addFont('Arial-Bold.ttf', 'Arial', 'bold');

    // Use Arial font
    const font = 'Arial';
    doc.setFont(font, 'normal');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;

    // FPB colors - dark blue header like FPB official documents
    const headerBgColor: [number, number, number] = [255, 255, 255];
    const headerTextColor: [number, number, number] = [0, 0, 0]; // White text
    const subHeaderTextColor: [number, number, number] = [32, 64, 108]; // Black
    const borderColor: [number, number, number] = [197, 197, 197]; // Black
    const textColor: [number, number, number] = [0, 0, 0]; // Black
    const tableHeaderBgColor: [number, number, number] = [230, 230, 230]; // Light gray for table headers

    // Competition and series info
    const competitionName = game.competition?.name || 'Competição';
    const serieName = game.competitionSerie?.name || '';
    const titleLine = serieName ? `${competitionName} - ${serieName}` : competitionName;

    // Teams info
    const homeTeam = game.away ? game.opponent?.name || 'Adversário' : club.shortName || club.name;
    const awayTeam = game.away ? club.shortName || club.name : game.opponent?.name || 'Adversário';
    const gameInfoLine = `Jogo: ${game.number || ''} - ${homeTeam} vs ${awayTeam}`;
    const dateLine = game.date ? dayjs(game.date).format('YYYY-MMM-DD HH:mm') : '';

    // ============ PAGE 1: JOGADORES ============
    let yPos = margin;

    // Header table with dark blue background (like FPB document)
    const headerHeight = 25;
    const logoWidth = 20;
    const logoMargin = 3;

    // Draw header background
    doc.setFillColor(headerBgColor[0], headerBgColor[1], headerBgColor[2]);
    doc.rect(margin, yPos, pageWidth - margin * 2, headerHeight, 'F');

    // Draw border around header
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPos, pageWidth - margin * 2, headerHeight, 'S');

    // Add federation logo if available
    const textStartX = margin + logoWidth + logoMargin * 2;
    if (club.federationLogo) {
      try {
        doc.addImage(
          club.federationLogo,
          'PNG',
          margin + logoMargin,
          yPos + logoMargin,
          logoWidth,
          headerHeight - logoMargin * 2
        );
      } catch (e) {
        console.warn('Failed to add federation logo:', e);
      }
    }

    // Title text (white on dark blue background)
    doc.setTextColor(headerTextColor[0], headerTextColor[1], headerTextColor[2]);
    doc.setFontSize(13);
    doc.setFont(font, 'bold');
    const textCenterX = textStartX + (pageWidth - margin - textStartX) / 2;
    doc.text(titleLine, textCenterX, yPos + 7, { align: 'center' });

    // Game info line
    doc.setTextColor(subHeaderTextColor[0], subHeaderTextColor[1], subHeaderTextColor[2]);
    doc.setFontSize(11);
    doc.setFont(font, 'normal');
    doc.text(gameInfoLine, textCenterX, yPos + 13, { align: 'center' });

    // Date line
    doc.setFontSize(13);
    doc.setFont(font, 'bold');
    doc.text(dateLine, textCenterX, yPos + 19, { align: 'center' });

    // Reset text color
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);

    yPos += headerHeight + 3;

    // Disclaimer text
    doc.setFontSize(7);
    doc.setFont(font, 'italic');
    const disclaimer =
      'Esta listagem não se sobrepõe, nem dispensa a consulta e aplicação, dos Regulamentos da FPB relevantes, nomeadamente o Regulamento de Provas, o Regulamento de Inscrições e Transferências e o Regulamento de Disciplina';
    const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - margin * 2);
    doc.text(disclaimerLines, pageWidth / 2, yPos, { align: 'center' });

    yPos += disclaimerLines.length * 3 + 3;

    // Club name (bold, larger)
    doc.setFontSize(12);
    doc.setFont(font, 'bold');
    doc.text(club.name, margin, yPos);

    yPos += 6;

    // JOGADORES section title
    doc.setFontSize(10);
    doc.setFont(font, 'bold');
    doc.text('JOGADORES', margin, yPos);
    yPos += 3;

    // Athletes table - FPB style with photo column
    const athleteRows = athletes.map((athlete, index) => {
      const rowNum = String(index + 1);
      // Check if athlete might be captain (number 12)
      const isCaptain = athlete.number === '12';
      return [
        rowNum + (isCaptain ? ' CAP' : ''),
        '', // Foto placeholder - empty cell for photo
        toCamelCaseName(athlete.name),
        athlete.birthdate ? dayjs(athlete.birthdate).format('DD-MMM-YYYY') : '',
        '', // Sem FBP column
        athlete.fpbNumber ? String(athlete.fpbNumber) : '',
        'X', // NR. Final checkbox
      ];
    });

    autoTable(doc, {
      startY: yPos,
      margin: { left: margin, right: margin, bottom: 25 },
      head: [['#', 'Foto', 'Nome', 'Data Nasc.', 'Sem FBP*', 'Licença', 'NR. Final']],
      body: athleteRows,
      theme: 'grid',
      styles: {
        font: font,
        fontSize: 8,
        cellPadding: 2,
        lineColor: borderColor,
        lineWidth: 0.3,
        valign: 'middle',
        textColor: textColor,
      },
      headStyles: {
        fillColor: tableHeaderBgColor,
        textColor: textColor,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 8,
        lineWidth: 0.3,
        lineColor: borderColor,
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' }, // # with CAP
        1: { cellWidth: 18, halign: 'center', minCellHeight: 15 }, // Foto - taller for image
        2: { cellWidth: 50 }, // Nome
        3: { cellWidth: 28, halign: 'center' }, // Data Nasc
        4: { cellWidth: 28, halign: 'center' }, // Sem FBP
        5: { cellWidth: 22, halign: 'center' }, // Licença
        6: { cellWidth: 20, halign: 'center' }, // NR. Final
      },
      didDrawCell: (data) => {
        // Draw photo in photo cell
        if (data.column.index === 1 && data.section === 'body') {
          const { x, y, width, height } = data.cell;
          const athleteIndex = data.row.index;
          const athlete = athletes[athleteIndex];

          if (athlete?.photo) {
            try {
              // Add photo image
              const imgWidth = width - 4;
              const imgHeight = height - 4;
              doc.addImage(athlete.photo, 'JPEG', x + 2, y + 2, imgWidth, imgHeight);
            } catch {
              // If image fails, draw placeholder border
              doc.setDrawColor(...borderColor);
              doc.setLineWidth(0.1);
              doc.rect(x + 2, y + 2, width - 4, height - 4);
            }
          } else {
            // Draw border for photo placeholder
            doc.setDrawColor(...borderColor);
            doc.setLineWidth(0.1);
            doc.rect(x + 2, y + 2, width - 4, height - 4);
          }
        }
      },
    });

    // Footer note with yellow background
    const afterAthletesY = doc.lastAutoTable?.finalY ?? yPos + 50;
    const noteText = '* Sem Formação Basquetebolística Portuguesa (Inclui Equiparados FBP)';
    const noteY = afterAthletesY + 3;
    const noteHeight = 5;

    // Yellow background spanning full width
    doc.setFillColor(255, 255, 0); // Yellow
    doc.rect(10, noteY - 3, pageWidth - 30, noteHeight, 'F');

    // Text
    doc.setFontSize(7);
    doc.setFont(font, 'italic');
    doc.setTextColor(0, 0, 0);
    doc.text(noteText, margin, noteY);

    // ============ PAGE 2: TREINADORES ============
    doc.addPage();
    yPos = margin;

    // Title
    doc.setFontSize(11);
    doc.setFont(font, 'bold');
    doc.text(titleLine, pageWidth / 2, yPos, { align: 'center' });

    yPos += 5;

    // Game info
    doc.setFontSize(10);
    doc.text(gameInfoLine, pageWidth / 2, yPos, { align: 'center' });

    yPos += 5;

    // Date
    doc.setFontSize(9);
    doc.setFont(font, 'normal');
    doc.text(dateLine, pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;

    // Club name
    doc.setFontSize(12);
    doc.setFont(font, 'bold');
    doc.text(club.name, margin, yPos);
    yPos += 6;

    // Separate coaches from other staff
    const coaches = staff.filter((s) => ['HEAD_COACH', 'ASSISTANT_COACH'].includes(s.role));
    const otherStaff = staff.filter((s) => !['HEAD_COACH', 'ASSISTANT_COACH'].includes(s.role));

    // TREINADORES section
    doc.setFontSize(10);
    doc.setFont(font, 'bold');
    doc.text('TREINADORES', margin, yPos);
    yPos += 3;

    if (coaches.length > 0) {
      const coachRows = coaches.map((s, index) => {
        const isPri = s.role === 'HEAD_COACH' || s.isPrimary;
        const isAdj = s.role === 'ASSISTANT_COACH' && !s.isPrimary;
        return [
          String(index + 1),
          toCamelCaseName(s.name),
          s.birthdate ? dayjs(s.birthdate).format('DD-MMM-YYYY') : '',
          s.tptdNumber ? String(s.tptdNumber) : '',
          s.grade ? COACH_GRADE_LABELS_PDF[s.grade] || '' : '',
          `${isPri ? 'PRI' : 'ADJ'} - ${team.echelon.name}`,
          s.fpbLicense ? String(s.fpbLicense) : '',
          isPri ? 'X' : '',
          isAdj ? 'X' : '',
        ];
      });

      autoTable(doc, {
        startY: yPos,
        margin: { left: margin, right: margin, bottom: 25 },
        head: [
          [
            '#',
            'Nome',
            'Data Nasc.',
            'TPTD',
            'Grau\nFormação',
            'Competição /\nFunção',
            'Carteira',
            'PRI',
            'ADJ',
          ],
        ],
        body: coachRows,
        theme: 'grid',
        styles: {
          font: font,
          fontSize: 8,
          cellPadding: 2,
          lineColor: borderColor,
          lineWidth: 0.3,
          valign: 'middle',
          textColor: textColor,
        },
        headStyles: {
          fillColor: tableHeaderBgColor,
          textColor: textColor,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 7,
          lineWidth: 0.3,
          lineColor: borderColor,
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 42 },
          2: { cellWidth: 24, halign: 'center' },
          3: { cellWidth: 18, halign: 'center' },
          4: { cellWidth: 22, halign: 'center' },
          5: { cellWidth: 32, halign: 'center' },
          6: { cellWidth: 18, halign: 'center' },
          7: { cellWidth: 12, halign: 'center' },
          8: { cellWidth: 12, halign: 'center' },
        },
      });

      yPos = doc.lastAutoTable?.finalY ?? yPos + 30;
      yPos += 8;
    }

    // ENQUADRAMENTO HUMANO section
    if (otherStaff.length > 0) {
      doc.setFontSize(10);
      doc.setFont(font, 'bold');
      doc.text('ENQUADRAMENTO HUMANO', margin, yPos);
      yPos += 3;

      const otherRows = otherStaff.map((s, index) => [
        String(index + 1),
        toCamelCaseName(s.name),
        s.birthdate ? dayjs(s.birthdate).format('DD-MMM-YYYY') : '',
        s.fpbLicense ? String(s.fpbLicense) : '',
        STAFF_FUNCTION_PDF[s.role] || s.role,
        'X',
      ]);

      autoTable(doc, {
        startY: yPos,
        margin: { left: margin, right: margin, bottom: 25 },
        head: [['#', 'Nome', 'Data Nasc.', 'Licença', 'Função', 'SEL']],
        body: otherRows,
        theme: 'grid',
        styles: {
          font: font,
          fontSize: 8,
          cellPadding: 2,
          lineColor: borderColor,
          lineWidth: 0.3,
          valign: 'middle',
          textColor: textColor,
        },
        headStyles: {
          fillColor: tableHeaderBgColor,
          textColor: textColor,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 8,
          lineWidth: 0.3,
          lineColor: borderColor,
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 55 },
          2: { cellWidth: 28, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 35, halign: 'center' },
          5: { cellWidth: 15, halign: 'center' },
        },
      });
    }

    // Add footer to all pages
    const totalPages = doc.getNumberOfPages();
    const createdText = `Criado pelo SAv2 em ${dayjs().format('DD-MMM-YYYY HH:mm')}`;
    const footerY = pageHeight - 8;

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Line before footer (full width)
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(12, footerY - 4, pageWidth - 12, footerY - 4);

      doc.setFontSize(8);
      doc.setFont(font, 'normal');
      doc.setTextColor(...textColor);

      // Left: "Criado pelo SAv2 em..."
      doc.text(createdText, margin + 12, footerY);

      // Right: "Página X"
      doc.text(`Página ${i}`, pageWidth - margin - 12, footerY, { align: 'right' });
    }

    // Save
    const fileName = `${team.echelon.name} - ${game.number || 'jogo'}.pdf`;
    doc.save(fileName);
  } catch (error) {
    log.error('Error generating registration PDF:', error);
    throw error;
  }
};
