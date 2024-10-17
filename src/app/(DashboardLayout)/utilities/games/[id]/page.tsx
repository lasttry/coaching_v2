'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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

  const params = useParams<{ id: string }>();
  const id = params?.id; // Get id unconditionally
  
  useEffect(() => {

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

  const athletesTableBody = game?.athletes?.map((entry) => [
    entry.fpbNumber === 0 ? '': entry.fpbNumber,
    entry.idNumber === 0 ? '' : entry.idNumber,
    entry.name,
    entry.number === "-1" ? '' : entry.number, 
    '', '', '', '', '', '', '', ''
  ]);

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
      doc.line(10, currentHeight, pageWidth - 10, currentHeight);
      currentHeight += 10;
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
            <Typography key={athlete.id}>
              {athlete.number} - {athlete.name} ({dayjs(athlete.birthdate).format('YYYY')})
            </Typography>
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
        <Button variant="outlined" color="secondary" onClick={() => window.history.back()}>
          Back
        </Button>
      </Stack>
    </PageContainer>
  );
};

export default GameDetails;
