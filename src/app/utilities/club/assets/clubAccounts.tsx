import React, { useEffect, useState } from 'react';
import { log } from '@/lib/logger';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  DeleteOutlined as DeleteIcon,
  Group as GroupIcon,
  Search as SearchIcon,
  AdminPanelSettings as AdminIcon,
  Badge as DirectorIcon,
  SportsBasketball as CoachIcon,
  SportsHandball as PlayerIcon,
  FamilyRestroom as ParentIcon,
  Groups as TeamManagerIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { RoleDisplayNames } from '@/types/club/types';
import { AccountInterface, AccountClubInterface } from '@/types/accounts/types';
import { Role } from '@prisma/client';
import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';

interface ClubAccountsProps {
  clubId?: number;
  onError?: (error: string) => void;
  expanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
}

const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 45%)`;
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const roleIcon: Record<Role, React.ReactNode> = {
  [Role.ADMIN]: <AdminIcon sx={{ fontSize: 16 }} />,
  [Role.DIRECTOR]: <DirectorIcon sx={{ fontSize: 16 }} />,
  [Role.COACH]: <CoachIcon sx={{ fontSize: 16 }} />,
  [Role.PLAYER]: <PlayerIcon sx={{ fontSize: 16 }} />,
  [Role.PARENT]: <ParentIcon sx={{ fontSize: 16 }} />,
  [Role.TEAM_MANAGER]: <TeamManagerIcon sx={{ fontSize: 16 }} />,
};

const roleColor: Record<Role, 'error' | 'warning' | 'primary' | 'success' | 'info' | 'secondary'> =
  {
    [Role.ADMIN]: 'error',
    [Role.DIRECTOR]: 'warning',
    [Role.COACH]: 'primary',
    [Role.PLAYER]: 'success',
    [Role.PARENT]: 'info',
    [Role.TEAM_MANAGER]: 'secondary',
  };

const ClubAccounts: React.FC<ClubAccountsProps> = ({
  clubId,
  onError,
  expanded,
  onExpandedChange,
}) => {
  const { t } = useTranslation();
  const [emailInput, setEmailInput] = useState<string>('');
  const [addAccount, setAddAccount] = useState<AccountInterface | null>(null);
  const [filteredAccounts, setFilteredAccounts] = useState<AccountInterface[]>([]);
  const [accounts, setAccounts] = useState<AccountClubInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    if (!clubId) return;

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
  }, [clubId, onError, t]);

  const handleEmailChange = async (email: string): Promise<void> => {
    setEmailInput(email);
    if (email.length > 2) {
      onError?.('');
      setLoading(true);
      try {
        const response = await fetch(`/api/accounts?email=${encodeURIComponent(email)}`);
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
      } finally {
        setLoading(false);
      }
    } else {
      setFilteredAccounts([]);
    }
  };

  const handleAddAccount = async (): Promise<void> => {
    if (!clubId || !addAccount) return;
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
        setAddAccount(null);
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

  const isControlled = expanded !== undefined;
  const accordionProps = isControlled
    ? {
        expanded,
        onChange: (_event: React.SyntheticEvent, isExpanded: boolean): void => {
          onExpandedChange?.(isExpanded);
        },
      }
    : {};

  return (
    <Accordion {...accordionProps} sx={{ mb: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', pr: 2 }}>
          <GroupIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {t('account.manage')}
          </Typography>
          <Chip size="small" variant="outlined" label={accounts.length} sx={{ ml: 'auto' }} />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {/* Add account */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 3, alignItems: { sm: 'stretch' } }}
        >
          <Autocomplete
            sx={{ flex: 1 }}
            options={filteredAccounts}
            getOptionLabel={(option) => option.email}
            filterOptions={(x) => x}
            loading={loading}
            noOptionsText={emailInput.length > 2 ? t('account.fetch.notFound') : t('common.search')}
            value={addAccount}
            onChange={(_, value) => setAddAccount(value)}
            inputValue={emailInput}
            onInputChange={(_, value, reason) => {
              if (reason === 'reset') return;
              void handleEmailChange(value);
            }}
            renderOption={(props, option) => {
              const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & {
                key?: React.Key;
              };
              return (
                <Box
                  key={key}
                  component="li"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                  {...rest}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: stringToColor(option.email),
                      fontSize: 12,
                    }}
                  >
                    {getInitials(option.name || option.email)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {option.name || option.email}
                    </Typography>
                    {option.name && (
                      <Typography variant="caption" color="text.secondary">
                        {option.email}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField {...params} label={t('account.addByEmail')} size="small" />
            )}
          />
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleAddAccount}
            disabled={!addAccount}
          >
            {t('account.add')}
          </Button>
        </Stack>

        {/* Accounts list */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {t('account.linked')}
          </Typography>
          <Chip size="small" label={accounts.length} variant="outlined" />
        </Box>

        {accounts.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              borderStyle: 'dashed',
              backgroundColor: 'action.hover',
            }}
          >
            <GroupIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {t('account.fetch.notFound')}
            </Typography>
          </Paper>
        ) : (
          <>
            {accounts.length > 3 && (
              <TextField
                size="small"
                fullWidth
                placeholder={t('common.search')}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{ mb: 1.5 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}

            <Stack spacing={1}>
              {accounts
                .filter((a) => {
                  const q = filter.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    (a.name || '').toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
                  );
                })
                .map((accountClub) => {
                  const avatarColor = stringToColor(accountClub.email);
                  return (
                    <Paper
                      key={accountClub.id}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'wrap',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 1,
                        },
                      }}
                    >
                      {/* Identity */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          minWidth: 220,
                          flex: '1 1 240px',
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: avatarColor,
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        >
                          {getInitials(accountClub.name || accountClub.email)}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {accountClub.name || accountClub.email}
                          </Typography>
                          {accountClub.name && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                color: 'text.secondary',
                                minWidth: 0,
                              }}
                            >
                              <EmailIcon sx={{ fontSize: 12 }} />
                              <Typography
                                variant="caption"
                                sx={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {accountClub.email}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>

                      {/* Role chips */}
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 0.5,
                          flex: '2 1 360px',
                        }}
                      >
                        {Object.values(Role).map((role) => {
                          const active = accountClub.roles.includes(role);
                          return (
                            <Tooltip
                              key={role}
                              title={active ? t('actions.remove') : t('actions.add')}
                            >
                              <Chip
                                icon={
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      pl: 0.5,
                                    }}
                                  >
                                    {roleIcon[role]}
                                  </Box>
                                }
                                label={RoleDisplayNames[role]}
                                size="small"
                                color={active ? roleColor[role] : 'default'}
                                variant={active ? 'filled' : 'outlined'}
                                onClick={() => handleRoleChange(accountClub.id, role, !active)}
                                sx={{
                                  fontWeight: active ? 700 : 400,
                                  cursor: 'pointer',
                                  opacity: active ? 1 : 0.6,
                                  '&:hover': { opacity: 1 },
                                }}
                              />
                            </Tooltip>
                          );
                        })}
                      </Box>

                      {/* Remove */}
                      <Box sx={{ ml: 'auto' }}>
                        <Tooltip title={t('actions.remove')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveAccount(accountClub.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Paper>
                  );
                })}
            </Stack>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default ClubAccounts;
