'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';
import { log } from '@/lib/logger';

interface PublicEmailSettings {
  enabled: boolean;
  host: string | null;
  port: number | null;
  secure: boolean;
  user: string | null;
  fromEmail: string | null;
  fromName: string | null;
  replyTo: string | null;
  hasPassword: boolean;
}

interface FormState {
  enabled: boolean;
  host: string;
  port: string;
  secure: boolean;
  user: string;
  password: string;
  fromEmail: string;
  fromName: string;
  replyTo: string;
  hasPassword: boolean;
}

const EMPTY_FORM: FormState = {
  enabled: false,
  host: '',
  port: '587',
  secure: false,
  user: '',
  password: '',
  fromEmail: '',
  fromName: '',
  replyTo: '',
  hasPassword: false,
};

interface Props {
  clubId: number;
  expanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
}

const ClubEmailSettings: React.FC<Props> = ({ clubId, expanded, onExpandedChange }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clubs/${clubId}/email-settings`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as PublicEmailSettings;
      setForm({
        enabled: data.enabled,
        host: data.host ?? '',
        port: data.port != null ? String(data.port) : '587',
        secure: data.secure,
        user: data.user ?? '',
        password: '',
        fromEmail: data.fromEmail ?? '',
        fromName: data.fromName ?? '',
        replyTo: data.replyTo ?? '',
        hasPassword: data.hasPassword,
      });
    } catch (err) {
      log.error('Failed to load email settings:', err);
      setError(t('email.fetch.error'));
    } finally {
      setLoading(false);
    }
  }, [clubId, t]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(null);
    setError(null);
  };

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const body: Record<string, unknown> = {
        enabled: form.enabled,
        host: form.host || null,
        port: form.port ? Number(form.port) : null,
        secure: form.secure,
        user: form.user || null,
        fromEmail: form.fromEmail || null,
        fromName: form.fromName || null,
        replyTo: form.replyTo || null,
      };
      if (form.password.length > 0) {
        body.password = form.password;
      }

      const res = await fetch(`/api/clubs/${clubId}/email-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      const updated = (await res.json()) as PublicEmailSettings;
      setForm((prev) => ({
        ...prev,
        password: '',
        hasPassword: updated.hasPassword,
      }));
      setSuccess(t('email.save.success'));
    } catch (err) {
      log.error('Failed to save email settings:', err);
      setError(err instanceof Error ? err.message : t('email.save.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleClearPassword = async (): Promise<void> => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/clubs/${clubId}/email-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearPassword: true }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = (await res.json()) as PublicEmailSettings;
      setForm((prev) => ({ ...prev, password: '', hasPassword: updated.hasPassword }));
      setSuccess(t('email.password.cleared'));
    } catch (err) {
      log.error('Failed to clear password:', err);
      setError(t('email.save.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async (): Promise<void> => {
    if (!testEmail) return;
    setTesting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/clubs/${clubId}/email-settings/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
        messageId?: string;
      } | null;
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      setSuccess(t('email.test.success', { to: testEmail }));
    } catch (err) {
      log.error('Failed to send test email:', err);
      setError(err instanceof Error ? err.message : t('email.test.error'));
    } finally {
      setTesting(false);
    }
  };

  if (!clubId) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t('email.saveClubFirst')}
      </Typography>
    );
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
          <EmailOutlinedIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {t('email.settings.title')}
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <Chip
              size="small"
              label={form.enabled ? t('email.status.enabled') : t('email.status.disabled')}
              color={form.enabled ? 'success' : 'default'}
              variant={form.enabled ? 'filled' : 'outlined'}
            />
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {t('email.settings.description')}
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={form.enabled}
                  onChange={(e) => handleChange('enabled', e.target.checked)}
                />
              }
              label={t('email.enabled.label')}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  label={t('email.host.label')}
                  placeholder="smtp.gmail.com"
                  value={form.host}
                  onChange={(e) => handleChange('host', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField
                  label={t('email.port.label')}
                  type="number"
                  value={form.port}
                  onChange={(e) => handleChange('port', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.secure}
                      onChange={(e) => handleChange('secure', e.target.checked)}
                    />
                  }
                  label={t('email.secure.label')}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t('email.user.label')}
                  value={form.user}
                  onChange={(e) => handleChange('user', e.target.value)}
                  autoComplete="off"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t('email.password.label')}
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  helperText={
                    form.hasPassword
                      ? t('email.password.helperExisting')
                      : t('email.password.helperEmpty')
                  }
                  autoComplete="new-password"
                  fullWidth
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((v) => !v)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? (
                              <VisibilityOffIcon fontSize="small" />
                            ) : (
                              <VisibilityIcon fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                {form.hasPassword && (
                  <Button
                    size="small"
                    color="error"
                    onClick={handleClearPassword}
                    disabled={saving}
                    sx={{ mt: 0.5 }}
                  >
                    {t('email.password.clear')}
                  </Button>
                )}
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t('email.fromEmail.label')}
                  placeholder="alertas@clube.pt"
                  value={form.fromEmail}
                  onChange={(e) => handleChange('fromEmail', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t('email.fromName.label')}
                  value={form.fromName}
                  onChange={(e) => handleChange('fromName', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label={t('email.replyTo.label')}
                  value={form.replyTo}
                  onChange={(e) => handleChange('replyTo', e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving || loading}
                sx={{ flex: 1 }}
              >
                {saving ? <CircularProgress size={20} /> : t('actions.save')}
              </Button>
            </Stack>

            <Box sx={{ mt: 2, p: 2, borderRadius: 1, backgroundColor: 'action.hover' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                {t('email.test.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('email.test.description')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label={t('email.test.to')}
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleSendTest}
                  disabled={testing || !testEmail || !form.enabled}
                >
                  {testing ? <CircularProgress size={20} /> : t('email.test.send')}
                </Button>
              </Stack>
              {!form.enabled && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  {t('email.test.enableFirst')}
                </Typography>
              )}
            </Box>
          </Stack>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default ClubEmailSettings;
