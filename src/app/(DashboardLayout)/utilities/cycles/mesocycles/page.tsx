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
import { Macrocycle, Mesocycle } from '@/types/cycles/types';

const MesoCyclesList = () => {
  const [macroCycles, setMacroCycles] = useState<Macrocycle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Fetch the list of macro cycles with meso cycles from the API
  useEffect(() => {
    async function fetchMacroCycles() {
      try {
        const response = await fetch('/api/cycles/mesocycles'); // Fetching macro cycles with meso cycles
        const data: Macrocycle[] = await response.json();
        console.log(data)
        setMacroCycles(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch cycles.');
      }
    }

    fetchMacroCycles();
  }, []);

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

        {/* MacroCycle and MesoCycles Table */}
        <DashboardCard title="MesoCycles">
          <Box sx={{ overflow: 'auto', mt: 2 }}>
            <Box sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}>
              <Table sx={{ whiteSpace: 'nowrap' }}>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        MacroCycle
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        MesoCycle Number
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
                  {macroCycles.map((macroCycle) => (
                    <React.Fragment key={macroCycle.id}>
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Typography variant="h6" fontWeight="bold">
                            {`MacroCycle #${macroCycle.number}`}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      {macroCycle.mesoCycles
                        .sort((a, b) => a.number - b.number)
                        .map((mesoCycle) => (
                          <TableRow
                            key={mesoCycle.id}
                            hover
                            onClick={() => router.push(`/utilities/cycles/mesocycles/manage/${mesoCycle.id}`)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>
                              <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                                {mesoCycle.number}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                                {dayjs(mesoCycle.startDate).format('YYYY-MM-DD')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                                {dayjs(mesoCycle.endDate).format('YYYY-MM-DD')}
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
                                {mesoCycle.notes || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={2}>
                                {/* Edit MesoCycle Link */}
                                <Link href={`/utilities/mesocycles/manage/${mesoCycle.id}`} passHref>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Edit
                                  </Button>
                                </Link>

                                {/* Delete MesoCycle Button */}
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(mesoCycle.id);
                                  }}
                                >
                                  Delete
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                    </React.Fragment>
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

export default MesoCyclesList;
