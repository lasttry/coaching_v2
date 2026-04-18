'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Collapse,
  IconButton,
  Avatar,
} from '@mui/material';
import { IconChevronDown, IconChevronUp, IconFilter } from '@tabler/icons-react';
import dayjs from 'dayjs';

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';

interface GameInfo {
  id: number;
  date: Date;
  opponent: string;
  away: boolean;
}

interface CompetitionStats {
  competitionId: number;
  competitionName: string;
  serieId?: number;
  serieName?: string;
  gameCount: number;
  games: GameInfo[];
}

interface AthleteStats {
  id: number;
  name: string;
  number: string;
  birthdate: string;
  photo: string | null;
  totalGames: number;
  byCompetition: CompetitionStats[];
}

interface Competition {
  id: number;
  name: string;
  series: { id: number; name: string }[];
}

interface Team {
  id: number;
  name: string;
}

interface StatisticsData {
  athletes: AthleteStats[];
  totalGames: number;
  competitions: Competition[];
  teams: Team[];
  filters: {
    competitionId: number | null;
    competitionSerieId: number | null;
    startDate: string | null;
    endDate: string | null;
    teamId: number | null;
  };
}

const AthleteStatisticsPage: React.FC = () => {
  const { t } = useTranslation();

  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [competitionId, setCompetitionId] = useState<string>('');
  const [competitionSerieId, setCompetitionSerieId] = useState<string>('');
  const [teamId, setTeamId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [expandedAthlete, setExpandedAthlete] = useState<number | null>(null);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (competitionId) params.append('competitionId', competitionId);
      if (competitionSerieId) params.append('competitionSerieId', competitionSerieId);
      if (teamId) params.append('teamId', teamId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/athletes/statistics?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  }, [competitionId, competitionSerieId, teamId, startDate, endDate, t]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const handleClearFilters = () => {
    setCompetitionId('');
    setCompetitionSerieId('');
    setTeamId('');
    setStartDate('');
    setEndDate('');
  };

  const selectedCompetition = data?.competitions.find((c) => c.id === parseInt(competitionId));

  const toggleExpanded = (athleteId: number) => {
    setExpandedAthlete(expandedAthlete === athleteId ? null : athleteId);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">{t('athleteStatistics')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('athleteStatisticsSubtitle')}
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <IconFilter size={20} />
          <Typography variant="h6">{t('filters')}</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>{t('Competition')}</InputLabel>
            <Select
              value={competitionId}
              label={t('Competition')}
              onChange={(e) => {
                setCompetitionId(e.target.value);
                setCompetitionSerieId('');
              }}
            >
              <MenuItem value="">{t('all')}</MenuItem>
              {data?.competitions.map((comp) => (
                <MenuItem key={comp.id} value={comp.id.toString()}>
                  {comp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedCompetition && selectedCompetition.series.length > 0 && (
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>{t('series')}</InputLabel>
              <Select
                value={competitionSerieId}
                label={t('series')}
                onChange={(e) => setCompetitionSerieId(e.target.value)}
              >
                <MenuItem value="">{t('all')}</MenuItem>
                {selectedCompetition.series.map((serie) => (
                  <MenuItem key={serie.id} value={serie.id.toString()}>
                    {serie.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>{t('Team')}</InputLabel>
            <Select value={teamId} label={t('Team')} onChange={(e) => setTeamId(e.target.value)}>
              <MenuItem value="">{t('all')}</MenuItem>
              {data?.teams.map((team) => (
                <MenuItem key={team.id} value={team.id.toString()}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label={t('startDate')}
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 160 }}
          />

          <TextField
            label={t('endDate')}
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 160 }}
          />

          <Button variant="outlined" onClick={handleClearFilters}>
            {t('clearFilters')}
          </Button>
        </Box>
      </Paper>

      {/* Summary */}
      {data && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">
              {data.totalGames}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('totalGames')}
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">
              {data.athletes.filter((a) => a.totalGames > 0).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('athletesWithGames')}
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">
              {data.athletes.length > 0
                ? (
                    data.athletes.reduce((sum, a) => sum + a.totalGames, 0) /
                    data.athletes.filter((a) => a.totalGames > 0).length
                  ).toFixed(1)
                : 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('averageGamesPerAthlete')}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Results Table */}
      {!loading && data && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 50 }}></TableCell>
                <TableCell sx={{ width: 60 }}>{t('number')}</TableCell>
                <TableCell>{t('name')}</TableCell>
                <TableCell sx={{ width: 100 }}>{t('birthdate')}</TableCell>
                <TableCell sx={{ width: 100, textAlign: 'center' }}>{t('totalGames')}</TableCell>
                <TableCell>{t('byCompetition')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.athletes.map((athlete) => (
                <React.Fragment key={athlete.id}>
                  <TableRow
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'action.hover' },
                      backgroundColor: athlete.totalGames === 0 ? 'grey.100' : 'inherit',
                    }}
                    onClick={() => toggleExpanded(athlete.id)}
                  >
                    <TableCell>
                      <IconButton size="small">
                        {expandedAthlete === athlete.id ? (
                          <IconChevronUp size={18} />
                        ) : (
                          <IconChevronDown size={18} />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 'bold', color: 'primary.main' }}
                      >
                        {athlete.number || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={athlete.photo || undefined} sx={{ width: 32, height: 32 }}>
                          {athlete.name.charAt(0)}
                        </Avatar>
                        <Typography>{athlete.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {athlete.birthdate ? dayjs(athlete.birthdate).format('DD/MM/YYYY') : '-'}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip
                        label={athlete.totalGames}
                        color={athlete.totalGames > 0 ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {athlete.byCompetition.map((comp) => (
                          <Chip
                            key={`${comp.competitionId}-${comp.serieId || 0}`}
                            label={`${comp.competitionName}${comp.serieName ? ` - ${comp.serieName}` : ''}: ${comp.gameCount}`}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Details */}
                  <TableRow>
                    <TableCell sx={{ p: 0 }} colSpan={6}>
                      <Collapse in={expandedAthlete === athlete.id}>
                        <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
                          {athlete.byCompetition.length === 0 ? (
                            <Typography color="text.secondary">{t('noGames')}</Typography>
                          ) : (
                            athlete.byCompetition.map((comp) => (
                              <Box
                                key={`${comp.competitionId}-${comp.serieId || 0}`}
                                sx={{ mb: 2 }}
                              >
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                  {comp.competitionName}
                                  {comp.serieName && ` - ${comp.serieName}`} ({comp.gameCount}{' '}
                                  {comp.gameCount === 1 ? t('game') : t('games')})
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {comp.games.map((game) => (
                                    <Chip
                                      key={game.id}
                                      label={`${dayjs(game.date).format('DD/MM')} - ${game.away ? '@' : 'vs'} ${game.opponent}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{ backgroundColor: 'white' }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            ))
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AthleteStatisticsPage;
