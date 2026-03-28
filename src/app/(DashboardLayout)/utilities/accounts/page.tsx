'use client';

import React, { useState, useEffect, ReactElement } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useSession } from 'next-auth/react';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { AccountInterface } from '@/types/accounts/types';
import ChangePasswordDialog from './assets/changePasswordDialog';
import { log } from '@/lib/logger';

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';

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

  const handleAddAccount = (): void => {
    onAddAccount({ name, email, password });
    setName('');
    setEmail('');
    setPassword('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t('addAccount')}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={t('Name')}
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t('emailAddress')}
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          margin="dense"
          label={t('password')}
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t('Cancel')}
        </Button>
        <Button onClick={handleAddAccount} color="primary">
          {t('Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AccountsPage = (): ReactElement => {
  const { t } = useTranslation();

  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<AccountInterface[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountInterface | null>(null);

  useEffect(() => {
    const fetchAccounts = async (): Promise<void> => {
      try {
        const response = await fetch('/api/accounts');
        if (response.ok) {
          const data = await response.json();
          setAccounts(data);
        } else {
          const errorData = await response.json();
          if (errorData?.error) {
            setErrorMessage(`${t('failedDeleteAccounts')}: ${errorData.error}`);
          } else {
            setErrorMessage(t('failedDeleteAccounts'));
          }
        }
      } catch (error) {
        setErrorMessage(`${t('failedFetchingAccounts')}: ${error}`);
      }
    };

    fetchAccounts();
  }, [t]);

  const handleDeleteAccount = async (accountId?: number): Promise<void> => {
    if (session?.user.id === accountId) {
      setErrorMessage(t('deleteOwnAccount'));
      return;
    }

    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setAccounts((prev) => prev.filter((account) => account.id !== accountId));
        setSuccessMessage(t('accountDeletedSuccessfully'));
      } else {
        const errorData = await response.json();
        if (errorData?.error) {
          setErrorMessage(`${t('failedDeleteAccounts')}: ${errorData.error}`);
        } else {
          setErrorMessage(t('failedDeleteAccounts'));
        }
      }
    } catch (error) {
      setErrorMessage(`${t('errorDeletingAccounts')}: ${error}`);
    }
  };

  const handleAddAccount = async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }): Promise<void> => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      if (response.ok) {
        const newAccount = await response.json();
        setAccounts((prev) => [...prev, newAccount]);
        setSuccessMessage(t('accountAddedSuccessfully'));
      } else {
        const errorData = await response.json();
        if (errorData?.error) {
          setErrorMessage(`${t('failedAddAccounts')}: ${errorData.error}`);
        } else {
          log.error('Failed to add account');
          setErrorMessage(t('failedAddAccounts'));
        }
      }
    } catch (error) {
      setErrorMessage(`${t('errorAddingAccounts')}: ${error}`);
    }
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
      const data = JSON.stringify({
        name,
        email,
        defaultClubId,
        image,
        oldPassword,
        password,
      });
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      });
      if (response.ok) {
        const updatedAccount = await response.json();
        setAccounts((prev) =>
          prev.map((account) => (account.id === accountId ? updatedAccount : account))
        );
        setSuccessMessage(t('accountUpdatedSuccessfully'));
      } else {
        const errorData = await response.json();
        if (errorData?.error) {
          setErrorMessage(`${t('failedUpdateAccount')}: ${errorData.error}`);
        } else {
          setErrorMessage(t('failedUpdateAccount'));
        }
      }
    } catch (error) {
      setErrorMessage(`${t('errorUpdatingAccount')}: ${error}`);
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
        <Typography variant="h4">{t('manageAccounts')}</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setAddAccountOpen(true)}
        >
          {t('addAccount')}
        </Button>
      </Box>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('name')}</TableCell>
              <TableCell>{t('email')}</TableCell>
              <TableCell>{t('actions')}</TableCell>
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
