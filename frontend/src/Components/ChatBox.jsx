import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

import { ChatState, ChatContext } from '../Context/ChatProvider';

import Topbar from './Topbar';
import ProfileDialog from '../Dialogs/ProfileDialog';
import ScrollableChat from './ScrollableChat';
import SearchDialog from '../Dialogs/SearchDialog';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Avatar from '@mui/material/Avatar';
import CircularProgress  from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'

import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

import { Container, IconButton, ListItemButton, TextField } from '@mui/material';

let ENDPOINT;
if (process.env.NODE_ENV === 'production') {
  ENDPOINT = 'https://tt-matchmaking.herokuapp.com/'
} else {
  ENDPOINT = 'http://localhost:5000'
}

let socket;
let selectedChatCompare;

export default function ChatBox() {
  const { user, chats, setChats, selectedChat, setSelectedChat, notifications, setNotifications, messages, setMessages, socketConnected } = ChatState();

  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const handleOpenProfileDialog = () => setProfileDialogOpen(true);
  const handleCloseProfileDialog = () => setProfileDialogOpen(false);

  let selectedChatUser = {};
  if (selectedChat) {
    selectedChatUser = selectedChat.users.find(u => u._id !== user?._id);
  }

  const fetchMessages = async () => {
    if (!selectedChat) {
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": 'application/json',
          Authorization: `Bearer ${user.token}`,
        }
      };
      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      setLoading(false);

      socket.emit('join chat', selectedChat._id)
    } catch (error) {
      console.log(error.message)
    }
  }

  const updateSeenChat = async () => {
    if (!selectedChat) {
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": 'application/json',
          Authorization: `Bearer ${user.token}`,
        }
      };

      const { data } = await axios.put(
        'api/chat/seen',
        { chatId: selectedChat._id },
        config
      )
      setNotifications(notifications.filter(notif => notif._id !== selectedChat._id))
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.on('typing', ({ chatId, userId }) => {
      if (!typingUsers.includes(userId)) {
        setTypingUsers([...typingUsers, userId])
      }
    })
    socket.on('stop typing', ({ chatId, userId }) => {
      setTypingUsers(typingUsers.filter(user => user !== userId))
    })

  }, [])

  useEffect(() => {
    fetchMessages();
    if ((selectedChatCompare && !selectedChat) || (selectedChatCompare && selectedChat && selectedChatCompare._id !== selectedChat._id)) {
      socket.emit('leave room', selectedChatCompare._id);
    }
    selectedChatCompare = selectedChat
    updateSeenChat();
  }, [selectedChat])

  // useEffect(() => {
  //   async function onMessageRecieved(newMessage) {
  //     setChats([ newMessage.chat, ...chats.filter(c => c._id !== newMessage.chat._id)])
  //     if (!selectedChat || selectedChat._id !== newMessage.chat._id) {
  //       // notification
  //       if (!notifications.some(notif => notif._id === newMessage.chat._id)) {
  //         setNotifications([newMessage.chat, ...notifications])
  //       } else {
  //         const existingNotif = notifications.find(notif => notif._id === newMessage.chat._id);
  //         setNotifications([existingNotif, ...notifications.filter(notif => notif._id !== newMessage.chat._id)])
  //       }
  //     } else {
  //       setMessages([ ...messages, newMessage ]);
  //       updateSeenChat();
  //     }
  //   }

  //   socket.on('message recieved', onMessageRecieved)

  //   return () => {
  //     socket.off('message recieved', onMessageRecieved)
  //   }

  // })

  const sendMessage = async (event) => {
    if (newMessage && newMessage.trim()){
      socket.emit('stop typing', { chatId: selectedChat._id, userId: user._id });
      setNewMessage('');
      try {
        const config = {
          headers: {
            "Content-type": 'application/json',
            Authorization: `Bearer ${user.token}`,
          }
        };

        const { data } = await axios.post(
          'api/message',
          {
            content: newMessage,
            chatId: selectedChat._id
          },
          config,
        );
        socket.emit('new message', data)
        setMessages([...messages, data]);
        
        axios.put(
          'api/chat/unseen',
          { chatId: selectedChat._id },
          config
        )
      } catch (error) {
        console.log(error.message)
      }
    }
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    if (!socketConnected) return;
    socket.emit('typing', { chatId: selectedChat._id, userId: user._id });
    let lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength) {
        socket.emit('stop typing', { chatId: selectedChat._id, userId: user._id });
      }
    }, timerLength)
  }

  return (
    <Box
      sx={{
        display: {
          xs: selectedChat ? 'flex' : 'none',
          sm: selectedChat ? 'flex' : 'none',
          md: 'flex',
        },
        width: 'calc(100% - 400px)',
        alignItems: 'center',
        flexDirection: 'column',
        m: 1,
        flexGrow: 100,
        border: '1px',
      }}
    >
      {selectedChat 
        ? (<>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', height: 30, p: 2, width: '100%' }}>
            <IconButton
              sx={{
                visibility: {
                  xs: selectedChat ? 'visible': 'hidden',
                  sm: selectedChat ? 'visible': 'hidden',
                  md: 'hidden',
                }
              }}
              onClick={() => setSelectedChat()}
            >
              <ArrowBackIcon />
            </IconButton>  
            <span style={{ flexShrink: 1, minWidth: 0, fontSize: 18, whiteSpace: 'pre-line', overflowWrap: 'break-word', wordWrap: 'break-word' }}>{selectedChatUser.name}</span>
            <IconButton onClick={handleOpenProfileDialog}>
              <VisibilityIcon />
            </IconButton>
            {profileDialogOpen && 
              <ProfileDialog
                open={profileDialogOpen}
                onClose={handleCloseProfileDialog}
                user={selectedChatUser}
                viewOnly  
              />
            }
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(244, 244, 244, 255)',
              borderRadius: '15px 15px 0 0',
              width: '100%',
              height: '80%',
              overflowY: 'hidden',
              mt: 1,
            }}
          >
            {loading ? (
              <CircularProgress sx={{ margin: 'auto' }} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <ScrollableChat messages={messages} showLottie={typingUsers.length && typingUsers.some(x => x !== user._id)}/>
              </Box>
            )}
          </Box>
          <TextField
            id="outlined-size-small"
            placeholder="Enter a message.."
            value={newMessage}
            onChange={handleTyping}
            fullWidth
            multiline
            maxRows={3}
          />
          <Button variant='contained' sx={{ ml: 'auto', mt: 1 }} onClick={sendMessage} disabled={!newMessage || !(newMessage.trim())}>
            Send
          </Button>
        </>)
        : <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
              bgcolor: 'rgba(244, 244, 244, 255)'
            }}>
            <span style={{ fontSize: 24 }}>Select a user to start chatting</span>
          </Box>
      }
    </Box>
  )
}
