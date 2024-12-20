'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Typography,
  Box,
} from '@mui/material';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import dayjs from 'dayjs';
import { GameInterface } from '@/types/games/types';

const GamesList = () => {
  const [games, setGames] = useState<GameInterface[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Fetch the list of games from the API
  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await fetch('/api/games'); // Fetching games from the API
        const data: GameInterface[] = await response.json();
        setGames(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch games.');
      }
    }

    fetchGames();
  }, []);

  // Handle game deletion
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete game ID ${id}?`,
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/games/${id}`, { method: 'DELETE' });

      if (response.ok) {
        setSuccess(`Game ID ${id} deleted successfully.`);
        setGames((prevGames) => prevGames.filter((game) => game.id !== id));
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        setError('Failed to delete game.');
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Error deleting game:', err);
      setError('An error occurred while deleting the game.');
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  return (
    <div suppressHydrationWarning={true}>
      <PageContainer title="Games" description="List of all games">
        <h1>Games</h1>
        <Link href="/utilities/games/manage/new">
          <Button variant="contained" color="primary">
            Add New Game
          </Button>
        </Link>

        {/* Success/Error Messages */}
        {success ? (
          <Typography
            variant="body1"
            sx={{ color: (theme) => theme.palette.success.main }}
          >
            {success}
          </Typography>
        ) : (
          <></>
        )}
        {error ? (
          <Typography
            variant="body1"
            sx={{ color: (theme) => theme.palette.error.main }}
          >
            {error}
          </Typography>
        ) : (
          <></>
        )}

        {/* Games Table */}
        <DashboardCard title="Jogos">
          <Box sx={{ overflow: 'auto', mt: 2 }}>
            <Box sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}>
              <Table
                sx={{
                  whiteSpace: 'nowrap',
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Date
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Opponent
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Competition
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Away
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" fontWeight={600}>
                        Actions
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {games.map((game) => (
                    <TableRow
                      key={game.id}
                      hover
                      onClick={() => router.push(`/utilities/games/${game.id}`)} // Navigate to game details or edit page on row click
                      sx={{ cursor: 'pointer' }} // Change cursor to indicate it's clickable
                    >
                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: '15px',
                            fontWeight: '500',
                          }}
                        >
                          {dayjs(game.date).format('YYYY-MM-DD HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: '15px',
                            fontWeight: '500',
                          }}
                        >
                          {game.oponent?.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: '14px',
                            color: 'textSecondary',
                          }}
                        >
                          {game.competition || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: '14px',
                            color: 'textSecondary',
                          }}
                        >
                          {game.away ? 'Yes' : 'No'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={2}>
                          {/* Edit Game Link */}
                          <Link
                            href={`/utilities/games/manage/${game.id}`}
                            passHref
                          >
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Edit
                            </Button>
                          </Link>

                          {/* Delete Game Button */}
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent the row click event
                              handleDelete(game.id ? game.id : -1);
                            }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </DashboardCard>
      </PageContainer>
    </div>
  );
};

export default GamesList;
