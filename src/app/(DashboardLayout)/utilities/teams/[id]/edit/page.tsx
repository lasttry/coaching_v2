'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { TextField, Button, Box, Stack, Typography } from '@mui/material';
import Image from 'next/image'; // For displaying the image

// Define the Team type based on the schema
interface Team {
  id: number;
  name: string;
  shortName: string;
  location: string;
  image?: string; // Image is optional
}

const EditTeam = ({ params }: { params: { id: string } }) => {
  const [form, setForm] = useState<Team | null>(null); // Initialize form as null until data is fetched
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [image, setImage] = useState<string | null>(null); // To store the base64 image string
  const router = useRouter();

  // Fetch the team data when the component mounts
  useEffect(() => {
    async function fetchTeam() {
      try {
        const response = await fetch(`/api/teams/${params.id}`);
        const data: Team = await response.json();
        setForm(data);
        setImage(data.image || null); // Set the image to the existing base64 string, if any
      } catch (err) {
        console.error(err)
        setError('Failed to fetch team data.');
      } finally {
        setLoading(false);
      }
    }

    fetchTeam();
  }, [params.id]);

  // Handle input change and reset field error on change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (form) {
      setForm((prev) => ({ ...prev!, [name]: value }));
      setFormErrors((prevErrors) => ({ ...prevErrors, [name]: '' })); // Reset error for this field
    }
  };

  // Handle image file selection and convert it to base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string); // Set the base64 string
      };
      reader.readAsDataURL(file); // Convert the image file to a base64 string
    }
  };

  // Handle removing the current image
  const handleRemoveImage = () => {
    setImage(null); // Remove image preview
    if (form) {
      setForm((prev) => ({ ...prev!, image: '' })); // Mark the image as removed in the form data
    }
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate name
    if (!form?.name) {
      errors.name = 'Team name is required';
    }

    // Validate short name
    if (!form?.shortName) {
      errors.shortName = 'Short name is required';
    }

    // Validate location
    if (!form?.location) {
      errors.location = 'Location is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the form before submission
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch(`/api/teams/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          image, // Send the base64 image string along with the other data
        }),
      });

      if (response.ok) {
        setSuccess('Team updated successfully.');
        setError(null);
        setTimeout(() => {
          router.push('/utilities/teams'); // Redirect to the teams list page after 2 seconds
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update team.');
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Error updating team:', err);
      setError('An unknown error occurred.');
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  // Handle cancel action to return to the teams list
  const handleCancel = () => {
    router.push('/utilities/teams'); // Redirect to teams list
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <PageContainer title="Edit Team" description="Edit team details">
      <h1>Edit Team</h1>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Image Preview */}
          {image ? (
            <Box>
              <Image src={image} alt={form?.name || 'Team Image'} width={64} height={64} />
              <Button variant="outlined" color="secondary" onClick={handleRemoveImage}>
                Remove Image
              </Button>
            </Box>
          ) : (
            <Typography>No Image Available</Typography>
          )}

          {/* Image Upload Field */}
          <Box>
            <label htmlFor="team-image">Upload New Image</label>
            <input type="file" id="team-image" accept="image/*" onChange={handleImageChange} />
          </Box>

          {/* Name Field */}
          <TextField
            label="Team Name"
            name="name"
            value={form?.name || ''}
            onChange={handleChange}
            required
            error={!!formErrors.name}
            helperText={formErrors.name}
          />

          {/* Short Name Field */}
          <TextField
            label="Short Name"
            name="shortName"
            value={form?.shortName || ''}
            onChange={handleChange}
            required
            error={!!formErrors.shortName}
            helperText={formErrors.shortName}
          />

          {/* Location Field */}
          <TextField
            label="Location"
            name="location"
            value={form?.location || ''}
            onChange={handleChange}
            required
            error={!!formErrors.location}
            helperText={formErrors.location}
          />

          <Box display="flex" justifyContent="space-between">
            <Button type="submit" variant="contained" color="primary">
              Save Changes
            </Button>

            {/* Cancel Button */}
            <Button type="button" variant="outlined" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </Box>

          {/* Success/Error Messages */}
          {success && <Typography sx={{ color: 'green' }}>{success}</Typography>}
          {error && <Typography sx={{ color: 'red' }}>{error}</Typography>}
        </Stack>
      </form>
    </PageContainer>
  );
};

export default EditTeam;
