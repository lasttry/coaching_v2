import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GameInterface } from '@/types/games/types'; // Make sure you import the correct Game type
import { generateHeader, generateGameDetailsHeader } from './utils';

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

export const generateReportsPDF = async (game: GameInterface): Promise<void> => {
  const doc = new jsPDF();

  const athletesResponse = await fetch('/api/athletes');
  const athletes = await athletesResponse.json();
  const reportsResponse = await fetch(`/api/games/${game.id}/reports`);
  const reports = await reportsResponse.json();
  const settingsResponse = await fetch('/api/settings');
  const settings = await settingsResponse.json();

  // Add game details to the PDF
  let top = generateHeader(doc, settings);

  top = generateGameDetailsHeader(doc, top, game);

  // Prepare table body
  const tableBody = athletes.flatMap((athlete: Athlete) => {
    const report = reports.find((r: Report) => r.athleteId === athlete.id);
    //console.log(report.reviewdAthlete)
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
