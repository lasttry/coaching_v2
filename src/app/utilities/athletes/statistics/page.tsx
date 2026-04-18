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
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [competitionId, setCompetitionId] = useState<string>('');
  const [competitionSerieId, setCompetitionSerieId] = useState<string>('');
  const [teamId, setTeamId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [expandedAthlete, setExpandedAthlete] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(!isMobile);

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
      setError(t('messages.fetchError'));
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
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant={isMobile ? 'h5' : 'h4'}>{t('athlete.statistics.title')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('athlete.statistics.subtitle')}
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: showFilters ? 2 : 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconFilter size={20} />
            <Typography variant="h6">{t('filters')}</Typography>
          </Box>
          {isMobile && (
            <Button size="small" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? t('actions.hide') : t('actions.show')}
            </Button>
          )}
        </Box>

        <Collapse in={showFilters || !isMobile}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap',
              gap: { xs: 1.5, sm: 2 },
              alignItems: { xs: 'stretch', sm: 'flex-end' },
            }}
          >
            <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }} size="small">
              <InputLabel>{t('competition.singular')}</InputLabel>
              <Select
                value={competitionId}
                label={t('competition.singular')}
                onChange={(e) => {
                  setCompetitionId(e.target.value);
                  setCompetitionSerieId('');
                }}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {data?.competitions.map((comp) => (
                  <MenuItem key={comp.id} value={comp.id.toString()}>
                    {comp.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedCompetition && selectedCompetition.series.length > 0 && (
              <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }} size="small">
                <InputLabel>{t('competition.series')}</InputLabel>
                <Select
                  value={competitionSerieId}
                  label={t('competition.series')}
                  onChange={(e) => setCompetitionSerieId(e.target.value)}
                >
                  <MenuItem value="">{t('common.all')}</MenuItem>
                  {selectedCompetition.series.map((serie) => (
                    <MenuItem key={serie.id} value={serie.id.toString()}>
                      {serie.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }} size="small">
              <InputLabel>{t('team.singular')}</InputLabel>
              <Select
                value={teamId}
                label={t('team.singular')}
                onChange={(e) => setTeamId(e.target.value)}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {data?.teams.map((team) => (
                  <MenuItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexDirection: { xs: 'column', sm: 'row' },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <TextField
                label={t('filters.startDate')}
                type="date"
                size="small"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ width: { xs: '100%', sm: 140 } }}
              />

              <TextField
                label={t('filters.endDate')}
                type="date"
                size="small"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ width: { xs: '100%', sm: 140 } }}
              />
            </Box>

            <Button
              variant="outlined"
              onClick={handleClearFilters}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {t('filters.clear')}
            </Button>
          </Box>
        </Collapse>
      </Paper>

      {/* Summary */}
      {data && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'row', sm: 'row' },
            gap: { xs: 1, sm: 2 },
            mb: 2,
          }}
        >
          <Paper sx={{ p: { xs: 1, sm: 2 }, flex: 1, textAlign: 'center' }}>
            <Typography variant={isMobile ? 'h4' : 'h3'} color="primary">
              {data.totalGames}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('game.total')}
            </Typography>
          </Paper>
          <Paper sx={{ p: { xs: 1, sm: 2 }, flex: 1, textAlign: 'center' }}>
            <Typography variant={isMobile ? 'h4' : 'h3'} color="primary">
              {data.athletes.filter((a) => a.totalGames > 0).length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('athlete.statistics.withGames')}
            </Typography>
          </Paper>
          <Paper sx={{ p: { xs: 1, sm: 2 }, flex: 1, textAlign: 'center' }}>
            <Typography variant={isMobile ? 'h4' : 'h3'} color="primary">
              {data.athletes.length > 0
                ? (
                    data.athletes.reduce((sum, a) => sum + a.totalGames, 0) /
                    data.athletes.filter((a) => a.totalGames > 0).length
                  ).toFixed(1)
                : 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isMobile ? t('game.average') : t('athlete.statistics.averagePerAthlete')}
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

      {/* Results - Mobile Cards */}
      {!loading && data && isMobile && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {data.athletes.map((athlete) => (
            <Card
              key={athlete.id}
              sx={{
                backgroundColor: athlete.totalGames === 0 ? 'grey.100' : 'background.paper',
              }}
            >
              <CardContent
                sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, cursor: 'pointer' }}
                onClick={() => toggleExpanded(athlete.id)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar src={athlete.photo || undefined} sx={{ width: 40, height: 40 }}>
                    {athlete.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 'bold', color: 'primary.main' }}
                      >
                        #{athlete.number || '-'}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }} noWrap>
                        {athlete.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {athlete.byCompetition.slice(0, 2).map((comp) => (
                        <Chip
                          key={`${comp.competitionId}-${comp.serieId || 0}`}
                          label={`${comp.competitionName}: ${comp.gameCount}`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      ))}
                      {athlete.byCompetition.length > 2 && (
                        <Chip
                          label={`+${athlete.byCompetition.length - 2}`}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip
                      label={athlete.totalGames}
                      color={athlete.totalGames > 0 ? 'primary' : 'default'}
                      size="small"
                    />
                    <IconButton size="small">
                      {expandedAthlete === athlete.id ? (
                        <IconChevronUp size={18} />
                      ) : (
                        <IconChevronDown size={18} />
                      )}
                    </IconButton>
                  </Box>
                </Box>

                <Collapse in={expandedAthlete === athlete.id}>
                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    {athlete.byCompetition.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        {t('game.noGames')}
                      </Typography>
                    ) : (
                      athlete.byCompetition.map((comp) => (
                        <Box key={`${comp.competitionId}-${comp.serieId || 0}`} sx={{ mb: 1.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            {comp.competitionName}
                            {comp.serieName && ` - ${comp.serieName}`} ({comp.gameCount})
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {comp.games.map((game) => (
                              <Chip
                                key={game.id}
                                label={`${dayjs(game.date).format('DD/MM')} ${game.away ? '@' : 'vs'} ${game.opponent}`}
                                size="small"
                                variant="outlined"
                                sx={{ height: 22, fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Results - Desktop Table */}
      {!loading && data && !isMobile && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 50 }}></TableCell>
                <TableCell sx={{ width: 60 }}>{t('common.number')}</TableCell>
                <TableCell>{t('common.name')}</TableCell>
                <TableCell sx={{ width: 100 }}>{t('common.birthdate')}</TableCell>
                <TableCell sx={{ width: 100, textAlign: 'center' }}>{t('game.total')}</TableCell>
                <TableCell>{t('game.byCompetition')}</TableCell>
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
                            <Typography color="text.secondary">{t('game.noGames')}</Typography>
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
