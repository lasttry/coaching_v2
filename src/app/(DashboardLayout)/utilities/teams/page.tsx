'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Stack, Typography, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import Image from 'next/image'; // Import Next.js Image component

// Define the Team type based on the schema
interface Team {
  id: number;
  name: string;
  shortName: string;
  location: string;
  image?: string; // Image field is optional
}

const TeamsList = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Fetch teams when the component mounts
  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await fetch('/api/teams'); // Fetch from your API
        const data: Team[] = await response.json(); // Ensure the data is typed as Team[]
        setTeams(data);
      } catch (err) {
        setError('Failed to fetch teams.');
      }
    }
    fetchTeams();
  }, []);

  // Handle team deletion
  const handleDelete = async (id: number, name: string) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(`Tem a certeza que quer apagar a equipa com o ID ${id} e nome ${name}?`);

    if (!confirmDelete) {
      return; // If user cancels, do nothing
    }

    try {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess(`A equipa com o ID ${id} e nome ${name} foi apagada com sucesso.`);
        setError(null);
        // Update the list by filtering out the deleted team
        setTeams((prev) => prev.filter((team) => team.id !== id));

        // Hide success message after 5 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao apagar a equipa.');
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Error deleting team:', err);
      setError('Ocorreu um erro desconhecido.');
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  return (
    <PageContainer title="Teams" description="List of all teams">
      <h1>Teams</h1>
      <Link href="/utilities/teams/new">
        <Button variant="contained" color="primary">
          Add New Team
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

      {/* Teams Table */}
      <DashboardCard title="Equipas">
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <Box sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}>
            <Table sx={{ whiteSpace: 'nowrap' }}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Image
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      ID
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Name
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Short Name
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Location
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
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      {team.image ? (
                        <Image
                          src={team.image}
                          alt={team.name}
                          width={32}
                          height={32}
                          style={{ borderRadius: '50%' }} // Optional: Make the image circular
                        />
                      ) : (
                        <div style={{ width: 32, height: 32, backgroundColor: '#ccc' }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: '15px',
                          fontWeight: '500',
                        }}
                      >
                        {team.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: '15px',
                          fontWeight: '500',
                        }}
                      >
                        {team.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: '14px',
                          color: 'textSecondary',
                        }}
                      >
                        {team.shortName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontSize: '14px',
                          color: 'textSecondary',
                        }}
                      >
                        {team.location}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={2}>
                        {/* Edit Team Link */}
                        <Link href={`/utilities/teams/${team.id}/edit`} passHref>
                          <Button variant="contained" color="primary">
                            Edit
                          </Button>
                        </Link>

                        {/* Delete Team Button */}
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleDelete(team.id, team.name)}
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
  );
};

export default TeamsList;
