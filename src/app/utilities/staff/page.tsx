'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Autocomplete,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  SelectProps,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ptPT } from '@mui/x-data-grid/locales';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';
import dayjs from 'dayjs';
import { StaffRole, CoachGrade } from '@prisma/client';
import {
  StaffInterface,
  STAFF_ROLE_LABELS,
  COACH_GRADE_LABELS,
  AvailableAccount,
} from '@/types/staff/types';
import { TeamInterface } from '@/types/teams/types';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const menuProps: NonNullable<SelectProps<number[]>['MenuProps']> = {
  slotProps: {
    paper: {
      sx: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  },
};

export default function StaffPage(): React.JSX.Element {
  const { t } = useTranslation();
  const [staff, setStaff] = useState<StaffInterface[]>([]);
  const [teams, setTeams] = useState<TeamInterface[]>([]);
  const [accounts, setAccounts] = useState<AvailableAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffInterface | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [formData, setFormData] = useState<StaffInterface & { teamIds: number[] }>({
    name: '',
    birthdate: null,
    tptdNumber: null,
    fpbLicense: null,
    grade: null,
    role: 'HEAD_COACH' as StaffRole,
    active: true,
    accountId: null,
    teamIds: [],
  });

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch('/api/staff');
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch('/api/teams');
      if (res.ok) {
        const data = await res.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  }, []);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/staff/accounts');
      if (res.ok) {
        const data = (await res.json()) as AvailableAccount[];
        setAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
    fetchTeams();
    fetchAccounts();
  }, [fetchStaff, fetchTeams, fetchAccounts]);

  const handleAdd = useCallback(() => {
    setSelectedStaff(null);
    setFormData({
      name: '',
      birthdate: null,
      tptdNumber: null,
      fpbLicense: null,
      grade: null,
      role: 'HEAD_COACH' as StaffRole,
      active: true,
      accountId: null,
      teamIds: [],
    });
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((staffMember: StaffInterface) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      birthdate: staffMember.birthdate ? dayjs(staffMember.birthdate).format('YYYY-MM-DD') : null,
      tptdNumber: staffMember.tptdNumber,
      fpbLicense: staffMember.fpbLicense,
      grade: staffMember.grade,
      role: staffMember.role,
      active: staffMember.active ?? true,
      accountId: staffMember.accountId ?? null,
      teamIds: staffMember.teams?.map((ts) => ts.teamId) || [],
    });
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback((staffMember: StaffInterface) => {
    setSelectedStaff(staffMember);
    setDeleteDialogOpen(true);
  }, []);

  const handleSave = async () => {
    try {
      const url = selectedStaff ? `/api/staff/${selectedStaff.id}` : '/api/staff';
      const method = selectedStaff ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSnackbar({
          open: true,
          message: selectedStaff ? t('staff.updated') : t('staff.created'),
          severity: 'success',
        });
        setDialogOpen(false);
        fetchStaff();
        fetchAccounts();
      } else {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || 'Failed to save');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('messages.errorSaving');
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!selectedStaff) return;

    try {
      const res = await fetch(`/api/staff/${selectedStaff.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSnackbar({ open: true, message: t('staff.deleted'), severity: 'success' });
        setDeleteDialogOpen(false);
        fetchStaff();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      setSnackbar({ open: true, message: t('messages.errorDeleting'), severity: 'error' });
    }
  };

  const handleTeamChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setFormData({
      ...formData,
      teamIds: typeof value === 'string' ? value.split(',').map(Number) : value,
    });
  };

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'name', headerName: t('common.name'), flex: 1, minWidth: 150 },
      {
        field: 'role',
        headerName: t('common.role'),
        width: 150,
        valueGetter: (value: StaffRole) => STAFF_ROLE_LABELS[value] || value,
      },
      {
        field: 'grade',
        headerName: t('common.grade'),
        width: 100,
        valueGetter: (value: CoachGrade | null) => (value ? COACH_GRADE_LABELS[value] : '-'),
      },
      {
        field: 'tptdNumber',
        headerName: 'TPTD',
        width: 100,
        valueGetter: (value: number | null) => value || '-',
      },
      {
        field: 'fpbLicense',
        headerName: t('staff.fpbLicense'),
        width: 100,
        valueGetter: (value: number | null) => value || '-',
      },
      {
        field: 'birthdate',
        headerName: t('common.birthdate'),
        width: 120,
        valueGetter: (value: string | null) => (value ? dayjs(value).format('DD/MM/YYYY') : '-'),
      },
      {
        field: 'teams',
        headerName: t('team.title'),
        width: 200,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {params.row.teams?.map((ts: { team: TeamInterface; teamId: number }) => (
              <Chip key={ts.teamId} label={ts.team?.name} size="small" variant="outlined" />
            ))}
          </Box>
        ),
      },
      {
        field: 'account',
        headerName: t('staff.account.header'),
        width: 200,
        sortable: false,
        renderCell: (params) => {
          const account = params.row.account as StaffInterface['account'];
          if (!account) {
            return (
              <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                {t('staff.account.none')}
              </Typography>
            );
          }
          return (
            <Chip
              label={account.name || account.email}
              size="small"
              variant="outlined"
              color="primary"
            />
          );
        },
      },
      {
        field: 'active',
        headerName: t('common.active'),
        width: 80,
        renderCell: (params) => (
          <Chip
            label={params.value ? t('common.yes') : t('common.no')}
            color={params.value ? 'success' : 'default'}
            size="small"
          />
        ),
      },
      {
        field: 'actions',
        headerName: t('common.actions'),
        width: 120,
        sortable: false,
        renderCell: (params) => (
          <Box>
            <IconButton size="small" onClick={() => handleEdit(params.row)}>
              <IconEdit size={18} />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => handleDelete(params.row)}>
              <IconTrash size={18} />
            </IconButton>
          </Box>
        ),
      },
    ],
    [t, handleEdit, handleDelete]
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">{t('staff.management')}</Typography>
        <Button variant="contained" startIcon={<IconPlus />} onClick={handleAdd}>
          {t('actions.add')}
        </Button>
      </Box>

      <DataGrid
        rows={staff}
        columns={columns}
        loading={loading}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
          sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
        }}
        localeText={ptPT.components.MuiDataGrid.defaultProps.localeText}
        autoHeight
        disableRowSelectionOnClick
      />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedStaff ? t('staff.edit') : t('staff.add')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t('common.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label={t('common.birthdate')}
              type="date"
              value={formData.birthdate || ''}
              onChange={(e) => setFormData({ ...formData, birthdate: e.target.value || null })}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <FormControl fullWidth>
              <InputLabel>{t('common.role')}</InputLabel>
              <Select
                value={formData.role}
                label={t('common.role')}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
              >
                {Object.entries(STAFF_ROLE_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t('common.grade')}</InputLabel>
              <Select
                value={formData.grade || ''}
                label={t('common.grade')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    grade: e.target.value ? (e.target.value as CoachGrade) : null,
                  })
                }
              >
                <MenuItem value="">-</MenuItem>
                {Object.entries(COACH_GRADE_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="TPTD"
              type="number"
              value={formData.tptdNumber || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tptdNumber: e.target.value ? parseInt(e.target.value, 10) : null,
                })
              }
              fullWidth
            />

            <TextField
              label={t('staff.fpbLicense')}
              type="number"
              value={formData.fpbLicense || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fpbLicense: e.target.value ? parseInt(e.target.value, 10) : null,
                })
              }
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>{t('team.title')}</InputLabel>
              <Select
                multiple
                value={formData.teamIds}
                onChange={handleTeamChange}
                input={<OutlinedInput label={t('team.title')} />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((teamId) => {
                      const team = teams.find((t) => t.id === teamId);
                      return <Chip key={teamId} label={team?.name || teamId} size="small" />;
                    })}
                  </Box>
                )}
                MenuProps={menuProps}
              >
                {teams
                  .filter((team) => team.id !== undefined && team.id !== null)
                  .map((team) => (
                    <MenuItem key={team.id} value={team.id as number}>
                      {team.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <Autocomplete
              options={accounts}
              value={accounts.find((a) => a.id === formData.accountId) || null}
              onChange={(_, newValue) =>
                setFormData({ ...formData, accountId: newValue ? newValue.id : null })
              }
              getOptionLabel={(option) =>
                option.name ? `${option.name} (${option.email})` : option.email
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              getOptionDisabled={(option) =>
                option.linkedStaffId !== null && option.linkedStaffId !== selectedStaff?.id
              }
              renderOption={(props, option) => {
                const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & {
                  key: string;
                };
                const disabled =
                  option.linkedStaffId !== null && option.linkedStaffId !== selectedStaff?.id;
                return (
                  <li key={key} {...rest}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2">{option.name || option.email}</Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: disabled ? 'error.main' : 'text.secondary' }}
                      >
                        {option.name ? option.email : ''}
                        {disabled && option.linkedStaffName
                          ? `${option.name ? ' · ' : ''}${t('staff.account.alreadyLinked', { name: option.linkedStaffName })}`
                          : ''}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('staff.account.label')}
                  helperText={t('staff.account.helper')}
                />
              )}
              clearOnEscape
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
              }
              label={t('common.active')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('actions.cancel')}</Button>
          <Button variant="contained" onClick={handleSave} disabled={!formData.name}>
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('messages.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('staff.confirmDelete', { name: selectedStaff?.name })}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('actions.cancel')}</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            {t('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
