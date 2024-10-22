'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Typography, Box, Stack, CircularProgress } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { jsPDF } from 'jspdf'; // Import jsPDF for PDF generation
import dayjs from 'dayjs';
import autoTable from 'jspdf-autotable';

// Define the types for game and teams
interface Game {
  id: number;
  number: number;
  date: string;
  away: boolean;
  competition?: string;
  subcomp?: string;
  notes?: string;
  teams?: {
    name: string;
    shortName: string;
    image: string;
    location: string;
  };
  athletes?: {
    id: number;
    fpbNumber: number;
    idNumber: number;
    name: string;
    number: string;
    birthdate: string;
  }[];
}
interface Settings {
  id: string;
  teamName: string;
  shortName: string;
  season: string;
  homeLocation: string;
  image: string; // Base64 string for the image
  backgroundColor: string;
  foregroundColor: string;
}
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

const GameDetails = () => {

  const [game, setGame] = useState<Game | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playtime, setPlaytime] = useState<Record<number, number>>({});

  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id; // Get id unconditionally

  const lineWidthNormal = 0.1
  const lineWidthBold = 0.5
  
  useEffect(() => {

    async function fetchPlaytimeData() {
      try {
        // Fetch total play time with period breakdown
        const playtimeResponse = await fetch(`/api/games/${id}/times/playtime`);
        if (playtimeResponse.ok) {
          const playtimeData = await playtimeResponse.json();
  
          // Create a map of playtime data by athleteId
          const playtimeMap = playtimeData.reduce((acc: Record<number, { totalTimePlayed: number, periods: Record<number, number> }>, entry: { athleteId: number, totalTimePlayed: number, periods: Record<number, number> }) => {
            acc[entry.athleteId] = {
              totalTimePlayed: entry.totalTimePlayed,
              periods: entry.periods
            };
            return acc;
          }, {});
          setPlaytime(playtimeMap);  // Set playtime data for athletes
        }
      } catch (error) {
        console.error('Failed to fetch playtime data:', error);
      }
    }
  
    fetchPlaytimeData();

    async function fetchGameDetails() {
      try {
        const response = await fetch(`/api/games/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch game details');
        }
  
        const gameData = await response.json();
        setGame({
          ...gameData.game,
          athletes: gameData.game.athletes || [], // Ensure athletes is always an array
          teams: gameData.game.teams || { name: 'Unknown Team' }, // Default team name
        });
        setSettings(gameData.settings);
  
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load game details.');
        setLoading(false);
      }
    }
  
    fetchGameDetails();
    
    async function fetchGame() {
      try {
        const response = await fetch(`/api/games/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch game details');
        }
        
        const gameData = await response.json();

        console.log('Fetched Game Data:', gameData); // Log to ensure correct data
        setGame({
          ...gameData.game,
          athletes: gameData.game.athletes || [],  // Ensure athletes is always an array
          teams: gameData.game.teams || { name: 'Unknown Team' }, // Default team name
        });
        setSettings(gameData.settings);
        setLoading(false);
      } catch (err) {
        console.error(err)
        setError('Failed to load game details.');
        setLoading(false);
      }
    }
  
    fetchGame();
  }, [id]);

  const athletesTableBody = game?.athletes
  ?.sort((a, b) => {
    // First, sort by number, with -1 always last
    const numberA = parseInt(a.number);
    const numberB = parseInt(b.number);

    if (numberA === -1 && numberB !== -1) return 1;
    if (numberB === -1 && numberA !== -1) return -1;
    if (numberA !== numberB) return numberA - numberB;

    // If numbers are the same, sort by name
    return a.name.localeCompare(b.name);
  })
  .map((entry) => [
    entry.fpbNumber === 0 ? '' : entry.fpbNumber,
    entry.idNumber === 0 ? '' : entry.idNumber,
    entry.name,
    entry.number === "-1" ? '' : entry.number, 
    '', '', '', '', '', '', '', ''
  ]);

  const generateCells = (contentOrArray: string | string[], numberOfCells: number) => {
    const isArray = Array.isArray(contentOrArray);
    return Array.from({ length: numberOfCells }, (v, i) => ({
      content: isArray ? contentOrArray[i] || '' : contentOrArray,  // Use content from array or default to uniform content
      styles: {
        lineWidth: {
          bottom: lineWidthBold,
          left: i === 0 ? lineWidthBold : lineWidthNormal,  // Left border for the first element
          right: i === numberOfCells - 1 ? lineWidthBold : lineWidthNormal,  // Right border for the last element
        },
      },
    }));
  };

  const statisticsAthletesTableBody = athletesTableBody?.flatMap((entry) => {
    return [
      [
        { content: entry[2], rowSpan: 2, styles: { lineWidth: { left: lineWidthBold, bottom: lineWidthBold, top: lineWidthNormal, right: lineWidthNormal}}}, // Athlete's name, spans 2 rows
        { content: entry[3], rowSpan: 2, styles: { lineWidth: { bottom: lineWidthBold, top: lineWidthNormal, right: lineWidthNormal, left: lineWidthNormal}}}, // Athlete's number, spans 2 rows
        '1', '1', '1', '1', '1', '1', '1', '1', '1', '1',
        '2', '2', '2', '2', '2', '2', '2', '2', '2', '2',
        '3', '3', '3', '3', '3',
        '', '', '', '', '',
        '', '', '', '', '',
        '', '', '', '', '',
        '', '', '',
        '', '', '',
        '', '', '', '',
        '1', '2', { content: '3', styles: { lineWidth: { right: lineWidthBold, top: lineWidthNormal, left: lineWidthNormal, bottom: lineWidthNormal}}},
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
      ]
    ];
  });
  
  
  
  const timedPeriod = () => {
    return [
      { content: '', styles: { lineWidth: { left: lineWidthBold, right: lineWidthNormal, top: lineWidthBold, bottom: lineWidthBold } } }, // Period
      '', // Minute
      '', // Second
      '', // Period
      '', // Minute
      { content: '', styles: { lineWidth: { right: lineWidthBold, left: lineWidthNormal, top: lineWidthBold, bottom: lineWidthBold } } }, // Period
    ];
  };
  const timedAthletesTableBody = athletesTableBody?.flatMap((entry) => {
    return [
      [
        { content: entry[2], styles: { lineWidth: { left: lineWidthBold, right: lineWidthNormal, top: lineWidthBold, bottom: lineWidthBold } }}, // Athlete's name
        { content: entry[3]}, // Athlete's number
        ...timedPeriod(),
        ...timedPeriod(),
        ...timedPeriod(),
        ...timedPeriod(),
        ...timedPeriod(),
        ...timedPeriod(),
      ]
    ];
  });

  const statisticsTimesHeaderStyle = (text: string, colSpan: number) => {
    const cell = {
      content: text,                // Text content
      colSpan: colSpan,             // Set the colspan for the cell
      styles: {
        fontSize: 8,               // Set font size
        cellPadding: 0,             // Padding for all sides
        halign: 'center' as const,           // Horizontal alignment: 'left', 'center', 'right'
      }
    };
    // Add colSpan only if it's greater than 0
    if (colSpan > 0) {
      cell.colSpan = colSpan;
    }
    return cell;
  };

  const generateStatistcsPDF = () => {
    if (!game) return;
    const doc = new jsPDF({
      orientation: "landscape",
    }) as jsPDFWithAutoTable;

    autoTable(doc, {
      startY: 2,  
      margin: { left: 10 },
      head: [], // Table headers
      body: [
        ['Jogo', `${game.number}`, 'Data/Hora', `${dayjs(game.date).format('YYYY-MM-DD HH:mm')}`, 'Adversário', `${game.teams?.name}`],
      ],
      theme: 'grid', // Use grid to draw borders
    });
    let afterTableY = doc.lastAutoTable?.finalY ?? 0; // Get Y position after the table

    autoTable(doc, {
      startY: afterTableY,
      margin: { left: 10, right: 10 },
      head: [[{ content: 'Atleta', colSpan: 2, styles: { halign: 'center' } }, 
        { content: 'FT', colSpan: 10, styles: { halign: 'center' }, },
        { content: 'FG', colSpan: 10, styles: { halign: 'center' }, },
        { content: '3PTS', colSpan: 5, styles: { halign: 'center' }, },
        { content: 'A', colSpan: 5, styles: { halign: 'center' }, },
        { content: 'DR', colSpan: 5, styles: { halign: 'center' }, },
        { content: 'OR', colSpan: 5, styles: { halign: 'center' }, },
        { content: 'BL', colSpan: 3, styles: { halign: 'center' }, },
        { content: 'STL', colSpan: 3, styles: { halign: 'center' }, },
        { content: 'TO', colSpan: 4, styles: { halign: 'center' }, },
        { content: 'Fauls', colSpan: 3, styles: { halign: 'center' }, },
      ]],
      body: statisticsAthletesTableBody,
      theme: 'grid',
      headStyles: {
        fillColor: `${settings?.backgroundColor}`,  // Background color (RGB)
        textColor: `${settings?.foregroundColor}`,  // Foreground text color (white)
        fontStyle: 'bold',  // Optional: make the header text bold
      },
      bodyStyles: { 
        fontSize: 8,
        cellPadding: {
          top: 0,      // Padding for the top
          right: 1,   // Padding for the right
          bottom: 0,   // Padding for the bottom
          left: 1     // Padding for the left
        },
        halign: 'center',
        valign: 'middle',
      },
      styles: {
        lineColor: [0, 0, 0], // Black borders
        lineWidth: 0.1, // Border thickness
      },
      columnStyles: {
        2: { lineWidth: { left: lineWidthBold, right: lineWidthNormal, top: lineWidthNormal, bottom: lineWidthNormal }},
        12: { lineWidth: { left: lineWidthBold, right: lineWidthNormal, top: lineWidthNormal, bottom: lineWidthNormal }},
        22: { lineWidth: { left: lineWidthBold, right: lineWidthNormal, top: lineWidthNormal, bottom: lineWidthNormal }},
        27: { lineWidth: { left: lineWidthBold, right: lineWidthNormal, top: lineWidthNormal, bottom: lineWidthNormal }},
        32: { lineWidth: { left: lineWidthBold, right: lineWidthNormal, top: lineWidthNormal, bottom: lineWidthNormal }},
        37: { lineWidth: { left: lineWidthBold, right: lineWidthNormal, top: lineWidthNormal, bottom: lineWidthNormal }},
        42: { lineWidth: { left: lineWidthBold, right: lineWidthNormal, top: lineWidthNormal, bottom: lineWidthNormal }},
        45: { lineWidth: { left: lineWidthBold, right: lineWidthNormal, top: lineWidthNormal, bottom: lineWidthNormal }},
        48: { lineWidth: { left: lineWidthBold, right: lineWidthNormal, top: lineWidthNormal, bottom: lineWidthNormal }},
        52: { lineWidth: { left: lineWidthBold, right: lineWidthNormal, top: lineWidthNormal, bottom: lineWidthNormal }},
        55: { lineWidth: { left: lineWidthBold, right: lineWidthNormal, top: lineWidthNormal, bottom: lineWidthNormal }},
      },
      didParseCell: function (data) {
        // Apply the background color only to the body rows (ignoring the header)
        if (data.row.section === 'body' && (data.row.index % 4 === 0 || data.row.index % 4 === 1)) {
          data.cell.styles.fillColor = [240, 240, 240]; // Light gray color
        }
      }
    })
    afterTableY = doc.lastAutoTable?.finalY ?? 0; // Get Y position after the table
    autoTable(doc, {
      startY: afterTableY + 1,
      margin: { left: 10, right: 10 },
      //head: [[{ content: 'Equipa', colSpan: 40, styles: { halign: 'center' }, }]],
      body: [
        ['DR Lost', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']
      ],
      theme: 'grid',
      headStyles: {
        fillColor: `${settings?.backgroundColor}`,  // Background color (RGB)
        textColor: `${settings?.foregroundColor}`,  // Foreground text color (white)
        fontStyle: 'bold',  // Optional: make the header text bold
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
    })
    afterTableY = doc.lastAutoTable?.finalY ?? 0; // Get Y position after the table
    autoTable(doc, {
      startY: afterTableY + 3,
      margin: { left: 10, right: 10 },
      head: [
        [{ content: 'Tempos', colSpan: 38, styles: { halign: 'center' }, }],
        [ statisticsTimesHeaderStyle('', 2),
          statisticsTimesHeaderStyle('In', 3), statisticsTimesHeaderStyle('Out', 3), 
          statisticsTimesHeaderStyle('In', 3), statisticsTimesHeaderStyle('Out', 3), 
          statisticsTimesHeaderStyle('In', 3), statisticsTimesHeaderStyle('Out', 3), 
          statisticsTimesHeaderStyle('In', 3), statisticsTimesHeaderStyle('Out', 3), 
          statisticsTimesHeaderStyle('In', 3), statisticsTimesHeaderStyle('Out', 3), 
          statisticsTimesHeaderStyle('In', 3), statisticsTimesHeaderStyle('Out', 3), 
        ],
        [ statisticsTimesHeaderStyle('', 2),
          statisticsTimesHeaderStyle('P', 0), statisticsTimesHeaderStyle('M', 0), statisticsTimesHeaderStyle('S', 0),
          statisticsTimesHeaderStyle('P', 0), statisticsTimesHeaderStyle('M', 0), statisticsTimesHeaderStyle('S', 0),
          statisticsTimesHeaderStyle('P', 0), statisticsTimesHeaderStyle('M', 0), statisticsTimesHeaderStyle('S', 0),
          statisticsTimesHeaderStyle('P', 0), statisticsTimesHeaderStyle('M', 0), statisticsTimesHeaderStyle('S', 0),
          statisticsTimesHeaderStyle('P', 0), statisticsTimesHeaderStyle('M', 0), statisticsTimesHeaderStyle('S', 0),
          statisticsTimesHeaderStyle('P', 0), statisticsTimesHeaderStyle('M', 0), statisticsTimesHeaderStyle('S', 0),
          statisticsTimesHeaderStyle('P', 0), statisticsTimesHeaderStyle('M', 0), statisticsTimesHeaderStyle('S', 0),
          statisticsTimesHeaderStyle('P', 0), statisticsTimesHeaderStyle('M', 0), statisticsTimesHeaderStyle('S', 0),
          statisticsTimesHeaderStyle('P', 0), statisticsTimesHeaderStyle('M', 0), statisticsTimesHeaderStyle('S', 0),
          statisticsTimesHeaderStyle('P', 0), statisticsTimesHeaderStyle('M', 0), statisticsTimesHeaderStyle('S', 0),
          statisticsTimesHeaderStyle('P', 0), statisticsTimesHeaderStyle('M', 0), statisticsTimesHeaderStyle('S', 0),
          statisticsTimesHeaderStyle('P', 0), statisticsTimesHeaderStyle('M', 0), statisticsTimesHeaderStyle('S', 0),
        ]
      ],
      body: timedAthletesTableBody,
      theme: 'grid',
      headStyles: {
        fillColor: `${settings?.backgroundColor}`,  // Background color (RGB)
        textColor: `${settings?.foregroundColor}`,  // Foreground text color (white)
        fontStyle: 'bold',  // Optional: make the header text bold
      },
      styles: {
        lineColor: [0, 0, 0], // Black borders
        lineWidth: {
          left: lineWidthNormal,
          right: lineWidthNormal,
          bottom: lineWidthBold,
          top: lineWidthBold
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
      }
    })    

    doc.save(`Folha_de_Estatisticas_${game.id}.pdf`);
    return;    
  };

  // Function to generate the PDF
  const generatePDF = () => {
    if (!game) return;

    const doc = new jsPDF() as jsPDFWithAutoTable;

    // Set font size for H1 equivalent
    doc.setFontSize(24);
    // Add H1-like title on the top left (10 is the X and Y position)
    doc.text(`${settings?.teamName} - ${settings?.season}`, 10, 25);

    // Add image on the top right corner
    const imgWidth = 30; // Set the width for the image
    const imgHeight = 30; // Set the height for the image
    const pageWidth = doc.internal.pageSize.getWidth(); // Get the page width

    // Position the image on the top right, calculating from page width
    doc.addImage(
      `${settings?.image}`,  // Base64 image string
      'PNG',       // Image format
      pageWidth - imgWidth - 10,  // X position (10px margin from right)
      5,          // Y position (top margin)
      imgWidth,    // Image width
      imgHeight    // Image height
    );
    // Draw a horizontal line (HR) below the title and image
    const lineY = 40;  // Y position for the line
    doc.line(10, lineY, pageWidth - 10, lineY);  // Draw the line across the page width

    // Add a table with 4 columns and 3 rows
    const tableY = lineY + 5;  // Position the table a bit below the line
    autoTable(doc, {
      startY: tableY,  // Start the table below the HR line
      head: [], // Table headers
      body: [
        ['Jogo', `${game.number}`, 'Competição', `${game.competition}`],
        ['Local', `${game.away ? game.teams?.location : settings?.homeLocation}`, '', `${game.subcomp}`],
        ['Adversário', `${game.teams?.name}`, 'Data/Hora', `${dayjs(game.date).format('YYYY-MM-DD HH:mm')}`],
      ],
      theme: 'grid', // Use grid to draw borders
    });

    // Set font size for H3 equivalent
    const afterTableY = doc.lastAutoTable?.finalY ?? 0; // Get Y position after the table
    doc.setFontSize(18);
    // Add H3-like title below the table
    const playersText = 'Jogadores';
    doc.text(playersText, 10, afterTableY + 8);
    const afterPlayersText = afterTableY + 15; // Get the next Y position after the text
    
    // Define the custom column widths
    const columnWidths = [
      20,  // First column (for 6 characters)
      20,  // Second column (for 6 characters)
      50,  // Third column (for full name like "Gamaliel Luqueni")
      ...Array(10).fill((pageWidth - 20 - (25 * 2) - 50)/10),  // Last 10 columns, equally wide for a big "X"
    ];
    // Add a table with 13 columns
    autoTable(doc, {
      startY: afterPlayersText,
      margin: { left: 10 },
      columnStyles: {
        0: { cellWidth: columnWidths[0] },  // First column
        1: { cellWidth: columnWidths[1] },  // Second column
        2: { cellWidth: columnWidths[2] },  // Third column
        3: { cellWidth: columnWidths[3], halign: 'center' },  // Fourth to 13th columns
        4: { cellWidth: columnWidths[3] },
        5: { cellWidth: columnWidths[3], halign: 'center' },
        6: { cellWidth: columnWidths[3] },
        7: { cellWidth: columnWidths[3], halign: 'center' },
        8: { cellWidth: columnWidths[3] },
        9: { cellWidth: columnWidths[3], halign: 'center' },
        10: { cellWidth: columnWidths[3] },
        11: { cellWidth: columnWidths[3], halign: 'center' },
        12: { cellWidth: columnWidths[3] },
      },
      head:[['FPB', 'CC', 'Nome', '#', '', '1', '', '2', '', '3', '', '4', '']],
      body: athletesTableBody,
      headStyles: {
        fillColor: `${settings?.backgroundColor}`,  // Background color (RGB)
        textColor: `${settings?.foregroundColor}`,  // Foreground text color (white)
        fontStyle: 'bold',  // Optional: make the header text bold
      },
      styles: {
        lineColor: [0, 0, 0], // Black borders
        lineWidth: 0.2, // Border thickness
      },
      theme: 'grid',  // Use grid to draw borders
    });
    
    const afterPlayersTableY = doc.lastAutoTable?.finalY ?? 0;
    // First column: "Resultado" with table
    doc.setFontSize(18);
    doc.text('Resultado', 10, afterPlayersTableY + 10); // Title for first column

    autoTable(doc, {
      startY: afterPlayersTableY + 15, // Position the table below the title
      margin: { left: 10 },
      head: [['', `${ game.away ? game.teams?.shortName : settings?.shortName }`, `${ game.away ? settings?.shortName : game.teams?.shortName }`]],
      body: [
        ['1º Periodo', '', ''],
        ['2º Periodo', '', ''],
        ['3º Periodo', '', ''],
        ['4º Periodo', '', ''],
      ],
      tableWidth: 'auto',
      columnStyles: {
        0: { cellWidth: 30 }, // First column with automatic width
        1: { cellWidth: 15 }, // Third column with 15 width
        2: { cellWidth: 15 }  // Fourth column with 15 width
      },
      headStyles: {
        fillColor: `${settings?.backgroundColor}`,  // Background color (RGB)
        textColor: `${settings?.foregroundColor}`,  // Foreground text color (white)
        fontStyle: 'bold',  // Optional: make the header text bold
      },
      styles: {
        cellPadding: 2,
        halign: 'left',
        lineColor: [0, 0, 0], // Black borders
        lineWidth: 0.2, // Border thickness
      },
      theme: 'grid',  // Use grid to draw borders
    });

    const afterResultsTableY = doc.lastAutoTable?.finalY ?? 0;
    // Second column: "Notas" with lorem ipsum text
    doc.setFontSize(18);
    doc.text('Notas', 120, afterPlayersTableY + 10); // Title for second column
    doc.setFontSize(12);

    const loremText = doc.splitTextToSize(`${game.notes === null ? "" : game.notes}`, 80);
    doc.text(loremText, 120, afterPlayersTableY + 15); // Text under the "Notas" header

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

    doc.save(`Folha_de_Jogo_${game.id}.pdf`);
    return;
  };

  if (loading) {
    return (
      <PageContainer title="Game Details">
        <CircularProgress />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Game Details">
        <Typography color="error">{error}</Typography>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Game Details" description="Details of the game">
      <Typography variant="h4" gutterBottom>
        Game Details
      </Typography>

      {/* Game Information */}
      <Box marginY={2}>
        <Typography variant="body1"><strong>Number:</strong> {game?.number || 'N/A'}</Typography>
        <Typography variant="body1"><strong>Date:</strong> {dayjs(game?.date).format('YYYY-MM-DD HH:mm')}</Typography>
        <Typography variant="body1"><strong>Opponent:</strong> {game?.teams?.name || 'N/A'}</Typography>
        <Typography variant="body1"><strong>Competition:</strong> {game?.competition || 'N/A'}</Typography>
        <Typography variant="body1"><strong>Subcompetition:</strong> {game?.subcomp || 'N/A'}</Typography>
        <Typography variant="body1"><strong>Notes:</strong> {game?.notes || 'No notes'}</Typography>
        <Typography variant="body1"><strong>Away Game:</strong> {game?.away ? 'Yes' : 'No'}</Typography>
      </Box>

{/* Athletes Information */}
<Typography variant="h5" gutterBottom>
  Athletes
</Typography>
<Box marginY={2}>
  {game?.athletes?.length ? (
    game.athletes.map((athlete) => (
      <Box key={athlete.id} marginY={1}>
        {/* Display Athlete Info */}
        <Typography>
          {athlete.number} - {athlete.name} ({dayjs(athlete.birthdate).format('YYYY')}) - Total Time Played: {playtime[athlete.id] ? `${Math.floor(playtime[athlete.id].totalTimePlayed / 60)}m ${playtime[athlete.id].totalTimePlayed % 60}s` : '0m 0s'}
        </Typography>

        {/* Display Time Played Per Period */}
        <Typography variant="body2" color="textSecondary">
          {Object.keys(playtime[athlete.id]?.periods || {}).map((period) => (
            <span key={`${athlete.id}-period-${period}`}>
              Period {period}: {playtime[athlete.id].periods[period] ? `${Math.floor(playtime[athlete.id].periods[period] / 60)}m ${playtime[athlete.id].periods[period] % 60}s` : '0m 0s'}{' '}
            </span>
          ))}
        </Typography>
      </Box>
    ))
  ) : (
    <Typography>No athletes listed</Typography>
  )}
</Box>
      {/* Button to generate PDF */}
      <Stack direction="row" spacing={2} marginTop={4}>
        <Button variant="contained" color="primary" onClick={generatePDF}>
          Folha de Jogo
        </Button>
        <Button variant="contained" color="primary" onClick={generateStatistcsPDF}>
          Folha de Estatisticas
        </Button>
        {/* New button to add statistics */}
        <Button variant="contained" color="primary" onClick={() => router.push(`/utilities/games/${id}/statistics`)}>
          Add Statistics
        </Button>
        <Button variant="contained" color="primary" onClick={() => router.push(`/utilities/games/${id}/time`)}>
          Manage Play Times
        </Button>
          {/* New button to manage athlete reports */}
          <Button variant="contained" color="primary" onClick={() => router.push(`/utilities/games/${id}/reports`)}>
            Manage Reports
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => window.history.back()}>
          Back
        </Button>
      </Stack>
    </PageContainer>
  );
};

export default GameDetails;
