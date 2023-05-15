import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useHistory  } from 'react-router-dom';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';

import MailIcon from '@mui/icons-material/Mail';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import NotificationsIcon from '@mui/icons-material/Notifications'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ChatIcon from '@mui/icons-material/Chat';

import SearchDialog from '../Dialogs/SearchDialog';
import ProfileDialog from '../Dialogs/ProfileDialog';
import { ChatState } from '../Context/ChatProvider';

let prevNotifications;

export default function Topbar(props) {
  const { user, setUser, setChats, setSelectedChat, notifications, setNotifications } = ChatState();
  const history = useHistory();

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const handleOpenProfileDialog = () => {
    handleCloseUserMenu();
    setProfileDialogOpen(true)
  };
  const handleCloseProfileDialog = () => setProfileDialogOpen(false);

  const [anchorElAvatar, setanchorElAvatar] = React.useState(null);
  const handleOpenUserMenu = (event) => setanchorElAvatar(event.currentTarget);
  const handleCloseUserMenu = () => setanchorElAvatar(null);

  const [anchorElMessages, setanchorElMessages] = React.useState(null);
  const handleOpenMessagesMenu = (event) => setanchorElMessages(event.currentTarget);
  const handleCloseMessagesMenu = () => setanchorElMessages(null);

  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const handleOpenSearchDialog = () => setSearchDialogOpen(true);
  const handleCloseSearchDialog = () => setSearchDialogOpen(false);

  const handleLogout = () => {
    setUser();
    setSelectedChat();
    localStorage.removeItem('userInfo');
    history.push('/login');
  }

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };
  
  const handleSaveChange = () => {
    setSnackbarOpen(true);
  }

  const handleClickNotification = (notif) => {
    setSelectedChat(notif);
    handleCloseMessagesMenu();
    setNotifications(notifications.filter(n => n._id !== notif._id))
    history.push('/chat');
  }

  return (
    <>
      {
        profileDialogOpen
          ? <ProfileDialog
              open={profileDialogOpen}
              onClose={handleCloseProfileDialog}
              onSaveChange={handleSaveChange}
              user={user}
            />
          : null
      }
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <h3 style={{fontFamily: "'Orbitron', sans-serif", cursor: 'pointer' }} onClick={() => history.push('/')}>Table Tennis Matchmaking</h3>
            <Box sx={{ flexGrow: 1 }} />
            {/* <Box>
              <Button
                sx={{ color: 'white', border: 'solid', display: { xs: 'none', sm: 'none', md: 'inline-block' } }}
                onClick={handleOpenSearchDialog}
                variant="text"
                endIcon={<PersonSearchIcon />}
              >
                Find a player
              </Button>
              {
                searchDialogOpen
                  ? <SearchDialog
                      open={searchDialogOpen}
                      onClose={handleCloseSearchDialog}
                    />
                  : null
              }
            </Box> */}
            <Box sx={{ flexGrow: 1 }} />
            <Box>
              <Tooltip title="Find a player">
                <IconButton onClick={() => history.push('/')} size="large" aria-label="find a player" color="inherit">
                  <PersonSearchIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box>
              <Tooltip title="Messages">
                <IconButton onClick={() => history.push('/chat')} size="large" aria-label="show 4 new mails" color="inherit">
                  <ChatIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box>
              <IconButton onClick={handleOpenMessagesMenu} size="large" aria-label="show 4 new mails" color="inherit">
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElMessages}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={!!anchorElMessages}
                onClose={handleCloseMessagesMenu}
              >
                {!notifications.length
                ? <MenuItem disabled>
                    No new messages
                  </MenuItem>
                : notifications.map(notif => (
                  <MenuItem key={notif._id} onClick={() => handleClickNotification(notif)}>
                    {`New message from ${notif.users.find(u => u._id !== user._id).name}`}
                  </MenuItem>
                ))
                }
              </Menu>
            </Box>
            <Box sx={{ ml: '10px' }}>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src={user?.pic} />
              </IconButton>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElAvatar}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={!!anchorElAvatar}
                onClose={handleCloseUserMenu}
              >
                <MenuItem key="Profile" onClick={handleOpenProfileDialog}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem key="Logout" onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            Changes Saved!
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}

