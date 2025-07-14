import { jsPDF } from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';
import dayjs from 'dayjs';

import { GameInterface, jsPDFWithAutoTable } from '@/types/games/types';
import { generateHeader, generateGameDetailsHeader } from './utils';
import { ClubInterface } from '@/types/club/types';
import { log } from '@/lib/logger';

const lineWidthNormal = 0.1;
const lineWidthBold = 0.5;

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
    return "";
  }
  const parts = fullName.trim().split(' ');
  if (parts.length === 0) return '';

  const firstInitial = parts[0].charAt(0).toUpperCase();
  const lastName = parts[parts.length - 1];

  return `${firstInitial}. ${lastName}`;
};

const athletesTableBody = (game: GameInterface): (string | number | null | undefined)[][] => {
  return game.gameAthletes
    ?.sort((a, b) => {
      // First, sort by number, with -1 always last
      const numberA = parseInt(a.number);
      const numberB = parseInt(b.number);

      if (numberA === -1 && numberB !== -1) return 1;
      if (numberB === -1 && numberA !== -1) return -1;
      if (numberA !== numberB) return numberA - numberB;

      // If numbers are the same, sort by name
      return a.athlete.name.localeCompare(b.athlete.name);
    })
    .map((entry) => [
      formatAthleteName(entry.athlete?.name),
      entry.number === '-1' ? '' : entry.number,
      '',
      entry.period1 ? 'X' : '',
      '',
      entry.period2 ? 'X' : '',
      '',
      entry.period3 ? 'X' : '',
      '',
      entry.period4 ? 'X' : '',
    ]);
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
          content: String(entry[2] ?? ''),
          styles: {
            lineWidth: {
              left: lineWidthBold,
              right: lineWidthNormal,
              top: lineWidthBold,
              bottom: lineWidthBold,
            },
          },
        },
        { content: String(entry[3] ?? '') },
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
          content: String(entry[2] ?? ''),
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
          content: String(entry[3] ?? ''),
          rowSpan: 2,
          styles: {
            lineWidth: {
              bottom: lineWidthBold,
              top: lineWidthNormal,
              right: lineWidthNormal,
              left: lineWidthNormal,
            },
          },
        }, // Athlete's number, spans 2 rows
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

