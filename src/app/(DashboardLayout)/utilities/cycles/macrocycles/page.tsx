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
} from '@mui/material';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import dayjs from 'dayjs';
import { Macrocycle } from '@/types/cycles/types';

const MacroCyclesList = () => {
  const [macroCycles, setMacroCycles] = useState<Macrocycle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Fetch the list of macro cycles from the API
  useEffect(() => {
    async function fetchMacroCycles() {
      try {
        const response = await fetch('/api/cycles/macrocycles'); // Fetching macro cycles from the API
        const data: Macrocycle[] = await response.json();
        setMacroCycles(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch macro cycles.');
      }
    }

    fetchMacroCycles();
  }, []);

  // Handle macro cycle deletion
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(`Are you sure you want to delete MacroCycle ID ${id}?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/cycles/macrocycles/${id}`, { method: 'DELETE' });

      if (response.ok) {
        setSuccess(`MacroCycle ID ${id} deleted successfully.`);
        setMacroCycles((prevCycles) => prevCycles.filter((cycle) => cycle.id !== id));
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        setError('Failed to delete macro cycle.');
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Error deleting macro cycle:', err);
      setError('An error occurred while deleting the macro cycle.');
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  return (
    <div suppressHydrationWarning={true}>
      <PageContainer title="MacroCycles" description="List of all macro cycles">
        <h1>MacroCycles</h1>
        <Link href="/utilities/cycles/macrocycles/manage/new">
          <Button variant="contained" color="primary">
            Add New MacroCycle
          </Button>
        </Link>

        {/* Success/Error Messages */}
        {success ? (
          <Typography variant="body1" sx={{ color: (theme) => theme.palette.success.main }}>
            {success}
          </Typography>
        ) : <></>}
        {error ? (
          <Typography variant="body1" sx={{ color: (theme) => theme.palette.error.main }}>
            {error}
          </Typography>
        ) : <></>}

        {/* MacroCycles Table */}
        <DashboardCard title="MacroCycles">
          <Box sx={{ overflow: 'auto', mt: 2 }}>
            <Box sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}>
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
                  {macroCycles.map((cycle) => (
                    <TableRow
                      key={cycle.id}
                      hover
                      oonClick={() => router.push(`/utilities/cycles/macrocycles/manage/${cycle.id}`)} // Navigate to macro cycle details or edit page on row click
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
                        <Typography sx={{ fontSize: '14px', color: 'textSecondary', whiteSpace: 'pre-line', }}>
                          {cycle.notes || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={2}>
                          {/* Edit MacroCycle Link */}
                          <Link href={`/utilities/cycles/macrocycles/manage/${cycle.id}`} passHref>
                            <Button variant="contained" color="primary" onClick={(e) => e.stopPropagation()}>
                              Edit
                            </Button>
                          </Link>

                          {/* Delete MacroCycle Button */}
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
            </Box>
          </Box>
        </DashboardCard>
      </PageContainer>
    </div>
  );
};

export default MacroCyclesList;
