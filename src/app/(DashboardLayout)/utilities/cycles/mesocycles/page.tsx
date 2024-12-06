'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import dayjs from 'dayjs';
import { Mesocycle, Macrocycle } from '@/types/cycles/types';

const MesocyclesList = () => {
  const [mesocycles, setMesocycles] = useState<{ macrocycle: Macrocycle; mesocycles: Mesocycle[] }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Fetch the list of mesocycles grouped by macrocycle
  useEffect(() => {
    async function fetchMesocycles() {
      try {
        const response = await fetch('/api/cycles/mesocycles'); // Fetching mesocycles from the API
        const data: Mesocycle[] = await response.json();

        // Group mesocycles by macrocycle and sort by date descending
        const grouped = data.reduce((acc: { [key: number]: Macrocycle & { mesocycles: Mesocycle[] } }, cycle) => {
          const macrocycle = cycle.macrocycle;

          if (!acc[macrocycle.id]) {
            acc[macrocycle.id] = { ...macrocycle, mesocycles: [] };
          }
          acc[macrocycle.id].mesocycles.push(cycle);

          return acc;
        }, {});

        // Convert grouped object to an array and sort mesocycles within each group
        const groupedArray = Object.values(grouped).map((group) => ({
          ...group,
          mesocycles: group.mesocycles.sort(
            (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          ),
        }));

        setMesocycles(groupedArray);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch mesocycles.');
      }
    }

    fetchMesocycles();
  }, []);

  // Handle mesocycle deletion
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(`Are you sure you want to delete Mesocycle ID ${id}?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/cycles/mesocycles/${id}`, { method: 'DELETE' });

      if (response.ok) {
        setSuccess(`Mesocycle ID ${id} deleted successfully.`);
        setMesocycles((prev) =>
          prev.map((group) => ({
            ...group,
            mesocycles: group.mesocycles.filter((cycle) => cycle.id !== id),
          }))
        );
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        setError('Failed to delete mesocycle.');
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Error deleting mesocycle:', err);
      setError('An error occurred while deleting the mesocycle.');
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  return (
    <div suppressHydrationWarning={true}>
      <PageContainer title="Mesocycles" description="List of all mesocycles grouped by Macrocycle">
        <h1>Mesocycles</h1>
        <Link href="/utilities/cycles/mesocycles/manage/new">
          <Button variant="contained" color="primary">
            Add New Mesocycle
          </Button>
        </Link>

        {/* Success/Error Messages */}
        {success ? (
          <Typography variant="body1" sx={{ color: (theme) => theme.palette.success.main }}>
            {success}
          </Typography>
        ) : null}
        {error ? (
          <Typography variant="body1" sx={{ color: (theme) => theme.palette.error.main }}>
            {error}
          </Typography>
        ) : null}

        {/* Mesocycles List */}
        {mesocycles.map((group) => (
          <Accordion key={group.id} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Macrocycle: {group.name || `Macrocycle ${group.number || 'N/A'}`} (
                {dayjs(group.startDate).format('YYYY-MM-DD')} to{' '}
                {dayjs(group.endDate).format('YYYY-MM-DD')})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <DashboardCard title="Mesocycles">
                <Table
                  sx={{
                    whiteSpace: 'nowrap',
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Number
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Name
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Start Date
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          End Date
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Notes
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" fontWeight={600}>
                          Actions
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.mesocycles.map((cycle) => (
                      <TableRow
                        key={cycle.id}
                        hover
                        onClick={() => router.push(`/utilities/cycles/mesocycles/manage/${cycle.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                            {cycle.number}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                            {cycle.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                            {dayjs(cycle.startDate).format('YYYY-MM-DD')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                            {dayjs(cycle.endDate).format('YYYY-MM-DD')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '14px', color: 'textSecondary', whiteSpace: 'pre-line' }}>
                            {cycle.notes || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={2}>
                            <Link href={`/utilities/cycles/mesocycles/manage/${cycle.id}`} passHref>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(cycle.id ?? -1);
                              }}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DashboardCard>
            </AccordionDetails>
          </Accordion>
        ))}
      </PageContainer>
    </div>
  );
};

export default MesocyclesList;
