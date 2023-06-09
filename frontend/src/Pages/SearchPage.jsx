import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import { ChatState } from '../Context/ChatProvider';

import LoadingButton from '../Components/LoadingButton';

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

import Profile from '../Components/Profile';
import Topbar from '../Components/Topbar';
import MessageDock from '../Components/MessageDock';

export default function SearchPage(props) {
  const { user, setUser, setSelectedChat, chats, setChats } = ChatState();

  const [searchText, setSearchText] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [allSearchResults, setAllSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState();
  const [level, setLevel] = useState('No Preference');

  const loaded = useRef(false);
  if (!loaded.current) {
    setSelectedChat();
    loaded.current = true;
  }

  useEffect(() => {
    if (searchText) {
      const debounced = setTimeout(async () => {
        setLoadingUsers(true)
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
          setLoadingUsers(false)
          setAllSearchResults(data)
          if (level === 'No Preference') {
            setSearchResults(data);
          } else {
            setSearchResults(data.filter(u => u.level === level))
          }
          
        } catch(e) {
          setLoadingUsers(false)
        }
      }, 400)
      return () => clearTimeout(debounced)
    }
  }, [searchText])

  const handleMessage = async () => {
    setLoadingChat(true)
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-type": 'application/json',
        }
      }
      let { data } = await axios.post(
        'api/chat',
        { userId: selectedUser._id },
        config,
      );

      setSelectedChat(data)

      const activeChat = chats.find(c => c._id === data._id);
      if (!activeChat) {
        setChats([ data, ...chats])
      } else {
        setChats([ data, ...chats.filter(c => c._id !== data._id)])
      }
      setLoadingChat(false)
    } catch(e) {
      console.log(e.message)
      setLoadingChat(false)
    }
  };

  
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
      <MessageDock />
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
              {loadingUsers
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
              <LoadingButton sx={{ m: 1 }} variant="contained" disabled={loadingChat} loading={loadingChat} onClick={handleMessage}>
                Message
              </LoadingButton>
            </Box>}
          </Box>
        </Box>
      </Container>
    </>
  );
}
