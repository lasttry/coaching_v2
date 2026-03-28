import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GameInterface } from '@/types/game/types'; // Make sure you import the correct Game type
import { generateHeader, generateGameDetailsHeader } from './utils';
import { Session } from 'next-auth';

interface Athlete {
  id: number;
  name: string;
  number: string;
  // Add other properties as needed
}

interface Report {
  athleteId: number;
  reviewdAthlete?: {
    name: string;
  };
  teamObservation?: string;
  individualObservation?: string;
  timePlayedObservation?: string;
}

export const generateReportsPDF = async (game: GameInterface, session: Session): Promise<void> => {
  const doc = new jsPDF();

  const athletesResponse = await fetch('/api/athletes');
  const athletes = await athletesResponse.json();
  const reportsResponse = await fetch(`/api/games/${game.id}/reports`);
  const reports = await reportsResponse.json();

  // Add game details to the PDF
  if (!session.user.club) {
    throw new Error('invalid session club...');
  }

  let top = generateHeader(session.user.club, doc);

  top = generateGameDetailsHeader(session.user.club, doc, top, game);

  // Prepare table body
  const tableBody = athletes.flatMap((athlete: Athlete) => {
    const report = reports.find((r: Report) => r.athleteId === athlete.id);
    return [
      ['Atleta:', `${athlete.number === '-1' ? '' : athlete.number + ' - '}${athlete.name}`],
      [
        'Atleta Revisto:',
        report ? (report.reviewdAthlete ? report.reviewdAthlete.name : 'Próprio') : 'NÃO FEZ',
      ],
      ['Observação Equipa:', report ? report.teamObservation : 'NÃO FEZ'],
      ['Observação Individual:', report ? report.individualObservation : 'NÃO FEZ'],
      ['Tempo Jogado:', report ? report.timePlayedObservation : 'NÃO FEZ'],
      [],
    ];
  });

  // Generate the table
  autoTable(doc, {
    body: tableBody,
    theme: 'grid',
    startY: top,
    styles: {
      fontSize: 8, // Set the font size for the entire table
    },
    columnStyles: {
      0: {
        cellWidth: 'auto', // Automatically adjust column width
        overflow: 'linebreak', // Prevent word wrapping
      },
    },
  });

  // Save the PDF
  doc.save(`Game_Reports_${game.id}.pdf`);
};
