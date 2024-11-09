'use client';

import { use } from "react";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import dayjs from 'dayjs';
import { Macrocycle } from '@/types/cycles/types';

type Params = Promise<{ id: string }>;

const MacroCycleForm = (props: { params: Params }) => {
  const params = use(props.params);
  const id = params.id === 'new' ? null : params.id;
  const router = useRouter();
  const [macroCycle, setMacroCycle] = useState<Macrocycle>({
    name: '',
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().add(3, 'month').format('YYYY-MM-DD'),
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function formatDateFromPrisma(date: Date | string): string | null {
    if (!date) return null;
    
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) return null; // Check for invalid date
  
    return parsedDate.toISOString().split('T')[0]; // Format as "yyyy-MM-dd"
  }

  // Fetch the MacroCycle data for editing if id is present
  useEffect(() => {
    console.log(id)
    if (id) {
      setLoading(true);
      fetch(`/api/cycles/macrocycles/${id}`)
        .then((response) => response.json())
        .then((data: Macrocycle) => {
          console.log(data)
          if(data.notes === null)
            data.notes = "";
          if(data.number === null)
            data.number = -1
          setMacroCycle(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError('Failed to fetch MacroCycle data.');
          setLoading(false);
        });
    }
  }, [id]);

  // Handle form submission for adding/editing MacroCycle
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      console.log(JSON.stringify(macroCycle))
      const response = await fetch(`/api/cycles/macrocycles${id ? `/${id}` : ''}`, {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(macroCycle),
      });

      if (response.ok) {
        setSuccess(`MacroCycle ${id ? 'updated' : 'added'} successfully.`);
        setTimeout(() => {
          router.push('/utilities/cycles/macrocycles');
        }, 2000);
      } else {
        setError('Failed to save MacroCycle.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving the MacroCycle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title={`${id ? 'Edit' : 'Add'} MacroCycle`} description="MacroCycle Form">
      <h1>{id ? 'Edit' : 'Add'} MacroCycle</h1>

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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DashboardCard>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              mt: 3,
            }}
          >
            <TextField
              label="Number"
              type="number"
              value={macroCycle.number}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || (Number(value) > 0 && Number.isInteger(Number(value)))) {
                  setMacroCycle({ ...macroCycle, number: Number(e.target.value) })
                }
              }}
              InputLabelProps={{ shrink: true }}
            />
            {/* Name Field */}
            <TextField
              label="Name"
              value={macroCycle.name }
              onChange={(e) => setMacroCycle({ ...macroCycle, name: e.target.value })}
            />
            {/* Start Date Field */}
            <TextField
              label="Start Date"
              type="date"
              value={formatDateFromPrisma(macroCycle.startDate)}
              onChange={(e) => setMacroCycle({ ...macroCycle, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />

            {/* End Date Field */}
            <TextField
              label="End Date"
              type="date"
              value={formatDateFromPrisma(macroCycle.endDate)}
              onChange={(e) => setMacroCycle({ ...macroCycle, endDate: e.target.value || '' })}
              InputLabelProps={{ shrink: true }}
              required
            />

            {/* Notes Field */}
            <TextField
              label="Notes"
              value={macroCycle.notes }
              onChange={(e) => setMacroCycle({ ...macroCycle, notes: e.target.value })}
              multiline
              rows={4}
            />

            {/* Submit Button */}
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {id ? 'Update' : 'Add'} MacroCycle
            </Button>
          </Box>
        </DashboardCard>
      )}
    </PageContainer>
  );
};

export default MacroCycleForm;
