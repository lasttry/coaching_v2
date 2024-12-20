import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import { Settings } from '@/types/settings/types';
import { GameInterface, jsPDFWithAutoTable } from '@/types/games/types';

export const generateHeader = (
  doc: jsPDF,
  settings: Settings | null,
  top: number = 25,
): number => {
  // Set font size for H1 equivalent
  doc.setFontSize(24);
  // Add H1-like title on the top left (10 is the X and Y position)
  doc.text(`${settings?.teamName} - ${settings?.season}`, 10, top);

  // Add image on the top right corner
  const imgWidth = 30; // Set the width for the image
  const imgHeight = 30; // Set the height for the image
  const pageWidth = doc.internal.pageSize.getWidth(); // Get the page width

  // Position the image on the top right, calculating from page width
  doc.addImage(
    `${settings?.image}`, // Base64 image string
    'PNG', // Image format
    pageWidth - imgWidth - 10, // X position (10px margin from right)
    5, // Y position (top margin)
    imgWidth, // Image width
    imgHeight, // Image height
  );
  // Draw a horizontal line (HR) below the title and image
  const lineY = 40; // Y position for the line
  doc.line(10, lineY, pageWidth - 10, lineY); // Draw the line across the page width
  return lineY + 5;
};

export const generateGameDetailsHeader = (
  doc: jsPDFWithAutoTable,
  top: number,
  game: GameInterface,
  settings: Settings | null,
): number => {
  autoTable(doc, {
    startY: top, // Start the table below the HR line
    head: [], // Table headers
    body: [
      ['Jogo', `${game.number}`, 'Competição', `${game.competition}`],
      [
        'Local',
        `${game.away ? game.oponent?.location : settings?.homeLocation}`,
        '',
        `${game.subcomp}`,
      ],
      [
        'Adversário',
        `${game.oponent?.name}`,
        'Data/Hora',
        `${dayjs(game.date).format('YYYY-MM-DD HH:mm')}`,
      ],
    ],
    theme: 'grid', // Use grid to draw borders
  });

  // Set font size for H3 equivalent
  return doc.lastAutoTable?.finalY ?? 0; // Get Y position after the table
};
