import React, { useEffect, useState } from 'react';
import { log } from '@/lib/logger';
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
import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';

interface ClubAccountsProps {
  clubId?: number;
  onError?: (error: string) => void;
}

const ClubAccounts: React.FC<ClubAccountsProps> = ({ clubId, onError }) => {
  const { t } = useTranslation();
  const [emailInput, setEmailInput] = useState<string>('');
  const [addAccount, setAddAccount] = useState<AccountInterface | null>(null);
  const [filteredAccounts, setFilteredAccounts] = useState<AccountInterface[]>([]);
  const [accounts, setAccounts] = useState<AccountClubInterface[]>([]);
  useEffect(() => {
    if (!clubId) return;

    // Fetch accounts for the club
    const fetchAccounts = async (): Promise<void> => {
      onError?.('');
      try {
        const response = await fetch(`/api/clubs/${clubId}/accounts`);
        if (response.ok) {
          const data: AccountClubInterface[] = await response.json();
          setAccounts(data);
        } else {
          log.error('Failed to fetch accounts for the club');
          onError?.(t('account.fetch.error'));
        }
      } catch (error) {
        log.error('Error fetching accounts:', error);
        onError?.(t('fetchAccountsNetworkError', { error: String(error) }));
      }
    };

    fetchAccounts();
  }, [clubId, onError]);

  const handleEmailChange = async (email: string): Promise<void> => {
    setEmailInput(email);
    if (email.length > 2) {
      onError?.('');
      try {
        const response = await fetch(`/api/accounts?email=${email}`);
        if (response.ok) {
          const data: AccountInterface[] = await response.json();
          setFilteredAccounts(data);
        } else {
          log.error('Failed to fetch accounts for autocomplete');
          onError?.(t('account.fetch.autocompleteError'));
        }
      } catch (error) {
        log.error('Error fetching accounts:', error);
        onError?.(t('fetchAutocompleteNetworkError', { error: String(error) }));
      }
    } else {
      setFilteredAccounts([]);
    }
  };

  const handleAddAccount = async (): Promise<void> => {
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
        setAccounts((prev) => [...prev, newAccount]);
        setEmailInput('');
        setFilteredAccounts([]);
      } else {
        const errorData = await response.json();
        if (errorData?.error) {
          onError?.(t('addAccountFailedWithReason', { reason: errorData.error }));
        } else {
          log.error('Failed to add account to the club');
          onError?.(t('account.save.addError'));
        }
      }
    } catch (error) {
      log.error('Error adding account to the club:', error);
      onError?.(t('addAccountNetworkError', { error: String(error) }));
    }
  };

  const handleRoleChange = async (
    accountId: number,
    role: Role,
    checked: boolean
  ): Promise<void> => {
    if (!clubId) return;
    try {
      onError?.('');
      const response = await fetch(`/api/clubs/${clubId}/accounts/${accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, checked }),
      });
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
              : account
          )
        );
      } else {
        log.error('Failed to update role');
        onError?.(t('account.save.updateRoleError'));
      }
    } catch (error) {
      log.error('Error updating role:', error);
      onError?.(t('updateRoleNetworkError', { error: String(error) }));
    }
  };

  const handleRemoveAccount = async (accountId: number): Promise<void> => {
    if (!clubId) return;
    try {
      onError?.('');
      const response = await fetch(`/api/clubs/${clubId}/accounts/${accountId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setAccounts((prev) => prev.filter((account) => account.id !== accountId));
      } else {
        const errorData = await response.json();
        if (errorData?.error) {
          onError?.(t('removeAccountFailedWithReason', { reason: errorData.error }));
        } else {
          log.error('Failed to remove account from the club');
          onError?.(t('account.save.removeError'));
        }
      }
    } catch (error) {
      log.error('Error removing account from the club:', error);
      onError?.(t('removeAccountNetworkError', { error: String(error) }));
    }
  };

  if (!clubId) {
    return null;
  }

  return (
    <Box sx={{ marginTop: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        {t('account.manage')}
      </Typography>
      <Divider sx={{ marginY: 2 }} />
      <Box sx={{ marginBottom: 2 }}>
        <TextField
          label={t('account.addByEmail')}
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
          {t('account.add')}
        </Button>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        {t('account.linked')}
      </Typography>
      <Divider sx={{ marginY: 2 }} />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('common.name')}</TableCell>
              <TableCell>{t('common.email')}</TableCell>
              {Object.values(Role).map((role) => (
                <TableCell key={role}>{RoleDisplayNames[role]}</TableCell>
              ))}
              <TableCell>{t('common.actions')}</TableCell>
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
                      onChange={(e) => handleRoleChange(accountClub.id, role, e.target.checked)}
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <IconButton onClick={() => handleRemoveAccount(accountClub.id)}>
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
