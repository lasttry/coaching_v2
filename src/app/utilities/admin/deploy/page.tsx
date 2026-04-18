'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Collapse,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  RocketLaunch as DeployIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Update as UpdateIcon,
  PlayArrow as RunningIcon,
  Schedule as PendingIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';

interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  time: string;
}

interface StatusResponse {
  currentCommit: CommitInfo;
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  commitsBehind: number;
  pm2Status: string;
}

interface StepProgress {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  output: string;
  exitCode?: number;
}

export default function DeployPage(): React.JSX.Element {
  const { t } = useTranslation();
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [steps, setSteps] = useState<StepProgress[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [deploySuccess, setDeploySuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const outputRef = useRef<HTMLPreElement>(null);

  const fetchStatus = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/deploy');
      if (!res.ok) {
        if (res.status === 403) {
          setError(t('deploy.error.noPermission'));
          return;
        }
        throw new Error('Failed to fetch status');
      }
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setError(t('deploy.errorFetchingStatus'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [steps, currentStepIndex]);

  const handleDeploy = async (): Promise<void> => {
    setConfirmOpen(false);
    setDeploying(true);
    setSteps([]);
    setCurrentStepIndex(-1);
    setDeploySuccess(null);
    setError(null);
    setExpandedStep(null);

    try {
      const res = await fetch('/api/admin/deploy', {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t('deploy.errorExecuting'));
        setDeploying(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError(t('deploy.streamNotAvailable'));
        setDeploying(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const eventBlock of events) {
          if (!eventBlock.trim()) continue;

          const lines = eventBlock.split('\n');
          let eventType = '';
          let eventData = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              eventData = line.slice(6);
            }
          }

          console.log('SSE Event received:', eventType, eventData);

          if (eventType && eventData) {
            try {
              const data = JSON.parse(eventData);
              console.log('Parsed SSE data:', eventType, data);

              switch (eventType) {
                case 'deploy_start':
                  setSteps(
                    data.steps.map((name: string) => ({
                      name,
                      status: 'pending',
                      output: '',
                    }))
                  );
                  break;

                case 'step_start':
                  setCurrentStepIndex(data.stepIndex);
                  setExpandedStep(data.stepIndex);
                  setSteps((prev) =>
                    prev.map((step, i) =>
                      i === data.stepIndex ? { ...step, status: 'running' } : step
                    )
                  );
                  break;

                case 'step_output':
                  setSteps((prev) =>
                    prev.map((step, i) =>
                      i === data.stepIndex ? { ...step, output: step.output + data.output } : step
                    )
                  );
                  break;

                case 'step_complete':
                  setSteps((prev) =>
                    prev.map((step, i) =>
                      i === data.stepIndex
                        ? {
                            ...step,
                            status: data.success ? 'success' : 'error',
                            exitCode: data.exitCode,
                          }
                        : step
                    )
                  );
                  break;

                case 'step_error':
                  setSteps((prev) =>
                    prev.map((step, i) =>
                      i === data.stepIndex
                        ? { ...step, status: 'error', output: step.output + '\n' + data.error }
                        : step
                    )
                  );
                  break;

                case 'deploy_complete':
                  setDeploySuccess(data.success);
                  setCurrentStepIndex(-1);
                  if (data.success) {
                    setTimeout(() => fetchStatus(), 2000);
                  }
                  break;
              }
            } catch (parseError) {
              console.error('Error parsing SSE event:', parseError, eventData);
            }
          }
        }
      }
    } catch (err) {
      setError(t('deploy.errorExecuting'));
      console.error(err);
    } finally {
      setDeploying(false);
    }
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'online':
        return 'success';
      case 'stopped':
      case 'errored':
        return 'error';
      default:
        return 'warning';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !status) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('deploy.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Current Status */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '2' }}
        >
          <Typography variant="h6">{t('deploy.statusTitle')}</Typography>
          <Button startIcon={<RefreshIcon />} onClick={fetchStatus} disabled={loading}>
            {t('actions.refresh')}
          </Button>
        </Box>

        {status && (
          <>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, alignItems: 'center' }}>
              <Chip
                label={status.currentVersion}
                color="primary"
                variant="filled"
                sx={{ fontWeight: 'bold', fontSize: '1rem' }}
              />
              <Chip
                label={`PM2: ${status.pm2Status}`}
                color={getStatusColor(status.pm2Status)}
                variant="outlined"
              />
              {status.updateAvailable ? (
                <Chip
                  icon={<UpdateIcon />}
                  label={
                    status.latestVersion !== status.currentVersion
                      ? `${status.latestVersion} ${t('deploy.updateAvailable')}`
                      : t('deploy.updatesAvailable', { count: status.commitsBehind })
                  }
                  color="warning"
                />
              ) : (
                <Chip icon={<SuccessIcon />} label={t('deploy.upToDate')} color="success" />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" color="text.secondary">
              {t('deploy.lastCommitInProduction')}:
            </Typography>
            <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                <strong>{status.currentCommit.hash}</strong> - {status.currentCommit.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('common.by')} {status.currentCommit.author}, {status.currentCommit.time}
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      {/* Deploy Button */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('deploy.executeTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('deploy.description')}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={deploying ? <CircularProgress size={20} color="inherit" /> : <DeployIcon />}
          onClick={() => setConfirmOpen(true)}
          disabled={deploying}
        >
          {deploying ? t('deploy.inProgress') : t('deploy.start')}
        </Button>

        {deploying && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('deploy.monitorInfo')}
          </Alert>
        )}
      </Paper>

      {/* Deploy Progress */}
      {(steps.length > 0 || deploying) && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {deploying ? t('deploy.progressTitle') : t('deploy.resultTitle')}
          </Typography>

          {deploySuccess !== null && (
            <Alert severity={deploySuccess ? 'success' : 'error'} sx={{ mb: 2 }}>
              {deploySuccess ? t('deploy.successMessage') : t('deploy.failedMessage')}
            </Alert>
          )}

          {deploying && steps.length === 0 && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                {t('deploy.connecting')}
              </Typography>
            </Box>
          )}

          {deploying && steps.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('deploy.stepOf', { current: currentStepIndex + 1, total: steps.length })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((currentStepIndex + 1) / steps.length) * 100}
              />
            </Box>
          )}

          <List dense>
            {steps.map((step, index) => (
              <Box key={index}>
                <ListItem
                  component="div"
                  onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor:
                      step.status === 'running'
                        ? 'action.selected'
                        : step.status === 'error'
                          ? 'error.light'
                          : undefined,
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ListItemIcon>
                    {step.status === 'pending' && <PendingIcon color="disabled" />}
                    {step.status === 'running' && <CircularProgress size={24} color="primary" />}
                    {step.status === 'success' && <SuccessIcon color="success" />}
                    {step.status === 'error' && <ErrorIcon color="error" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: step.status === 'running' ? 600 : 400,
                          }}
                        >
                          {step.name}
                        </Typography>
                        {step.status === 'running' && (
                          <Chip label={t('status.running')} size="small" color="primary" />
                        )}
                        {step.exitCode !== undefined && step.exitCode !== 0 && (
                          <Chip label={`Exit: ${step.exitCode}`} size="small" color="error" />
                        )}
                      </Box>
                    }
                  />
                  {step.output &&
                    (expandedStep === index ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                </ListItem>
                <Collapse in={expandedStep === index && !!step.output}>
                  <Box
                    component="pre"
                    ref={step.status === 'running' ? outputRef : undefined}
                    sx={{
                      fontSize: '0.7rem',
                      maxHeight: 200,
                      overflow: 'auto',
                      bgcolor: 'grey.900',
                      color: 'grey.100',
                      p: 1.5,
                      mx: 2,
                      mb: 1,
                      borderRadius: 1,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: 'monospace',
                    }}
                  >
                    {step.output || t('deploy.awaitingOutput')}
                  </Box>
                </Collapse>
              </Box>
            ))}
          </List>
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{t('deploy.confirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('deploy.confirmMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>{t('actions.cancel')}</Button>
          <Button onClick={handleDeploy} variant="contained" color="primary">
            {t('deploy.yesStart')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
