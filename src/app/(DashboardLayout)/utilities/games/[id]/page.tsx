'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import dayjs from 'dayjs';

// Define types for athletes and game data
interface Athlete {
  id: number;
  fpbNumber: number;
  idNumber: number;
  name: string;
  number: string;
}

interface Game {
  id: number;
  number: number;
  competition: string;
  subcomp: string;
  date: string;
  away: boolean;
  notes: string;
  oponent: {
    name: string;
    location: string;
  };
  athletes: Athlete[];
}

interface Settings {
  teamName: string;
  season: string;
  homeLocation: string;
}

const GameDetailsPage = () => {
  const params = useParams<{ id: string }>();

  if (!params?.id) {
    console.error('id is missing');
    return <div>Error: id not found</div>;
  }

  const { id } = params;
  const [game, setGame] = useState<Game | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  // Fetch game details from the API
  useEffect(() => {
    async function fetchGameData() {
      try {
        const response = await fetch(`/api/games/${id}`);
        const data = await response.json();
        setGame(data.game);
        setSettings(data.settings);
      } catch (error) {
        console.error('Failed to fetch game data:', error);
      }
    }

    if (id) {
      fetchGameData();
    }
  }, [id]);

  if (!game || !settings) return <div>Loading...</div>;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h2">
          {settings.teamName} - {settings.season}
        </Typography>
        <Image src="/logo.png" alt="logo" width={100} height={100} />
      </Box>

      {/* Game Info */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small" aria-label="game-info">
          <TableBody>
            <TableRow>
              <TableCell>Jogo</TableCell>
              <TableCell>{game.number}</TableCell>
              <TableCell>Competição</TableCell>
              <TableCell>{game.competition}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Local</TableCell>
              <TableCell>{game.away ? game.oponent.location : settings.homeLocation}</TableCell>
              <TableCell>Série</TableCell>
              <TableCell>{game.subcomp}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Adversário</TableCell>
              <TableCell>{game.oponent.name}</TableCell>
              <TableCell>Data/Hora</TableCell>
              <TableCell>{dayjs(game.date).format('YYYY-MM-DD HH:mm')}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Athletes */}
      <Typography variant="h4" sx={{ mt: 3 }}>Jogadores</Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small" aria-label="athletes">
          <TableHead>
            <TableRow>
              <TableCell>FPB</TableCell>
              <TableCell>CC</TableCell>
              <TableCell>Jogador</TableCell>
              <TableCell>#</TableCell>
              <TableCell>1</TableCell>
              <TableCell>2</TableCell>
              <TableCell>3</TableCell>
              <TableCell>4</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {game.athletes.map((athlete) => (
              <TableRow key={athlete.id}>
                <TableCell>{athlete.fpbNumber}</TableCell>
                <TableCell>{athlete.idNumber === 0 ? '' : athlete.idNumber}</TableCell>
                <TableCell>{athlete.name}</TableCell>
                <TableCell>{athlete.number}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Result */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4">Resultado</Typography>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small" aria-label="result">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell align="center">{game.away ? game.oponent.name : settings.teamName}</TableCell>
                <TableCell align="center">{!game.away ? game.oponent.name : settings.teamName}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>1º Periodo</TableCell>
                <TableCell align="center"></TableCell>
                <TableCell align="center"></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2º Periodo</TableCell>
                <TableCell align="center"></TableCell>
                <TableCell align="center"></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>3º Periodo</TableCell>
                <TableCell align="center"></TableCell>
                <TableCell align="center"></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>4º Periodo</TableCell>
                <TableCell align="center"></TableCell>
                <TableCell align="center"></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Notes */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h5">Notas</Typography>
        <Typography variant="body1">{game.notes}</Typography>
      </Box>
    </Box>
  );
};

export default GameDetailsPage;
