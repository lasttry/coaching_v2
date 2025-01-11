import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, Alert, Box, Stack, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { AccountInterface } from '@/types/accounts/types';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  account: AccountInterface | null;
  onUpdateAccount: (accountId: number, name: string, email: string, defaultClubId?: number | null, image?: string | null, password?: string, oldPassword?: string) => void;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({ open, onClose, account, onUpdateAccount }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(account?.name || '');
  const [email, setEmail] = useState(account?.email || '');
  const [image, setImage] = useState<string | null>(account?.image || null);
  const [defaultClubId, setDefaultClubId] = useState<number | null>(account?.defaultClubId || null);
  const [clubs, setClubs] = useState<{ id: number; name: string }[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      setName(account.name);
      setEmail(account.email);
      setImage(account.image || null);
      setDefaultClubId(account.defaultClubId || null);
    }
  }, [account]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch('/api/clubs');
        if (response.ok) {
          const data = await response.json();
          setClubs([{ id: 0, name: 'None' }, ...data]);
        } else {
          setErrorMessage('Failed to fetch clubs');
        }
      } catch (error) {
        setErrorMessage(`Error fetching clubs: ${error}`);
      }
    };

    fetchClubs();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateAccount = () => {
    if(newPassword || confirmPassword) {
      if (!newPassword || !confirmPassword) {
        setErrorMessage('Please fill in all password fields.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('New password and confirmation password do not match.');
        return;
      }
      if (!oldPassword) {
        setErrorMessage('Please provide the old password.');
        return;
      }
    }
    if (account && account.id) {
      onUpdateAccount(account.id, name, email, defaultClubId, image || null, newPassword, oldPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <Typography variant="subtitle1">Name: {account?.name}</Typography>
        <Typography variant="subtitle1">Email: {account?.email}</Typography>
        <TextField
          margin="dense"
          label="Old Password"
          type="password"
          fullWidth
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <TextField
          margin="dense"
          label="New Password"
          type="password"
          fullWidth
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Confirm Password"
          type="password"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={600}>
            Update Account
          </Typography>
          <TextField
            label="Display Name"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="default-club-label">Default Club</InputLabel>
            <Select
              labelId="default-club-label"
              value={defaultClubId || ''}
              onChange={(e) => setDefaultClubId(Number(e.target.value))}
              label="Default Club"
            >
              {clubs.map((club) => (
                <MenuItem key={club.id} value={club.id}>
                  {club.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {image && (
            <Box sx={{ textAlign: 'center', marginY: 2 }}>
              <img src={image} alt="Current" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
            </Box>
          )}
          <Button
            variant="outlined"
            component="label"
            sx={{ textAlign: 'center' }}
          >
            Upload Photo
            <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="secondary">
          Cancel
        </Button>
        <Button onClick={handleUpdateAccount} variant="contained" color="success">
          Update Account
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog;
