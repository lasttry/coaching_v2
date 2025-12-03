'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { GameInterface } from '@/types/game/types';
import { log } from '@/lib/logger';
import GameComponent from './components/Game';
import { generatePDF } from '@/app/utilities/pdf/pdfUtils';

const GamesPage: React.FC = () => {
  const { t } = useTranslation();

  const { data: session } = useSession();

  const [games, setGames] = useState<GameInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editGame, setEditGame] = useState<GameInterface | null>(null);

  // 👇 novo estado para o jogo a adicionar
  const [newGame, setNewGame] = useState<GameInterface>({
    id: null,
    date: new Date(),
    away: false,
    gameAthletes: [],
    clubId: 0,
  });

  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set(),
  });

  const fetchGames = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch('/api/games');
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch games');
      setGames(
        data.games.sort(
          (a: GameInterface, b: GameInterface) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
    } catch (err) {
      log.error('Error fetching games:', err);
      setErrorMessage(t('ErrorFetchingGames'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleDeleteGame = async (id: number): Promise<void> => {
    try {
      const res = await fetch(`/api/games/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setSuccessMessage(t('GameDeletedSuccessfully'));
      fetchGames();
    } catch (err) {
      log.error('Error deleting game:', err);
      setErrorMessage(t('ErrorDeletingGame'));
    }
  };

  const handleAddGame = async (game: GameInterface): Promise<void> => {
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(game),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to save game');
      setSuccessMessage(t('GameCreatedSuccessfully'));

      // reset state
      setOpenAddDialog(false);
      setNewGame({ id: null, date: new Date(), away: false, gameAthletes: [], clubId: 0 });

      fetchGames();
    } catch (err) {
      log.error('Error creating game:', err);
      setErrorMessage(t('ErrorCreatingGame'));
    }
  };

  const handleUpdateGame = async (game: GameInterface): Promise<void> => {
    try {
      const res = await fetch(`/api/games/${game.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(game),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to update game');
      setSuccessMessage(t('GameUpdatedSuccessfully'));

      setEditGame(null); // fecha dialog
      fetchGames(); // refaz lista
    } catch (err) {
      log.error('Error updating game:', err);
      setErrorMessage(t('ErrorUpdatingGame'));
    }
  };

  const columns: GridColDef<GameInterface>[] = [
    {
      field: 'number',
      headerName: t('number'),
      flex: 1,
    },
    {
      field: 'date',
      headerName: t('date'),
      flex: 1,
      valueFormatter: (value) => (value ? dayjs(value as string).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      field: 'team',
      headerName: t('Team'),
      flex: 1,
      valueFormatter: (_value, row) => row.team?.name ?? '-',
    },
    {
      field: 'opponent',
      headerName: t('Opponent'),
      flex: 1,
      valueFormatter: (_value, row) => row.opponent?.name ?? '-',
    },
    {
      field: 'venue',
      headerName: t('Venue'),
      flex: 1,
      valueFormatter: (_value, row) => row.venue?.name ?? '-',
    },
    {
      field: 'competition',
      headerName: t('Competition'),
      flex: 1,
      valueFormatter: (_value, row) =>
        `${row.competition?.name ?? '-'} ${row.team?.echelon?.name ?? ''}`,
    },
    {
      field: 'actions',
      headerName: t('actions'),
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            sx={{ mr: 1 }}
            onClick={() =>
              session?.user.selectedClubId
                ? generatePDF(params.row, session.user.selectedClubId)
                : null
            }
          >
            {t('gameSheet')}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => setEditGame(params.row)}
          >
            {t('edit')}
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => setDeleteConfirmId(Number(params.row.id))}
          >
            {t('delete')}
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 700, width: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          {t('gamesManagement')}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)}>
          {t('addGame')}
        </Button>
      </Box>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      <DataGrid
        rows={games}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id!}
        pageSizeOptions={[5, 10, 20]}
        pagination
        checkboxSelection
        disableRowSelectionOnClick
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={(newSelection) => setRowSelectionModel(newSelection)}
      />

      {/* Confirm Delete Dialog */}
      <Dialog open={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('deleteConfirmationMessage')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>{t('cancel')}</Button>
          <Button
            onClick={() => {
              if (deleteConfirmId !== null) {
                handleDeleteGame(deleteConfirmId);
                setDeleteConfirmId(null);
              }
            }}
            color="error"
            variant="contained"
          >
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Game Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('addGame')}</DialogTitle>
        <DialogContent>
          <GameComponent
            game={newGame}
            setGame={setNewGame} // ✅ agora o state é real
            setErrorMessage={setErrorMessage}
            setSuccessMessage={setSuccessMessage}
            onSave={handleAddGame}
            onCancel={() => setOpenAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Game Dialog */}
      <Dialog open={!!editGame} onClose={() => setEditGame(null)} maxWidth="md" fullWidth>
        <DialogTitle>{t('editGame')}</DialogTitle>
        <DialogContent>
          {editGame && (
            <GameComponent
              game={editGame}
              setGame={setEditGame as React.Dispatch<React.SetStateAction<GameInterface>>}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
              onSave={handleUpdateGame}
              onCancel={() => setEditGame(null)}
              saveText={t("Save")}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default GamesPage;
