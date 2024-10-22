import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

interface Game {
  id: number;
  number: number;
  date: string;
  teams?: {
    name: string;
  };
}

interface Settings {
  backgroundColor: string;
  foregroundColor: string;
}

// Define your jsPDFWithAutoTable type if needed
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export const generateStatistcsPDF = (game: Game, settings: Settings) => {
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

  // Further table generation logic here...

  doc.save(`Folha_de_Estatisticas_${game.id}.pdf`);
};
