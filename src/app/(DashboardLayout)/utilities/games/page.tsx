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
import { GameInterface } from '@/types/games/types';
import { log } from '@/lib/logger';
import GameComponent from './components/Game';
import { generateReportsPDF } from '@/app/utilities/pdf/reports';

const GamesPage: React.FC = () => {
  const { t } = useTranslation();

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
    clubId: 0
  });

  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>({
      type: 'include',
      ids: new Set(),
    });

  const fetchGames = async () => {
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


  const handleDeleteGame = async (id: number) => {
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

  const handleAddGame = async (game: GameInterface) => {
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

  const handleUpdateGame = async (game: GameInterface) => {
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
      valueFormatter: (value) =>
        value ? dayjs(value as string).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      field: 'team',
      headerName: t('team'),
      flex: 1,
      valueFormatter: (_value, row) => row.team?.name ?? '-',
    },
    {
      field: 'opponent',
      headerName: t('opponent'),
      flex: 1,
      valueFormatter: (_value, row) => row.opponent?.name ?? '-',
    },
    {
      field: 'venue',
      headerName: t('venue'),
      flex: 1,
      valueFormatter: (_value, row) => row.venue?.name ?? '-',
    },
    {
      field: 'competition',
      headerName: t('competition'),
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
            onClick={() => generateReportsPDF(params.row)}
          >
            {t('folha')}
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
          {t('Games Management')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenAddDialog(true)}
        >
          {t('Add Game')}
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
        onRowSelectionModelChange={(newSelection) =>
          setRowSelectionModel(newSelection)
        }
      />

      {/* Confirm Delete Dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
      >
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
        <DialogTitle>{t('Add New Game')}</DialogTitle>
        <DialogContent>
          <GameComponent
            game={newGame}
            setGame={setNewGame}   // ✅ agora o state é real
            setErrorMessage={setErrorMessage}
            setSuccessMessage={setSuccessMessage}
            onSave={handleAddGame}
            onCancel={() => setOpenAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Game Dialog */}
      <Dialog open={!!editGame} onClose={() => setEditGame(null)} maxWidth="md" fullWidth>
        <DialogTitle>{t('Edit Game')}</DialogTitle>
        <DialogContent>
          {editGame && (
            <GameComponent
              game={editGame}
              setGame={setEditGame}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
              onSave={handleUpdateGame}
              onCancel={() => setEditGame(null)}
              saveText="Save"
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default GamesPage;