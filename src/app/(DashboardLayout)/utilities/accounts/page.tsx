'use client';

import React, { useState, useEffect } from 'react';
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

interface AddAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onAddAccount: (account: { name: string; email: string; password: string }) => void;
}

const AddAccountDialog: React.FC<AddAccountDialogProps> = ({ open, onClose, onAddAccount }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAddAccount = () => {
    onAddAccount({ name, email, password });
    setName('');
    setEmail('');
    setPassword('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Account</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label="Name" type="text" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
        <TextField margin="dense" label="Email Address" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField margin="dense" label="Password" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleAddAccount} color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AccountsPage = () => {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<AccountInterface[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountInterface | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/accounts');
        if (response.ok) {
          const data = await response.json();
          setAccounts(data);
        } else {
          const errorData = await response.json();
          if (errorData?.error) {
            setErrorMessage(`Failed to delete accounts: ${errorData.error}`);
          } else {
            setErrorMessage('Failed to delete accounts');
          }
        }
      } catch (error) {
        setErrorMessage(`Error fetching accounts: ${error}`);
      }
    };

    fetchAccounts();
  }, []);

  const handleDeleteAccount = async (accountId?: number) => {
    if (session?.user.id === accountId) {
      setErrorMessage('You cannot delete your own account');
      return;
    }

    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setAccounts((prev) => prev.filter((account) => account.id !== accountId));
        setSuccessMessage('Account deleted successfully');
      } else {
        const errorData = await response.json();
        if (errorData?.error) {
          setErrorMessage(`Failed to delete accounts: ${errorData.error}`);
        } else {
          setErrorMessage('Failed to delete accounts');
        }
      }
    } catch (error) {
      setErrorMessage(`Error deleting accounts: ${error}`);
    }
  };

  const handleAddAccount = async ({ name, email, password }: { name: string; email: string; password: string }) => {
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
        setSuccessMessage('Account added successfully');
      } else {
        const errorData = await response.json();
        if (errorData?.error) {
          setErrorMessage(`Failed to add accounts: ${errorData.error}`);
        } else {
          console.error('Failed to add accounts');
        }
      }
    } catch (error) {
      setErrorMessage(`Error adding accounts: ${error}`);
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
  ) => {
    try {
      const data = JSON.stringify({
        name,
        email,
        defaultClubId,
        image,
        oldPassword,
        password,
      });
      console.log(data);
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      });
      if (response.ok) {
        const updatedAccount = await response.json();
        setAccounts((prev) => prev.map((account) => (account.id === accountId ? updatedAccount : account)));
        setSuccessMessage('Account updated successfully');
      } else {
        const errorData = await response.json();
        if (errorData?.error) {
          setErrorMessage(`Failed to update account: ${errorData.error}`);
        } else {
          setErrorMessage('Failed to update account');
        }
      }
    } catch (error) {
      setErrorMessage(`Error updating account: ${error}`);
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
        <Typography variant="h4">Manage Accounts</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setAddAccountOpen(true)}>
          Add Account
        </Button>
      </Box>
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
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
      <AddAccountDialog open={addAccountOpen} onClose={() => setAddAccountOpen(false)} onAddAccount={handleAddAccount} />
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
