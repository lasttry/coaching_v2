'use client';
import React from 'react';
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

              </Table>
            </Box>
          </Box>
        </DashboardCard>
      </PageContainer>
    </div>
  );
};

export default MesoCyclesList;
