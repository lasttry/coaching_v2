import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Avatar, Box, Menu, Button, IconButton, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import Link from 'next/link';
import { IconListCheck, IconMail, IconUser } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { AccountInterface } from '@/types/accounts/types';

const Profile = () => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [anchorEl2, setAnchorEl2] = useState(null);

  const { data: session } = useSession();

  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  useEffect(() => {
    console.log(session);
    const fetchAccount = async () => {
      try {
        if (!session?.user.selectedClubId) return;
        const response = await fetch(`/api/accounts/${session?.user.id}`);

        if (response.ok) {
          const data: AccountInterface = await response.json();
          console.log(data);
          if (data.image) setPhotoPreview(`${data.image}`);
        } else {
          const data = await response.json();
          console.log(data.error);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchAccount();
  }, [session]);

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          src={photoPreview || undefined}
          alt="image"
          sx={{
            width: 35,
            height: 35,
          }}
        />
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '200px',
          },
        }}
      >
        <MenuItem>
          <ListItemText>{session ? `${session.user.name} (${session.user.role})` : 'Loading...'}</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemText>{`Selected Club Id: ${session?.user?.selectedClubId}`}</ListItemText>
        </MenuItem>
        <Link href="/utilities/profile" passHref legacyBehavior>
          <MenuItem>
            <ListItemIcon>
              <IconUser width={20} />
            </ListItemIcon>
            <ListItemText>My Profile</ListItemText>
          </MenuItem>
        </Link>
        <MenuItem>
          <ListItemIcon>
            <IconMail width={20} />
          </ListItemIcon>
          <ListItemText>My Account</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <IconListCheck width={20} />
          </ListItemIcon>
          <ListItemText>My Tasks</ListItemText>
        </MenuItem>
        <Box mt={1} py={1} px={2}>
          <Button
            onClick={() => signOut()} // Redirect to login after logout
            variant="outlined"
            color="primary"
            fullWidth
          >
            Logout
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