// Helper function to create game details PDF
export const generatePDF = async (game: GameInterface, clubId: number | undefined): void => {

  if(clubId === undefined) {
    log.error("ClubId is missing");
    return;
  }

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

  const club = await fetchClub(clubId);
  if(club === null) {
    log.debug("Failed to find the club");
    return;
  }

  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth(); // Get the page width

  // Generate the page header.
  let top = generateHeader(club, doc);

  top = generateGameDetailsHeader(club, doc, top, game);

  doc.setFontSize(18);
  // Add H3-like title below the table
  const playersText = 'Jogadores';
  doc.text(playersText, 10, top + 8);
  const afterPlayersText = top + 15; // Get the next Y position after the text

  // Define the custom column widths
  const columnWidths = [
    25, // First column (for 6 characters)
    10,
    ...Array(10).fill((pageWidth - 20 - 25 * 2 - 50) / 10), // Last 10 columns, equally wide for a big "X"
  ];
  const columnStyles = columnWidths.reduce((acc, width, index) => {
    acc[index] = {
      cellWidth: width,
      halign: index === 0 ? 'left' : 'center', // Nome is left, rest are centered
    };
    return acc;
  }, {} as Record<number, any>);

  // Add a table with 13 columns
  autoTable(doc, {
    startY: afterPlayersText,
    margin: { left: 10 },
    columnStyles,
    head: [['Nome', '#', '', '1', '', '2', '', '3', '', '4', '']],
    body: athletesTableBody(game)?.map(
      (row) => row.map((cell) => String(cell ?? '')) // Convert null/undefined to ''
    ),
    headStyles: {
      fillColor: club?.backgroundColor, // Background color (RGB)
      textColor: club?.foregroundColor, // Foreground text color (white)
      fontStyle: 'bold', // Optional: make the header text bold
      halign: 'center',
    },
    styles: {
      lineColor: [0, 0, 0], // Black borders
      lineWidth: 0.2, // Border thickness
    },
    theme: 'grid', // Use grid to draw borders
  });

  const afterPlayersTableY = doc.lastAutoTable?.finalY ?? 0;
  // First column: "Resultado" with table
  doc.setFontSize(18);
  doc.text('Resultado', 10, afterPlayersTableY + 10); // Title for first column

  autoTable(doc, {
    startY: afterPlayersTableY + 15, // Position the table below the title
    margin: { left: 10 },
    head: [
      [
        '',
        `${game.away ? game.opponent?.shortName : club.shortName}`,
        `${game.away ? club.shortName : game.opponent?.shortName}`,
      ],
    ],
    body: [
      ['1º Periodo', '', ''],
      ['2º Periodo', '', ''],
      ['3º Periodo', '', ''],
      ['4º Periodo', '', ''],
    ],
    //tableWidth: 'auto',
    columnStyles: {
      0: { cellWidth: 25 }, // First column with automatic width
      1: { cellWidth: 15 }, // Third column with 15 width
      2: { cellWidth: 15 }, // Fourth column with 15 width
    },
    headStyles: {
      fillColor: club?.backgroundColor, // Background color (RGB)
      textColor: club?.foregroundColor, // Foreground text color (white)
      fontStyle: 'bold', // Optional: make the header text bold
    },
    styles: {
      cellPadding: 2,
      halign: 'left',
      lineColor: [0, 0, 0], // Black borders
      lineWidth: 0.2, // Border thickness
    },
    theme: 'grid', // Use grid to draw borders
  });
  const afterResultsTableY = doc.lastAutoTable?.finalY ?? 0;
  // Second column: "Notas" with lorem ipsum text
  doc.setFontSize(18);
  doc.text('Notas', 80, afterPlayersTableY + 10); // Title for second column
  doc.setFontSize(10);

  const loremText = doc.splitTextToSize(`${game.notes === null ? '' : game.notes}`, 120);
  doc.text(loremText, 80, afterPlayersTableY + 15); // Text under the "Notas" header

  doc.setFontSize(18);
  const pageHeight = doc.internal.pageSize.height;
  doc.text('Observações', 10, afterResultsTableY + 10); // Title for second column

  let i = 0; // Start the loop counter
  let currentHeight = afterResultsTableY + 20;
  while (i < 4) {
    // Check if the current Y position exceeds the page height
    if (currentHeight > pageHeight - 5) {
      break;
    }
    doc.line(8, currentHeight, pageWidth - 8, currentHeight);
    currentHeight += 8;
    i++;
  }

  // Goals of the game if there are any.
  if (game.objectives?.length || game.objectives?.length) {
    doc.addPage();

    const groupedObjectives: Record<string, RowInput[]> = {
      TEAM: [],
      OFFENSIVE: [],
      DEFENSIVE: [],
      INDIVIDUAL: [],
    };
    const objectiveTypeHeaders: Record<string, string> = {
      TEAM: 'Objectivos da Equipa',
      OFFENSIVE: 'Objectivos Ofensivos',
      DEFENSIVE: 'Objectivos Defensivos',
      INDIVIDUAL: 'Objectivos Individuais',
    };

    // Group objectives by their type
    game.objectives?.forEach((objective) => {
      const type = objective.type;
      groupedObjectives[type].push(
        [
          {
            content: objective.title,
            styles: { fontStyle: 'bold', fillColor: [230, 230, 230] },
          },
        ], // Title row
        [
          {
            content: objective.description || '',
            styles: { fontStyle: 'normal', fillColor: [255, 255, 255] },
          },
        ] // Description row
      );
    });
    // Draw the table
    let startY = 15;
    Object.entries(groupedObjectives).forEach(([type, rows]) => {
      autoTable(doc, {
        startY: startY, // Position the table below previous content
        margin: { top: 10, left: 10, right: 10 },
        tableWidth: doc.internal.pageSize.getWidth() - 20,
        head: [[objectiveTypeHeaders[type] || type]], // Table header
        body: rows,
        headStyles: {
          fillColor: `backgroundColor`, // Background color (RGB)
          textColor: `foregroundColor`, // Foreground text color (white)
          fontStyle: 'bold', // Optional: make the header text bold
        },
        columnStyles: {
          0: { cellWidth: 'auto', halign: 'left' }, // Adjust title column to auto-width
          1: { cellWidth: 'auto', halign: 'left' }, // Adjust description column to auto-width
        },
      });
      if (doc.lastAutoTable?.finalY) {
        startY = doc.lastAutoTable.finalY; // Position next table 10 points below the previous
      }
    });
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
      fillColor: `backgroundColor`, // Background color (RGB)
      textColor: `foregroundColor`, // Foreground text color (white)
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
