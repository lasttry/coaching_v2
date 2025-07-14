import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import { GameInterface, jsPDFWithAutoTable } from '@/types/games/types';

import { ClubInterface } from '@/types/club/types';
import { log } from '@/lib/logger';

export const generateHeader = (club: ClubInterface, doc: jsPDF, top: number = 25): number => {
  // Set font size for H1 equivalent
  doc.setFontSize(24);
  // Add H1-like title on the top left (10 is the X and Y position)
  doc.text(club?.name + ' - ' + club?.season, 10, top);

  // Add image on the top right corner
  const imgWidth = 30; // Set the width for the image
  const imgHeight = 30; // Set the height for the image
  const pageWidth = doc.internal.pageSize.getWidth(); // Get the page width

  // Position the image on the top right, calculating from page width
  if(club !== undefined && club.image !== undefined) {
    doc.addImage(
      club.image,
      //`${settings?.image}`, // Base64 image string
      'PNG', // Image format
      pageWidth - imgWidth - 10, // X position (10px margin from right)
      5, // Y position (top margin)
      imgWidth, // Image width
      imgHeight // Image height
    );
  };
  // Draw a horizontal line (HR) below the title and image
  const lineY = 40; // Y position for the line
  doc.line(10, lineY, pageWidth - 10, lineY); // Draw the line across the page width
  return lineY + 5;
}

export const generateGameDetailsHeader = (
  club: ClubInterface,
  doc: jsPDFWithAutoTable,
  top: number,
  game: GameInterface
): number => {
  log.debug(game)
  autoTable(doc, {
    startY: top,
    head: [],
    body: [
      [
        'Jogo',
        game.number !== null && game.number !== undefined ? `${game.number}` : '',
        'Competição',
        game.competition?.name || '',
      ],
      [
        'Local',
        game.venue?.name || '',
        'Série',
        game.competitionSerie?.name || '',
      ],
      [
        'Adversário',
        game.opponent?.name || '',
        'Data/Hora',
        game.date ? dayjs(game.date).format('YYYY-MM-DD HH:mm') : '',
      ],
    ],
    theme: 'grid',
  });

  // Set font size for H3 equivalent
  return doc.lastAutoTable?.finalY ?? 0; // Get Y position after the table
};
