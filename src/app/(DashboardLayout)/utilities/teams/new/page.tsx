'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { TextField, Button, Box, Stack, Typography } from '@mui/material';
import Image from 'next/image'; // For displaying the image

// Define the type for the team form data
interface TeamFormData {
  name: string;
  shortName: string;
  location: string;
  image?: string; // Optional base64 image string
}

const NewTeam = () => {
  const [form, setForm] = useState<TeamFormData>({ name: '', shortName: '', location: '' });
  const [image, setImage] = useState<string | null>(null); // For storing the base64 image string
  const [imagePreview, setImagePreview] = useState<string | null>(null); // For previewing the image
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: '' })); // Clear any errors for this field
  };

  // Handle image selection and convert to base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string); // Set the base64 string
        setImagePreview(reader.result as string); // Show image preview
      };
      reader.readAsDataURL(file); // Convert the image file to a base64 string
    }
  };

  // Handle removing the selected image
  const handleRemoveImage = () => {
    setImage(null); // Clear the image data
    setImagePreview(null); // Remove the image preview
  };

  // Validate the form fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.name) {
      errors.name = 'Team name is required';
    }

    if (!form.shortName) {
      errors.shortName = 'Short name is required';
    }

    if (!form.location) {
      errors.location = 'Location is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          image, // Include the base64-encoded image if available
        }),
      });

      if (response.ok) {
        setSuccess('Team created successfully.');
        setError(null);
        setTimeout(() => {
          router.push('/utilities/teams'); // Redirect to the teams list page after 2 seconds
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create team.');
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Error creating team:', err);
      setError('An unknown error occurred.');
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  return (
    <PageContainer title="Create New Team" description="Add a new team">
      <h1>Create New Team</h1>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Image Preview */}
          {imagePreview ? (
            <Box>
              <Image src={imagePreview} alt="Team Image" width={64} height={64} />
              <Button variant="outlined" color="secondary" onClick={handleRemoveImage}>
                Remove Image
              </Button>
            </Box>
          ) : (
            <Typography>No Image Selected</Typography>
          )}

          {/* Image Upload Field */}
          <Box>
            <label htmlFor="team-image">Upload Image</label>
            <input type="file" id="team-image" accept="image/*" onChange={handleImageChange} />
          </Box>

          {/* Name Field */}
          <TextField
            label="Team Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            error={!!formErrors.name}
            helperText={formErrors.name}
          />

          {/* Short Name Field */}
          <TextField
            label="Short Name"
            name="shortName"
            value={form.shortName}
            onChange={handleChange}
            required
            error={!!formErrors.shortName}
            helperText={formErrors.shortName}
          />

          {/* Location Field */}
          <TextField
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            error={!!formErrors.location}
            helperText={formErrors.location}
          />

          <Box display="flex" justifyContent="space-between">
            <Button type="submit" variant="contained" color="primary">
              Create Team
            </Button>

            {/* Cancel Button */}
            <Button type="button" variant="outlined" color="secondary" onClick={() => router.push('/utilities/teams')}>
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

export default NewTeam;
