'use client';

import MicrocycleDetailsDialog from '@/app/(DashboardLayout)/components/shared/MicrocycleDetailsDialog';
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
import { Microcycle, Mesocycle, Macrocycle } from '@/types/cycles/types';

const MicrocyclesList = () => {
  const [data, setData] = useState<
    { macrocycle: Macrocycle; mesocycles: { mesocycle: Mesocycle; microcycles: Microcycle[] }[] }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState(null);

  const openDetailsOverlay = async (microcycleId: number) => {
    try {
      const response = await fetch(`/api/cycles/microcycles/${microcycleId}/details`);
      const data = await response.json();
      setDetailsData(data);
      setDetailsOpen(true);
    } catch (err) {
      console.error('Error fetching details:', err);
    }
  };
  
  const closeDetailsOverlay = () => {
    setDetailsOpen(false);
    setDetailsData(null);
  };

  // Fetch the list of microcycles grouped by Macrocycle and Mesocycle
  useEffect(() => {
    async function fetchMicrocycles() {
      try {
        const response = await fetch('/api/cycles/microcycles'); // Fetching microcycles from the API
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const microcycles: Microcycle[] = await response.json();
        console.log('Fetched microcycles:', microcycles);

        // Group Microcycles by Macrocycle → Mesocycle with null safety checks
        const groupedData = microcycles.reduce<Record<number, {
          macrocycle: Macrocycle;
          mesocycles: Record<number, {
            mesocycle: Mesocycle;
            microcycles: Microcycle[];
          }>;
        }>>((acc, microcycle) => {
          const macrocycle = microcycle.mesocycle?.macrocycle;
          const mesocycle = microcycle.mesocycle;

          // Ensure both macrocycle and mesocycle exist
          if (!macrocycle || !mesocycle) {
            console.warn('Skipping microcycle due to missing macrocycle or mesocycle:', microcycle);
            return acc;
          }

          // Initialize macrocycle group if not already present
          if (!acc[macrocycle.id]) {
            acc[macrocycle.id] = {
              macrocycle,
              mesocycles: {},
            };
          }

          // Initialize mesocycle group if not already present
          if (!acc[macrocycle.id].mesocycles[mesocycle.id]) {
            acc[macrocycle.id].mesocycles[mesocycle.id] = {
              mesocycle,
              microcycles: [],
            };
          }

          // Add microcycle to the corresponding mesocycle
          acc[macrocycle.id].mesocycles[mesocycle.id].microcycles.push(microcycle);

          return acc;
        }, {});

        // Convert grouped data to an array and sort each group by date ascending
        const groupedArray = Object.values(groupedData).map((macroGroup) => ({
          ...macroGroup,
          mesocycles: Object.values(macroGroup.mesocycles).map((mesoGroup) => ({
            ...mesoGroup,
            microcycles: mesoGroup.microcycles.sort(
              (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            ),
          })),
        }));

        setData(groupedArray); // Update state with grouped and sorted data
      } catch (err) {
        console.error('Error fetching microcycles:', err);
        setError('Failed to fetch microcycles.');
      }
    }

    fetchMicrocycles();
  }, []);

  

  // Handle microcycle deletion
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(`Are you sure you want to delete Microcycle ID ${id}?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/cycles/microcycles/${id}`, { method: 'DELETE' });

      if (response.ok) {
        setSuccess(`Microcycle ID ${id} deleted successfully.`);
        setData((prev) =>
          prev.map((macro) => ({
            ...macro,
            mesocycles: macro.mesocycles.map((meso) => ({
              ...meso,
              microcycles: meso.microcycles.filter((cycle) => cycle.id !== id),
            })),
          }))
        );
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        setError('Failed to delete microcycle.');
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Error deleting microcycle:', err);
      setError('An error occurred while deleting the microcycle.');
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  return (
    <div suppressHydrationWarning={true}>
      <MicrocycleDetailsDialog
        open={detailsOpen}
        onClose={closeDetailsOverlay}
        data={detailsData}
      />
      <PageContainer title="Microcycles" description="List of all microcycles grouped by Macrocycle and Mesocycle">
        <h1>Microcycles</h1>
        <Link href="/utilities/cycles/microcycles/manage/new">
          <Button variant="contained" color="primary">
            Add New Microcycle
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

        {/* Microcycles List */}
        {data.map((macro) => (
          <Accordion key={macro.macrocycle.id} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Macrocycle: {macro.macrocycle.name || `Macrocycle ${macro.macrocycle.number || 'N/A'}`} (
                {dayjs(macro.macrocycle.startDate).format('YYYY-MM-DD')} to{' '}
                {dayjs(macro.macrocycle.endDate).format('YYYY-MM-DD')})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {macro.mesocycles.map((meso) => (
                <Accordion key={meso.mesocycle.id} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">
                      Mesocycle: {meso.mesocycle.name || `Mesocycle ${meso.mesocycle.number || 'N/A'}`} (
                      {dayjs(meso.mesocycle.startDate).format('YYYY-MM-DD')} to{' '}
                      {dayjs(meso.mesocycle.endDate).format('YYYY-MM-DD')})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <DashboardCard title="Microcycles">
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
                          {meso.microcycles.map((cycle) => (
                            <TableRow
                              key={cycle.id}
                              hover
                              onClick={() =>
                                router.push(`/utilities/cycles/microcycles/manage/${cycle.id}`)
                              }
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
                                <Typography
                                  sx={{
                                    fontSize: '14px',
                                    color: 'textSecondary',
                                    whiteSpace: 'pre-line',
                                  }}
                                >
                                  {cycle.notes || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Stack direction="row" spacing={2}>
                                  <Link href={`/utilities/cycles/microcycles/manage/${cycle.id}`} passHref>
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
                                  <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDetailsOverlay(cycle.id);
                                  }}
                                >
                                  View Details
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
            </AccordionDetails>
          </Accordion>
        ))}
      </PageContainer>
    </div>
  );
};

export default MicrocyclesList;
