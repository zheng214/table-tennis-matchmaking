import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

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
import CircularProgress from '@mui/material/CircularProgress';

const ENDPOINT = 'https://tt-matchmaking.herokuapp.com/'
let socket;

export default function MessageDialog(props) {
  const { user, chats, setChats, setSelectedChat, messages, setMessages } = ChatState();
  const { selectedUser } = props;

  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socket = io(ENDPOINT);
  }, [])

  const handleSendMessage = async () => {
    setLoading(true)
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
      const activeChat = chats.find(c => c._id === data._id);
      if (!activeChat) {
        setChats([ data, ...chats])
      } else {
        setChats([ data, ...chats.filter(c => c._id !== data._id)])
      }

      const messageResponse = await axios.post(
        'api/message',
        {
          content: messageText,
          chatId: data._id
        },
        config,
      );

      setMessages([...messages, messageResponse.data]);
      socket.emit('new message', messageResponse.data)
        
      axios.put(
        'api/chat/unseen',
        { chatId: data._id },
        config
      )

      setLoading(false)
      props.onSent();
    } catch(e) {
      console.log(e.message)
      setLoading(false)
    }
  }

  return (
    <Dialog
      maxWidth="xl"
      open={props.open}
      onClose={props.onClose}
    >
      <DialogTitle>Message {selectedUser?.name}</DialogTitle>
      <DialogContent sx={{ px : {
        xs: 0,
        sm: 3
      }}}>
        <Box sx={{ display: 'flex', justifyContent: 'center', minWidth: '300px', m: 1 }}>
          <TextField
            label="Message"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            multiline
            rows={6}
            style={{ width: '60vw', maxWidth: 500 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Close</Button>
        <LoadingButton variant="contained" onClick={handleSendMessage} disabled={loading || !messageText.trim()} loading={loading}>
          Send
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

