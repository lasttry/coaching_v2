'use client';

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  RocketLaunch as DeployIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Update as UpdateIcon,
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
  updateAvailable: boolean;
  commitsBehind: number;
  pm2Status: string;
}

interface DeployStep {
  step: string;
  output: string;
  success: boolean;
}

interface DeployResponse {
  success: boolean;
  steps: DeployStep[];
  message?: string;
  error?: string;
}

export default function DeployPage(): React.JSX.Element {
  const { t } = useTranslation();
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<DeployResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchStatus = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/deploy');
      if (!res.ok) {
        if (res.status === 403) {
          setError('Não tens permissão para aceder a esta página.');
          return;
        }
        throw new Error('Failed to fetch status');
      }
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setError('Erro ao obter estado do servidor.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleDeploy = async (): Promise<void> => {
    setConfirmOpen(false);
    setDeploying(true);
    setDeployResult(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/deploy', {
        method: 'POST',
      });
      const data = await res.json();
      setDeployResult(data);

      if (data.success) {
        // Refresh status after successful deploy
        setTimeout(() => fetchStatus(), 2000);
      }
    } catch (err) {
      setError('Erro ao executar deploy.');
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !status) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Deploy & Atualizações
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Current Status */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Estado Atual</Typography>
          <Button startIcon={<RefreshIcon />} onClick={fetchStatus} disabled={loading}>
            Atualizar
          </Button>
        </Box>

        {status && (
          <>
            <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
              <Chip
                label={`PM2: ${status.pm2Status}`}
                color={getStatusColor(status.pm2Status)}
                variant="outlined"
              />
              {status.updateAvailable ? (
                <Chip
                  icon={<UpdateIcon />}
                  label={`${status.commitsBehind} atualização(ões) disponível(eis)`}
                  color="warning"
                />
              ) : (
                <Chip icon={<SuccessIcon />} label="Atualizado" color="success" />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" color="text.secondary">
              Último commit em produção:
            </Typography>
            <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" fontFamily="monospace">
                <strong>{status.currentCommit.hash}</strong> - {status.currentCommit.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                por {status.currentCommit.author}, {status.currentCommit.time}
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      {/* Deploy Button */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Executar Deploy
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Isto irá: git pull → npm install → prisma generate → prisma migrate → next build → pm2
          restart
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={deploying ? <CircularProgress size={20} color="inherit" /> : <DeployIcon />}
          onClick={() => setConfirmOpen(true)}
          disabled={deploying}
        >
          {deploying ? 'A fazer deploy...' : 'Iniciar Deploy'}
        </Button>

        {deploying && (
          <Alert severity="info" sx={{ mt: 2 }}>
            O deploy está em execução. Isto pode demorar alguns minutos...
          </Alert>
        )}
      </Paper>

      {/* Deploy Result */}
      {deployResult && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Resultado do Deploy
          </Typography>

          <Alert severity={deployResult.success ? 'success' : 'error'} sx={{ mb: 2 }}>
            {deployResult.success
              ? 'Deploy concluído com sucesso!'
              : `Deploy falhou: ${deployResult.error}`}
          </Alert>

          <List dense>
            {deployResult.steps.map((step, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {step.success ? <SuccessIcon color="success" /> : <ErrorIcon color="error" />}
                </ListItemIcon>
                <ListItemText
                  primary={step.step}
                  secondary={
                    <Box
                      component="pre"
                      sx={{
                        fontSize: '0.75rem',
                        maxHeight: 100,
                        overflow: 'auto',
                        bgcolor: 'grey.100',
                        p: 1,
                        borderRadius: 1,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {step.output || 'OK'}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar Deploy</DialogTitle>
        <DialogContent>
          <Typography>
            Tens a certeza que queres fazer deploy para produção? A aplicação pode ficar
            temporariamente indisponível durante o processo.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeploy} variant="contained" color="primary">
            Sim, fazer deploy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
