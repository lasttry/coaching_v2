'use client';

import React, { useEffect, useState, ReactElement } from 'react';
import {
  Alert,
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useSession } from 'next-auth/react';
import PageContainer from '@/app/components/container/PageContainer';
import { AccountInterface } from '@/types/accounts/types';
import ChangePasswordDialog from './assets/changePasswordDialog';
import { log } from '@/lib/logger';
import {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from '@/hooks/useAccounts';

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';
import { GuardedDialog, useFormSnapshotDirty } from '@/app/components/shared/GuardedDialog';

interface AddAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onAddAccount: (account: { name: string; email: string; password: string }) => void;
}

const AddAccountDialog: React.FC<AddAccountDialogProps> = ({
  open,
  onClose,
  onAddAccount,
}): ReactElement => {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isDirty = useFormSnapshotDirty(open, { name, email, password });

  const handleAddAccount = (): void => {
    onAddAccount({ name, email, password });
    setName('');
    setEmail('');
    setPassword('');
    onClose();
  };

  return (
    <GuardedDialog open={open} onClose={onClose} isDirty={isDirty}>
      <DialogTitle>{t('account.add')}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t('common.name')}
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t('common.email')}
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t('common.password')}
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t('actions.cancel')}
        </Button>
        <Button onClick={handleAddAccount} color="primary">
          {t('actions.add')}
        </Button>
      </DialogActions>
    </GuardedDialog>
  );
};

const AccountsPage = (): ReactElement => {
  const { t } = useTranslation();

  const { data: session } = useSession();
  const { data: accounts = [], error: fetchError } = useAccounts();
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountInterface | null>(null);

  useEffect(() => {
    if (fetchError) {
      setErrorMessage(
        fetchError instanceof Error
          ? `${t('account.failedFetch')}: ${fetchError.message}`
          : t('account.failedFetch')
      );
    }
  }, [fetchError, t]);

  const handleDeleteAccount = (accountId?: number): void => {
    if (!accountId) return;
    if (session?.user.id && Number(session.user.id) === accountId) {
      setErrorMessage(t('account.deleteOwn'));
      return;
    }

    deleteMutation.mutate(accountId, {
      onSuccess: () => setSuccessMessage(t('account.deletedSuccess')),
      onError: (err) => {
        setErrorMessage(
          err instanceof Error
            ? `${t('account.failedDelete')}: ${err.message}`
            : t('account.failedDelete')
        );
      },
    });
  };

  const handleAddAccount = (input: { name: string; email: string; password: string }): void => {
    createMutation.mutate(input, {
      onSuccess: () => setSuccessMessage(t('account.addedSuccess')),
      onError: (err) => {
        log.error('Failed to add account', err);
        setErrorMessage(
          err instanceof Error
            ? `${t('account.failedAdd')}: ${err.message}`
            : t('account.failedAdd')
        );
      },
    });
  };

  const handleUpdateAccount = async (
    accountId: number,
    name: string,
    email: string,
    defaultClubId?: number | null,
    image?: string | null,
    password?: string,
    oldPassword?: string
  ): Promise<void> => {
    try {
      await updateMutation.mutateAsync({
        id: accountId,
        name,
        email,
        defaultClubId,
        image,
        password,
        oldPassword,
      });
      setSuccessMessage(t('account.updatedSuccess'));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `${t('account.failedUpdate')}: ${error.message}`
          : t('account.failedUpdate')
      );
    }
  };

  return (
    <PageContainer>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h4">{t('account.management')}</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setAddAccountOpen(true)}
        >
          {t('account.add')}
        </Button>
      </Box>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('common.name')}</TableCell>
              <TableCell>{t('common.email')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => (
              <TableRow
                key={account.id}
                onClick={() => {
                  setSelectedAccount(account);
                  setChangePasswordOpen(true);
                }}
              >
                <TableCell>{account.name}</TableCell>
                <TableCell>{account.email}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAccount(account.id);
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <AddAccountDialog
        open={addAccountOpen}
        onClose={() => setAddAccountOpen(false)}
        onAddAccount={handleAddAccount}
      />
      <ChangePasswordDialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        account={selectedAccount}
        onUpdateAccount={handleUpdateAccount}
      />
    </PageContainer>
  );
};

export default AccountsPage;
