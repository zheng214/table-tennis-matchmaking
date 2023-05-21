import React, { useState, useEffect, useRef } from 'react';
import { ChatState } from "../Context/ChatProvider";
import ChatBox from './ChatBox';
import { Link } from "react-router-dom";

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Avatar from '@mui/material/Avatar'
import { TextField, Button } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

const MessageDock = () => {
  const { user, chats, selectedChat, setSelectedChat, notifications } = ChatState();
  const loaded = useRef(false);
  if (!loaded.current) {
    setSelectedChat();
    loaded.current = true;
  }

  const [collapsed, setCollapsed] = useState(true);
  const toggleMessageDock = () => {
    setCollapsed(collapsed => !collapsed)
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        display: 'flex',
        alignItems: 'end',
        zIndex: 999,
      }}
    >
      <ChatBox mini />
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        mr: 2,
        width: 320,
        borderLeft: '1px solid rgb(212, 210, 208)',
        borderRight: '1px solid rgb(212, 210, 208)',
        borderRadius: '10px 10px 0 0',
        backgroundColor: 'white',
      }}>
        <Box
          onClick={() => toggleMessageDock()}
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            backgroundColor: '#2196f3',
            borderRadius: '10px 10px 0 0',
            cursor: 'pointer',
            padding: 2,
          }}
        >
          <ChatIcon />
          <span style={{ marginLeft: '10px' }}>Messages</span>
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'rgba(0, 0, 0, 0.12) 0px 0px 8px',
          height: 550,
          maxHeight: collapsed ? 0 : 550,
          overflow: 'hidden',
          transition: 'max-height 0.3s',
        }}>
          <Box
            sx={{
              width: '100%',
              height: 500,
              overflow: 'auto',
            }}
          >
            <List sx={{ py: 0, width: '100%', bgcolor: 'background.paper' }}>
              {chats.map((chat, i) => {
                const otherUser = chat.users.find(chatUser => chatUser._id !== user?._id);
                const content = chat?.latestMessage?.content || ''
                let latestMessageSender = '';
                if (chat?.latestMessage?.sender?._id === user?._id) {
                  latestMessageSender = 'You: '
                } else if (chat?.latestMessage?.sender?._id === otherUser?._id) {
                  latestMessageSender = `${otherUser?.name}: `
                }
                console.log({ chat })
                return (
                  <>
                    <ListItemButton
                      sx={{ 
                        backgroundColor: chat._id === selectedChat?._id ? 'rgba(244, 244, 244, 255)' : 'inherit',
                      }}
                      key={chat._id}
                      alignItems="flex-start"
                      onClick={() => { setSelectedChat(chat) }}
                    >
                      <ListItemAvatar>
                        <Avatar alt={otherUser?.name} src={otherUser?.pic} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={otherUser?.name} 
                        primaryTypographyProps={{
                          style: {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontWeight: notifications.map(x => x._id).includes(chat._id) ? 'bold' : 'normal',
                          }
                        }} 
                        secondary={
                          <React.Fragment>
                            <Typography
                              sx={{
                                display: 'inline',
                                whiteSpace: 'pre-line',
                                overflowWrap: 'break-word',
                                wordWrap: 'break-word',
                                fontWeight: notifications.map(x => x._id).includes(chat._id) ? 'bold' : 'normal',
                              }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {latestMessageSender} {content?.length > 50 ? `${content?.substring(0, 50)}...` : content}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItemButton>
                    {i !== chats.length - 1 && <Divider />}
                  </>
                );
              })}
            </List>
          </Box>
          <Box
            sx={{
              width: '100%',
              height: 50,
              borderTop: '1px solid rgb(212, 210, 208)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Link to='/chat'>See all in messages</Link>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default MessageDock