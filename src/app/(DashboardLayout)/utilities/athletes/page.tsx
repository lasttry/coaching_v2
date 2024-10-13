'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Stack, Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';

// Define the Athlete type based on the schema
interface Athlete {
  id: number;
  number: string;
  name: string;
  birthdate: string;
  fpbNumber?: number | null;
}

const AthletesList = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]); // Use Athlete[] as the type for athletes array
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch athletes when the component mounts
  useEffect(() => {
    async function fetchAthletes() {
      try {
        const response = await fetch('/api/athletes'); // Fetch from your API
        const data: Athlete[] = await response.json(); // Ensure the data is typed as Athlete[]
        setAthletes(data);
      } catch (err) {
        setError('Failed to fetch athletes.');
      }
    }
    fetchAthletes();
  }, []);

  // Function to delete an athlete
  const handleDelete = async (id: number, name: string) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(`Tem a certeza que quer apagar o atleta com o ID ${id} e nome ${name}?`);
    
    if (!confirmDelete) {
      return; // If user cancels, do nothing
    }

    try {
      const response = await fetch(`/api/athletes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess(`O atleta com o ID ${id} e nome ${name} foi apagado com sucesso.`);
        setError(null);
        // Update the list by filtering out the deleted athlete
        setAthletes((prev) => prev.filter((athlete) => athlete.id !== id));

        // Hide success message after 5 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao apagar o atleta.');
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Error deleting athlete:', err);
      setError('Ocorreu um erro desconhecido.');
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  return (
    <PageContainer title="Athletes" description="List of athletes">
      <h1>Athletes</h1>
      <Link href="/utilities/athletes/new">
        <Button variant="contained" color="primary">
          Add New Athlete
        </Button>
      </Link>

      {success && success.trim() !== '' ? (
        <Typography sx={{ color: 'green' }}>
          {success}
        </Typography>
      ) : <></> }

      {error && error.trim() !== '' ? (
        <Typography sx={{ color: 'red' }}>
          {error}
        </Typography>
      ) : <></> }

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Birthdate</TableCell>
              <TableCell>FPB Number</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {athletes.map((athlete) => (
              <TableRow key={athlete.id}>
                <TableCell>{athlete.number}</TableCell>
                <TableCell>{athlete.name}</TableCell>
                <TableCell>{new Date(athlete.birthdate).toLocaleDateString()}</TableCell>
                <TableCell>{athlete.fpbNumber || 'N/A'}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={2}>
                    {/* Link to Edit Athlete */}
                    <Link href={`/utilities/athletes/${athlete.id}/edit`} passHref>
                      <Button variant="contained" color="primary">
                        Edit
                      </Button>
                    </Link>

                    {/* Delete Athlete with Confirmation */}
                    <Button variant="contained" color="secondary" onClick={() => handleDelete(athlete.id, athlete.name)}>
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </PageContainer>
  );
};

export default AthletesList;
