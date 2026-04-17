/**
 * TEMPLATE: Simple CRUD Page
 *
 * This template demonstrates the standard pattern for simple entity management pages.
 * Copy this file and replace the placeholders to create a new page.
 *
 * Features:
 * - DataGrid for listing with sorting, pagination, and filtering
 * - Dialog for create/edit operations
 * - Confirmation dialog for delete
 * - Snackbar notifications for success/error messages
 * - Full i18n support
 * - Memoized columns and callbacks for performance
 *
 * Placeholders to replace:
 * - EntityInterface: Your entity type interface
 * - Entity/entity: Entity name (e.g., Echelon/echelon, Opponent/opponent)
 * - /api/entities: Your API endpoint
 * - initialEntity: Default values for new entity
 * - Form fields in the dialog
 * - DataGrid columns
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Alert,
  Snackbar,
  // Add more MUI components as needed:
  // FormControl, InputLabel, Select, MenuItem, Chip, Avatar, Stack
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';
import { log } from '@/lib/logger';

// ============================================================================
// TYPES
// ============================================================================

interface EntityInterface {
  id?: number | null;
  name: string;
  // Add your entity fields here
}

// ============================================================================
// CONSTANTS
// ============================================================================

const initialEntity: EntityInterface = {
  id: null,
  name: '',
  // Set default values for your fields
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function EntitiesPage(): React.JSX.Element {
  const { t } = useTranslation();

  // --------------------------------------------------------------------------
  // STATE
  // --------------------------------------------------------------------------

  const [entities, setEntities] = useState<EntityInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<EntityInterface | null>(null);
  const [formData, setFormData] = useState<EntityInterface>(initialEntity);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // DATA FETCHING
  // --------------------------------------------------------------------------

  useEffect(() => {
    const fetchEntities = async (): Promise<void> => {
      try {
        const res = await fetch('/api/entities');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setEntities(data);
      } catch (err) {
        log.error('Error fetching entities:', err);
        setErrorMessage(t('fetchError'));
      } finally {
        setLoading(false);
      }
    };
    fetchEntities();
  }, [t]);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------

  const handleOpenDialog = useCallback((entity?: EntityInterface): void => {
    if (entity) {
      setEditingEntity(entity);
      setFormData(entity);
    } else {
      setEditingEntity(null);
      setFormData(initialEntity);
    }
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback((): void => {
    setDialogOpen(false);
    setEditingEntity(null);
    setFormData(initialEntity);
  }, []);

  const handleSave = async (): Promise<void> => {
    // Validation
    if (!formData.name?.trim()) {
      setErrorMessage(t('missingFields'));
      return;
    }

    try {
      let res: Response;
      if (editingEntity?.id) {
        // UPDATE
        res = await fetch(`/api/entities/${editingEntity.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        // CREATE
        res = await fetch('/api/entities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (!res.ok) throw new Error(await res.text());
      const saved: EntityInterface = await res.json();

      // Update state
      setEntities((prev) => {
        const exists = prev.some((e) => e.id === saved.id);
        if (exists) {
          return prev.map((e) => (e.id === saved.id ? saved : e));
        }
        return [...prev, saved];
      });

      setSuccessMessage(editingEntity ? t('updated') : t('created'));
      handleCloseDialog();
    } catch (err) {
      log.error('Error saving entity:', err);
      setErrorMessage(t('saveError'));
    }
  };

  const confirmDelete = useCallback((id: number | null): void => {
    if (!id) return;
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDelete = async (): Promise<void> => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/entities/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());

      setEntities((prev) => prev.filter((e) => e.id !== deleteId));
      setSuccessMessage(t('deleted'));
      setDeleteConfirmOpen(false);
      setDeleteId(null);
    } catch (err) {
      log.error('Error deleting entity:', err);
      setErrorMessage(t('deleteError'));
    }
  };

  // --------------------------------------------------------------------------
  // DATAGRID COLUMNS
  // --------------------------------------------------------------------------

  const columns: GridColDef[] = useMemo(
    () => [
      // Define your columns here
      { field: 'name', headerName: t('name'), flex: 1 },
      // Example with custom renderer:
      // {
      //   field: 'image',
      //   headerName: t('logo'),
      //   width: 80,
      //   sortable: false,
      //   renderCell: (params) => <Avatar src={params.value as string} />,
      // },
      // Actions column (always last)
      {
        field: 'actions',
        headerName: t('actions'),
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <>
            <IconButton onClick={() => handleOpenDialog(params.row as EntityInterface)}>
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={() => confirmDelete(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </>
        ),
      },
    ],
    [t, handleOpenDialog, confirmDelete]
  );

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <Box>
      {/* Error Notification */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={5000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Success Notification */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">{t('entitiesManagement')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          {t('addEntity')}
        </Button>
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={entities}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id!}
          pageSizeOptions={[5, 10, 25]}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
          }}
        />
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingEntity ? t('editEntity') : t('addEntity')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Add your form fields here */}
            <TextField
              label={t('name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            {/* Example of optional field:
            <TextField
              label={t('description')}
              value={formData.description ?? ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
            */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('Cancel')}</Button>
          <Button variant="contained" onClick={handleSave}>
            {t('Save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('deleteConfirmationMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>{t('Cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
