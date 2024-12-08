'use client';
import React, { useState, useEffect } from 'react';
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
} from '@mui/material';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import dayjs from 'dayjs';
import { MacrocycleInterface, MesocycleInterface } from '@/types/cycles/types';

const MesoCyclesList = () => {
  const [macroCycles, setMacroCycles] = useState<MacrocycleInterface[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Fetch the list of macro cycles with meso cycles from the API
  useEffect(() => {
    async function fetchMacroCycles() {
      try {
        const response = await fetch('/api/cycles/macrocycles'); // Fetching macro cycles with meso cycles
        if (!response.ok) {
          throw new Error(`Failed to fetch cycles. Status: ${response.status}`);
        }
        const data: MacrocycleInterface[] = await response.json();
        setMacroCycles(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch cycles.');
      }
    }

    fetchMacroCycles();
  }, []);

  // Handle mesocycle deletion
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(`Are you sure you want to delete MesoCycle ID ${id}?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/cycles/mesocycles/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setSuccess(`MesoCycle ID ${id} deleted successfully.`);
        setMacroCycles((prev) =>
          prev.map((macro) => ({
            ...macro,
            mesocycles: macro.mesocycles.filter((meso) => meso.id !== id),
          }))
        );
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError('Failed to delete mesocycle.');
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      console.error('Error deleting mesocycle:', err);
      setError('An error occurred while deleting the mesocycle.');
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div suppressHydrationWarning={true}>
      <PageContainer title="MesoCycles" description="List of all meso cycles grouped by macro cycle">
        <h1>MesoCycles</h1>
        <Link href="/utilities/cycles/mesocycles/manage/new">
          <Button variant="contained" color="primary">
            Add New MesoCycle
          </Button>
        </Link>

        {/* Success/Error Messages */}
        {success && (
          <Typography variant="body1" sx={{ color: (theme) => theme.palette.success.main }}>
            {success}
          </Typography>
        )}
        {error && (
          <Typography variant="body1" sx={{ color: (theme) => theme.palette.error.main }}>
            {error}
          </Typography>
        )}

        {/* MacroCycle and MesoCycles Table */}
        <DashboardCard title="MesoCycles">
          <Box sx={{ overflow: 'auto', mt: 2 }}>
            {macroCycles.map((macrocycle) => (
              <Box key={macrocycle.id} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  MacroCycle: {macrocycle.name || `MacroCycle ${macrocycle.number || macrocycle.id}`} (
                  {dayjs(macrocycle.startDate).format('YYYY-MM-DD')} to{' '}
                  {dayjs(macrocycle.endDate).format('YYYY-MM-DD')})
                </Typography>
                <Table sx={{ whiteSpace: 'nowrap' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          MesoCycle Number
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
                    {macrocycle.mesocycles.map((mesocycle) => (
                      <TableRow key={mesocycle.id} hover>
                        <TableCell>
                          <Typography>{mesocycle.number}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>{mesocycle.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>{dayjs(mesocycle.startDate).format('YYYY-MM-DD')}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>{dayjs(mesocycle.endDate).format('YYYY-MM-DD')}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>{mesocycle.notes || 'N/A'}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={2}>
                            <Link href={`/utilities/cycles/mesocycles/manage/${mesocycle.id}`} passHref>
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
                                handleDelete(mesocycle.id);
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
              </Box>
            ))}
          </Box>
        </DashboardCard>
      </PageContainer>
    </div>
  );
};

export default MesoCyclesList;
