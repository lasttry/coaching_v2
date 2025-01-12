import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { RoleDisplayNames } from '@/types/club/types';
import { AccountInterface, AccountClubInterface } from '@/types/accounts/types';
import { Role } from '@prisma/client';

interface ClubAccountsProps {
  clubId?: number;
  onError?: (error: string) => void;
}

const ClubAccounts: React.FC<ClubAccountsProps> = ({ clubId, onError }) => {
  const [emailInput, setEmailInput] = useState<string>('');
  const [addAccount, setAddAccount] = useState<AccountInterface | null>(null);
  const [filteredAccounts, setFilteredAccounts] = useState<AccountInterface[]>(
    [],
  );
  const [accounts, setAccounts] = useState<AccountClubInterface[]>([]);

  useEffect(() => {
    if (!clubId) return;

    // Fetch accounts for the club
    const fetchAccounts = async () => {
      onError?.('');
      try {
        const response = await fetch(`/api/clubs/${clubId}/accounts`);
        if (response.ok) {
          const data: AccountClubInterface[] = await response.json();
          setAccounts(data);
        } else {
          console.error('Failed to fetch accounts for the club');
          onError?.('Failed to fetch accounts for the club');
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
        onError?.(`Error fetching accounts: ${error}`);
      }
    };

    fetchAccounts();
  }, [clubId]);

  const handleEmailChange = async (email: string) => {
    setEmailInput(email);
    if (email.length > 2) {
      onError?.('');
      try {
        const response = await fetch(`/api/accounts?email=${email}`);
        if (response.ok) {
          const data: AccountInterface[] = await response.json();
          setFilteredAccounts(data);
        } else {
          console.error('Failed to fetch accounts for autocomplete');
          onError?.(`Failed to fetch accounts for autocomplete`);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
        onError?.(`Error fetching accounts: ${error}`);
      }
    } else {
      setFilteredAccounts([]);
    }
  };

  const handleAddAccount = async () => {
    if (!emailInput || !clubId || !addAccount) return;
    try {
      onError?.('');
      const role = Role.ADMIN;
      const response = await fetch(`/api/clubs/${clubId}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId: addAccount.id, roles: [{ role }] }),
      });
      if (response.ok) {
        const newAccount = await response.json();
        console.log(newAccount);
        setAccounts((prev) => [...prev, newAccount]);
        setEmailInput('');
        setFilteredAccounts([]);
      } else {
        const errorData = await response.json();
        if (errorData?.error) {
          onError?.(`Failed to add account to the club: ${errorData.error}`);
        } else {
          console.error('Failed to remove account from the club');
          onError?.(`Failed to add account to the club`);
        }
      }
    } catch (error) {
      console.error('Error adding account to the club:', error);
      onError?.(`Error adding account to the club: ${error}`);
    }
  };

  const handleRoleChange = async (
    accountId: number,
    role: Role,
    checked: boolean,
  ) => {
    if (!clubId) return;
    try {
      onError?.('');
      const response = await fetch(
        `/api/clubs/${clubId}/accounts/${accountId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role, checked }),
        },
      );
      if (response.ok) {
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === accountId
              ? {
                  ...account,
                  roles: checked
                    ? [...account.roles, role]
                    : account.roles.filter((r) => r !== role),
                }
              : account,
          ),
        );
      } else {
        console.error('Failed to update role');
        onError?.(`Failed to update role`);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      onError?.(`Error updating role: ${error}`);
    }
  };

  const handleRemoveAccount = async (accountId: number) => {
    if (!clubId) return;
    try {
      onError?.('');
      const response = await fetch(
        `/api/clubs/${clubId}/accounts/${accountId}`,
        {
          method: 'DELETE',
        },
      );
      if (response.ok) {
        setAccounts((prev) =>
          prev.filter((account) => account.id !== accountId),
        );
      } else {
        const errorData = await response.json();
        if (errorData?.error) {
          onError?.(`Error removing account from the club: ${errorData.error}`);
        } else {
          console.error('Failed to remove account from the club');
          onError?.(`Failed to remove account from the club`);
        }
      }
    } catch (error) {
      console.error('Error removing account from the club:', error);
      onError?.(`Error removing account from the club: ${error}`);
    }
  };

  if (!clubId) {
    return null;
  }

  return (
    <Box sx={{ marginTop: 4 }}>
      <Typography variant="h6" fontWeight="bold">
        Manage Accounts
      </Typography>
      <Divider sx={{ marginY: 2 }} />
      <Box sx={{ marginBottom: 2 }}>
        <TextField
          label="Add Account by Email"
          value={emailInput}
          onChange={(e) => handleEmailChange(e.target.value)}
          fullWidth
        />
        {filteredAccounts.length > 0 && (
          <Box className="autocomplete-dropdown">
            {filteredAccounts.map((account) => (
              <Box
                key={account.id}
                className="autocomplete-item"
                onClick={() => {
                  setAddAccount(account);
                  setEmailInput(account.email);
                }}
              >
                {account.email}
              </Box>
            ))}
          </Box>
        )}
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: 2 }}
          onClick={handleAddAccount}
          disabled={!emailInput}
        >
          Add Account
        </Button>
      </Box>
      <Typography variant="h6" fontWeight="bold">
        Linked Accounts
      </Typography>
      <Divider sx={{ marginY: 2 }} />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              {Object.values(Role).map((role) => (
                <TableCell key={role}>{RoleDisplayNames[role]}</TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((accountClub) => (
              <TableRow key={accountClub.id}>
                <TableCell>{accountClub.name}</TableCell>
                <TableCell>{accountClub.email}</TableCell>
                {Object.values(Role).map((role) => (
                  <TableCell key={role}>
                    <Checkbox
                      checked={accountClub.roles.includes(role)}
                      onChange={(e) =>
                        handleRoleChange(accountClub.id, role, e.target.checked)
                      }
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <IconButton
                    onClick={() => handleRemoveAccount(accountClub.id)}
                  >
                    <CloseIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ClubAccounts;
