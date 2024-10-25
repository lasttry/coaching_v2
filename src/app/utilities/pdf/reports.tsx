import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Game, Report } from '@/types/games/types';  // Make sure you import the correct Game type
import { generateHeader, generateGameDetailsHeader } from './utils'

// Assuming the Game and Athlete types
interface Athlete {
  id: number;
  name: string;
  number: string;
}

//interface Report {
//  athleteId: number;
//  teamObservation?: string;
//}

export const generateReportsPDF = async (game: Game) => {
  const doc = new jsPDF();

  const athletesResponse = await fetch('/api/athletes');
  const athletes = await athletesResponse.json();
  const reportsResponse = await fetch(`/api/games/${game.id}/reports`);
  const reports = await reportsResponse.json();
  const settingsResponse = await fetch('/api/settings');
  const settings = await settingsResponse.json();


  // Add game details to the PDF
  console.log(game)
  let top = generateHeader(doc, settings);

  top = generateGameDetailsHeader(doc, top, game, settings)
  
  // Prepare table headers
  const tableHead = [['Athlete Number', 'Athlete Name', 'Team Observation', 'Individual Observation', 'Time Played Observation']];

  // Prepare table body
  const tableBody = athletes.flatMap((athlete: Athlete) => {
    const report = reports[athlete.id];
    return [
      ["atleta:", `${athlete.number} - ${athlete.name}`,],
      ["Observação Equipa:", report ? report.teamObservation : 'NÃO FEZ'],
      ["Observação Individual:", report ? report.individualObservation : 'NÃO FEZ'],
      ["Tempo Jogado:", report ? report.timePlayedObservation : 'NÃO FEZ'],
      []
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

