'use client';

import React, { ReactElement } from 'react';
import NextLink from 'next/link';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import {
  SportsBasketball as SportsBasketballIcon,
  Groups as GroupsIcon,
  CalendarMonth as CalendarMonthIcon,
  Cake as CakeIcon,
  Place as PlaceIcon,
  EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';
import dayjs from 'dayjs';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import { useHome } from '@/hooks/useHome';

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 45%)`;
};

interface StatTileProps {
  icon: ReactElement;
  label: string;
  value: number | string;
  color: string;
  loading?: boolean;
}

const StatTile: React.FC<StatTileProps> = ({ icon, label, value, color, loading }) => (
  <Card sx={{ height: '100%' }} elevation={3}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar
        sx={{
          width: 56,
          height: 56,
          bgcolor: color,
          color: 'common.white',
        }}
      >
        {icon}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width={60} height={32} />
        ) : (
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

const HomePage = (): ReactElement => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useHome();

  const athletesCount = data?.totals.athletes ?? 0;
  const teamsCount = data?.totals.teams ?? 0;
  const upcomingGamesCount = data?.totals.upcomingGames ?? 0;

  const chartData = data?.athletesByBirthYear ?? [];

  return (
    <PageContainer title={t('home.title')} description={t('home.description')}>
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t('home.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('home.subtitle')}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {(error as Error).message}
          </Alert>
        )}

        {/* Totals */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatTile
              icon={<SportsBasketballIcon />}
              label={t('home.stats.athletes')}
              value={athletesCount}
              color="success.main"
              loading={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatTile
              icon={<GroupsIcon />}
              label={t('home.stats.teams')}
              value={teamsCount}
              color="primary.main"
              loading={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatTile
              icon={<CalendarMonthIcon />}
              label={t('home.stats.upcomingGames')}
              value={upcomingGamesCount}
              color="warning.main"
              loading={isLoading}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Upcoming games */}
          <Grid size={{ xs: 12, md: 7 }}>
            <DashboardCard
              title={t('home.upcomingGames.title')}
              subtitle={t('home.upcomingGames.subtitle')}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : (data?.upcomingGames.length ?? 0) === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  {t('home.upcomingGames.none')}
                </Typography>
              ) : (
                <Stack spacing={1.25} divider={<Divider flexItem />}>
                  {data!.upcomingGames.map((g, idx) => {
                    const date = dayjs(g.date);
                    const isNext = idx === 0;
                    const opponent = g.opponent?.name ?? '—';
                    const venue = g.venue?.name ?? (g.away ? t('game.away') : t('game.home'));
                    return (
                      <Card
                        key={g.id}
                        component={NextLink}
                        href={`/utilities/games?id=${g.id}`}
                        variant="outlined"
                        sx={{
                          textDecoration: 'none',
                          borderColor: isNext ? 'primary.main' : 'divider',
                          borderWidth: isNext ? 2 : 1,
                          transition: 'transform 0.15s, box-shadow 0.15s',
                          '&:hover': {
                            transform: 'translateX(4px)',
                            boxShadow: 2,
                          },
                        }}
                      >
                        <CardContent
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            '&:last-child': { pb: 2 },
                            p: 2,
                          }}
                        >
                          <Box
                            sx={{
                              textAlign: 'center',
                              minWidth: 64,
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              backgroundColor: isNext ? 'primary.main' : 'action.hover',
                              color: isNext ? 'primary.contrastText' : 'text.primary',
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ display: 'block', fontWeight: 700, textTransform: 'uppercase' }}
                            >
                              {date.format('MMM')}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>
                              {date.format('DD')}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              {date.format('HH:mm')}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {g.away
                                ? `${t('game.vs')} ${opponent} ${t('game.awayShort')}`
                                : `${t('game.vs')} ${opponent}`}
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                flexWrap: 'wrap',
                                mt: 0.5,
                              }}
                            >
                              {g.team && (
                                <Chip
                                  size="small"
                                  icon={<GroupsIcon sx={{ fontSize: 14 }} />}
                                  label={g.team.name}
                                  variant="outlined"
                                />
                              )}
                              {g.competition && (
                                <Chip
                                  size="small"
                                  icon={<EmojiEventsIcon sx={{ fontSize: 14 }} />}
                                  label={g.competition.name}
                                  variant="outlined"
                                  color="primary"
                                />
                              )}
                              <Chip
                                size="small"
                                icon={<PlaceIcon sx={{ fontSize: 14 }} />}
                                label={venue}
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                          {isNext && (
                            <Chip
                              size="small"
                              label={t('home.upcomingGames.next')}
                              color="primary"
                              sx={{ fontWeight: 700 }}
                            />
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </DashboardCard>
          </Grid>

          {/* Upcoming birthdays */}
          <Grid size={{ xs: 12, md: 5 }}>
            <DashboardCard
              title={t('home.birthdays.title')}
              subtitle={t('home.birthdays.subtitle')}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : (data?.upcomingBirthdays.length ?? 0) === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  {t('home.birthdays.none')}
                </Typography>
              ) : (
                <Stack spacing={1.25}>
                  {data!.upcomingBirthdays.map((b) => {
                    const date = dayjs(b.birthdate);
                    const isToday = b.daysUntil === 0;
                    return (
                      <Card
                        key={b.id}
                        variant="outlined"
                        sx={{
                          borderColor: isToday ? 'warning.main' : 'divider',
                          borderWidth: isToday ? 2 : 1,
                          backgroundColor: isToday
                            ? (theme) => theme.palette.warning.light + '22'
                            : 'background.paper',
                        }}
                      >
                        <CardActionArea
                          component={NextLink}
                          href={`/utilities/athletes`}
                          sx={{ p: 1.5 }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              src={b.photo || undefined}
                              sx={{
                                width: 44,
                                height: 44,
                                bgcolor: stringToColor(b.name),
                                fontWeight: 700,
                              }}
                            >
                              {getInitials(b.name)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 700,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {b.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {date.format('DD MMM')} ·{' '}
                                {t('home.birthdays.turning', { age: b.turningAge })}
                              </Typography>
                            </Box>
                            <Chip
                              size="small"
                              icon={<CakeIcon sx={{ fontSize: 14 }} />}
                              label={
                                isToday
                                  ? t('home.birthdays.today')
                                  : b.daysUntil === 1
                                    ? t('home.birthdays.tomorrow')
                                    : t('home.birthdays.inDays', { days: b.daysUntil })
                              }
                              color={isToday ? 'warning' : 'default'}
                              variant={isToday ? 'filled' : 'outlined'}
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </CardActionArea>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </DashboardCard>
          </Grid>

          {/* Chart */}
          <Grid size={12}>
            <DashboardCard title={t('home.chart.title')} subtitle={t('home.chart.subtitle')}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : chartData.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  {t('home.chart.none')}
                </Typography>
              ) : (
                <Box sx={{ width: '100%', height: 320 }}>
                  <BarChart
                    dataset={chartData.map((d) => ({
                      year: d.label,
                      count: d.value,
                    }))}
                    xAxis={[
                      {
                        dataKey: 'year',
                        scaleType: 'band',
                        label: t('home.chart.xAxis'),
                      },
                    ]}
                    yAxis={[
                      {
                        label: t('home.chart.yAxis'),
                      },
                    ]}
                    series={[
                      {
                        dataKey: 'count',
                        label: t('home.chart.series'),
                        color: '#1976d2',
                      },
                    ]}
                    height={320}
                  />
                </Box>
              )}
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default HomePage;
