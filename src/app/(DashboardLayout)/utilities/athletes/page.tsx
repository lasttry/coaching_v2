'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { AthleteInterface } from '@/types/games/types';
import { log } from '@/lib/logger';
import AthleteAddComponent from './components/AthleteAddComponent';
import { useMessage } from '@/hooks/useMessage';

const AthletesPage: React.FC = () => {
  const { t } = useTranslation();
  const [athletes, setAthletes] = useState<AthleteInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteInterface | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { message: errorMessage, setTimedMessage: setErrorMessage } = useMessage(10000);
  const { message: successMessage, setTimedMessage: setSuccessMessage } = useMessage(5000);

  // ✅ 1. Definir fetchAthletes uma vez
  const fetchAthletes = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('/api/athletes');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch athletes');
      setAthletes(data);
      console.log(data)
    } catch (err) {
      log.error('Error fetching athletes:', err);
      setErrorMessage(t('failedFetchAthlete'));
    } finally {
      setLoading(false);
    }
  };

  // ✅ 2. Só correr uma vez no mount
  useEffect(() => {
    void fetchAthletes(); // nota o "void" para TypeScript
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 👈 lista de dependências vazia!

  const handleSaveAthlete = async (athlete: AthleteInterface): Promise<void> => {
    try {
      const method = athlete.id ? 'PUT' : 'POST';
      const url = athlete.id ? `/api/athletes/${athlete.id}` : '/api/athletes';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(athlete),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save athlete');

      setSuccessMessage(athlete.id ? t('saveSuccess') : t('addAthleteSuccess'));
      setOpenDialog(false);
      fetchAthletes();
    } catch (err) {
      log.error('Error saving athlete:', err);
      setErrorMessage(t('saveError'));
    }
  };

  const handleDeleteAthlete = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/athletes/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error((await response.json())?.error || t('deleteError'));

      setAthletes((prev) => prev.filter((a) => a.id !== id));
      setSuccessMessage(t('deleteSuccess'));
    } catch (err) {
      log.error('Error deleting athlete:', err);
      setErrorMessage(t('deleteError'));
    }
  };

  const columns: GridColDef<AthleteInterface>[] = [
    { field: 'number', headerName: t('number'), flex: 1 },
    { field: 'name', headerName: t('name'), flex: 2 },
    {
      field: 'birthdate',
      headerName: t('birthdate'),
      flex: 1,
      valueFormatter: (_value, row) =>
        row.birthdate ? dayjs(row.birthdate).format('YYYY-MM-DD') : '-',
    },
    { field: 'fpbNumber', headerName: t('fpbNumber'), flex: 1 },
    { field: 'shirtSize', headerName: t('shirtSize'), flex: 1 },
    {
      field: 'active',
      headerName: t('active'),
      flex: 1,
      valueFormatter: (_value, row) => (row.active ? t('yes') : t('no')),
    },
    {
      field: 'actions',
      headerName: t('actions'),
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Button
            size="small"
            variant="outlined"
            sx={{ mr: 1 }}
            onClick={() => {
              setSelectedAthlete(params.row);
              setOpenDialog(true);
            }}
          >
            {t('edit')}
          </Button>
          <Button
            size="small"
            color="error"
            variant="contained"
            onClick={() => setDeleteConfirmId(params.row.id!)}
          >
            {t('delete')}
          </Button>
        </Box>
      ),
    },
  ];

return (
  <Box sx={{ p: 3 }}>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography variant="h4">{t('athletesManagement')}</Typography>
      <Button
        variant="contained"
        onClick={() => {
          setSelectedAthlete({
            id: null,
            number: '',
            name: '',
            birthdate: '',
            fpbNumber: null,
            active: true,
            shirtSize: ''
          });
          setOpenDialog(true);
        }}
      >
        {t('addAthlete')}
      </Button>
    </Box>

    {successMessage && <Alert severity="success">{successMessage}</Alert>}
    {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

    <DataGrid
      rows={athletes}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id!}
      pageSizeOptions={[5, 10, 20]}
      pagination
      disableRowSelectionOnClick
      autoHeight
    />

    {/* Add/Edit Athlete Dialog */}
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        {selectedAthlete?.id ? t('editAthlete') : t('addNewAthlete')}
      </DialogTitle>
      <DialogContent>
        <AthleteAddComponent
          newAthlete={selectedAthlete!}
          setNewAthlete={setSelectedAthlete as any}
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
          onAddAthlete={() => handleSaveAthlete(selectedAthlete!)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDialog(false)}>{t('cancel')}</Button>
      </DialogActions>
    </Dialog>

    {/* ✅ Confirm Delete Dialog */}
    <Dialog
      open={!!deleteConfirmId}
      onClose={() => setDeleteConfirmId(null)}
    >
      <DialogTitle>{t('confirmDelete')}</DialogTitle>
      <DialogContent>
        <Typography>
          {t('deleteConfirmationMessage')}<br />
          <strong>{athletes.find((a) => a.id === deleteConfirmId)?.name}</strong>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteConfirmId(null)}>{t('cancel')}</Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => {
            handleDeleteAthlete(deleteConfirmId!);
            setDeleteConfirmId(null);
          }}
        >
          {t('delete')}
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
  );
}
export default AthletesPage;