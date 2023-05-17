import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { ChatState } from '../Context/ChatProvider';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import {
  Container, Card, CardContent, CircularProgress, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, Paper,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import MessageDialog from '../Dialogs/MessageDialog';
import Profile from '../Components/Profile';
import Topbar from '../Components/Topbar';

export default function SearchPage(props) {
  const { user, setUser, setSelectedChat } = ChatState();

  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [allSearchResults, setAllSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState();
  const [level, setLevel] = useState('No Preference');

  useEffect(() => {
    setSelectedChat();
  }, [])

  useEffect(() => {
    if (searchText) {
      const debounced = setTimeout(async () => {
        setLoading(true)
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            }
          }
          const { data } = await axios.get(
            `api/user?search=${searchText}`,
            config,
          );
          setLoading(false)
          setAllSearchResults(data)
          if (level === 'No Preference') {
            setSearchResults(data);
          } else {
            setSearchResults(data.filter(u => u.level === level))
          }
          
        } catch(e) {
          setLoading(false)
        }
      }, 400)
      return () => clearTimeout(debounced)
    }
  }, [searchText])

  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  const handleOpenMessageDialog = () => {
    setMessageDialogOpen(true);
  };

  const handleCloseMessageDialog = () => {
    setMessageDialogOpen(false);
  }

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };
  
  const handleMessageSent = () => {
    setSnackbarOpen(true);
    setMessageDialogOpen(false);
  }

  useEffect(() => {
    if (level === 'No Preference') {
      setSearchResults(allSearchResults)
    } else {
      setSearchResults(allSearchResults.filter(user => user.level === level))
    }
  }, [level])

  return (
    <>
      <Topbar />
      <Container sx={{ pt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <FormControl fullWidth sx={{ m: 1 }}>
            <InputLabel htmlFor="outlined-adornment-amount">Find a player</InputLabel>
            <OutlinedInput
              id="outlined-adornment-amount"
              startAdornment={<InputAdornment position="start">City:</InputAdornment>}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              label="Find a player"
              placeholder="Enter a city to find players"
            />
          </FormControl>
          {/* <TextField
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            label="Find players"
            variant="standard"
            placeholder="Find someone in a city or by name"
          /> */}
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: {
              xs: 'center',
              sm: 'center',
              md: 'start',
            },
            width: '100%',
            overflow: 'hidden',
            pt: 1,
          }}      
        >
          <Box sx={{
            my: 1,
            overflow: 'auto',
            display: {
              xs: selectedUser ? 'none' : 'flex',
              sm: selectedUser ? 'none' : 'flex',
              md: 'flex',
            },
            width: '400px',
            alignItems: 'center',
            flexDirection: 'column'
          }}>
            {!!searchResults.length && <Box
              sx={{ width: "100%", display: 'flex' }}
            >
              <FormControl sx={{ ml: 3, my: 2, minWidth: 150 }} size="small">
                <InputLabel>Skill Level</InputLabel>
                <Select
                  variant='standard'
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={level}
                  label="Skill Level"
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <MenuItem value={'No Preference'}>No Preference</MenuItem>
                  <MenuItem value={'Beginner'}>Beginner</MenuItem>
                  <MenuItem value={'Intermediate'}>Intermediate</MenuItem>
                  <MenuItem value={'Advanced'}>Advanced</MenuItem>
                </Select>
              </FormControl>
            </Box>}
            <Box sx={{
              height: '60vh',
              overflow: 'auto',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column'
            }}>
              {loading
                ? (
                  <Stack spacing={1}>
                    <Skeleton variant="rectangular" width={340} height={80} />
                    <Skeleton variant="rectangular" width={340} height={80} />
                    <Skeleton variant="rectangular" width={340} height={80} />
                    <Skeleton variant="rectangular" width={340} height={80} />
                    <Skeleton variant="rectangular" width={340} height={80} />
                  </Stack>
                ) : (
                  <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {searchResults.map((user) => {
                      return (
                        <Card sx={{ minWidth: 275, margin: 2, cursor: 'pointer', backgroundColor: user._id === selectedUser?._id ? 'rgba(244, 244, 244, 255)' : 'inherit', alignItems: "flex-start" }} key={user._id} onClick={() => setSelectedUser(user)}>
                          <CardContent>
                            <Avatar
                              alt={user?.name}
                              src={user?.pic}
                            />
                            <Typography variant="h5" component="div" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {user?.name}
                            </Typography>
                            <Typography color="text.secondary">
                              {user?.location || 'No city specified'}
                            </Typography>
                            <Typography color="text.secondary">
                              Skill level: {user.level || 'Not specified'}
                            </Typography>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </List>
                )}
              </Box>
          </Box>
          {/* <Divider sx={{ display: { xs: 'none', sm: 'none', 'md': 'inline-block' } }} orientation="vertical" flexItem /> */}
          <Box
            sx={{
              display: {
                xs: selectedUser ? 'flex' : 'none',
                sm: selectedUser ? 'flex' : 'none',
                md: 'flex',
              },
              width: {
                xs: '100%',
                sm: '100%',
                md: 'calc(100% - 440px)',
              },
              alignItems: 'center',
              flexDirection: 'column',
              m: 1,
              border: '1px',
            }}
          >
            <Box sx={{
              justifyContent: 'flex-start',
              width: '100%',
              display: {
                xs: selectedUser ? 'flex': 'none',
                sm: selectedUser ? 'flex': 'none',
                md: 'none',
              }
            }}>
              <IconButton
                sx={{
                  visibility: {
                    xs: selectedUser ? 'visible': 'hidden',
                    sm: selectedUser ? 'visible': 'hidden',
                    md: 'hidden',
                  }
                }}
                onClick={() => setSelectedUser()}
              >
                <ArrowBackIcon />
              </IconButton>  
            </Box>
            {selectedUser && <Profile user={selectedUser} />}
            {selectedUser && <Box
              sx={{
                display: 'flex',
                justifyContent: 'end'
              }}
            >
              <Button sx={{ m: 1 }} variant="contained" disabled={!selectedUser} onClick={handleOpenMessageDialog}>
                Message
              </Button>
            </Box>}
          </Box>
        </Box>
        <MessageDialog 
          open={messageDialogOpen}
          onClose={handleCloseMessageDialog}
          selectedUser={selectedUser}
          onSent={handleMessageSent}
        />
        <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            Message Sent!
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}
