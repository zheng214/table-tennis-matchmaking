import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

import { ChatState, ChatContext } from '../Context/ChatProvider';

import Topbar from '../Components/Topbar';
import ProfileDialog from '../Dialogs/ProfileDialog';
import ScrollableChat from '../Components/ScrollableChat';
import SearchDialog from '../Dialogs/SearchDialog';
import ChatBox from '../Components/ChatBox';

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
import { useHistory } from 'react-router-dom';

const ChatPage = (props) => {
  const { user, chats, setChats, selectedChat, setSelectedChat, notifications,  } = ChatState();

  const history = useHistory();

  const [loggedUser, setLoggedUser] = useState();
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const handleOpenProfileDialog = () => setProfileDialogOpen(true);
  const handleCloseProfileDialog = () => setProfileDialogOpen(false);

  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const handleOpenSearchDialog = () => setSearchDialogOpen(true);
  const handleCloseSearchDialog = () => setSearchDialogOpen(false);

  return (
    <>
      <Topbar />
      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          height: '85vh',
          pt: '25px',
          overflow: 'hidden',
        }}      
      >
        <Box sx={{
          m: '0px 10px',
          minWidth: '360px',
          maxWidth: '360px',
          overflow: 'auto',
          display: {
            xs: selectedChat ? 'none' : 'flex',
            sm: selectedChat ? 'none' : 'flex',
            md: 'flex',
          },
          alignItems: 'center',
          flexDirection: 'column'
        }}>
          <Button
            onClick={() => history.push('/')}
            variant="contained"
            endIcon={<PersonSearchIcon />}
            size="large"
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
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {chats.map((chat, i) => {
              const otherUser = chat.users.find(chatUser => chatUser._id !== user?._id);
              const content = chat?.latestMessage?.content || ''
              let latestMessageSender = '';
              if (chat?.latestMessage?.sender?._id === user?._id) {
                latestMessageSender = 'You: '
              } else if (chat?.latestMessage?.sender?._id === otherUser._id) {
                latestMessageSender = `${otherUser.name}: `
              }
              return (
                <>
                  <ListItemButton
                    sx={{ 
                      backgroundColor: chat._id === selectedChat?._id ? 'rgba(244, 244, 244, 255)' : 'inherit',
                      m: '5px',
                      border: '2px solid rgba(244, 244, 244, 255)',
                      borderRadius: '15px',
                    }}
                    key={chat._id}
                    alignItems="flex-start"
                    onClick={() => { setSelectedChat(chat) }}
                  >
                    <ListItemAvatar>
                      <Avatar alt={otherUser.name} src={otherUser.pic} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={otherUser.name} 
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
                  {/* {i !== chats.length - 1 && <Divider />} */}
                </>
              );
            })}
          </List>
        </Box>
        {/* 
        
        ======================================= CHATBOX =====================================
        
        */}
        {user && <ChatBox />}
      </Container>
    </>
    
  )
}

export default ChatPage;

const userlist = (
  <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
    <ListItem alignItems="flex-start" sx={{ cursor: 'pointer' }}>
      <ListItemAvatar>
        <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
      </ListItemAvatar>
      <ListItemText
        primaryTypographyProps={{ style: {
          fontWeight: "bold"
        } }}
        primary="Ali Connors"
        secondary={
          <React.Fragment>
            <Typography
              sx={{ display: 'inline', fontWeight: 'bold' }}
              component="span"
              variant="body2"
              color="text.primary"
            >
              I'll be in your neighborhood doing errands this…"
            </Typography>
          </React.Fragment>
        }
      />
    </ListItem>
    <Divider variant="inset" component="li" />
    <ListItem alignItems="flex-start" sx={{ cursor: 'pointer' }}>
      <ListItemAvatar>
        <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
      </ListItemAvatar>
      <ListItemText
        primary="Summer BBQ"
        secondary={
          <React.Fragment>
            <Typography
              sx={{ display: 'inline' }}
              component="span"
              variant="body2"
              color="text.primary"
            >
              to Scott, Alex, Jennifer
            </Typography>
            {" — Wish I could come, but I'm out of town this…"}
          </React.Fragment>
        }
      />
    </ListItem>
    <Divider variant="inset" component="li" />
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
      </ListItemAvatar>
      <ListItemText
        primary="Oui Oui"
        secondary={
          <React.Fragment>
            <Typography
              sx={{ display: 'inline' }}
              component="span"
              variant="body2"
              color="text.primary"
            >
              Sandra Adams
            </Typography>
            {' — Do you have Paris recommendations? Have you ever…'}
          </React.Fragment>
        }
      />
    </ListItem>
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
      </ListItemAvatar>
      <ListItemText
        primary="Brunch this weekend?"
        secondary={
          <React.Fragment>
            <Typography
              sx={{ display: 'inline' }}
              component="span"
              variant="body2"
              color="text.primary"
            >
              Ali Connors
            </Typography>
            {" — I'll be in your neighborhood doing errands this…"}
          </React.Fragment>
        }
      />
    </ListItem>
    <Divider variant="inset" component="li" />
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
      </ListItemAvatar>
      <ListItemText
        primary="Summer BBQ"
        secondary={
          <React.Fragment>
            <Typography
              sx={{ display: 'inline' }}
              component="span"
              variant="body2"
              color="text.primary"
            >
              to Scott, Alex, Jennifer
            </Typography>
            {" — Wish I could come, but I'm out of town this…"}
          </React.Fragment>
        }
      />
    </ListItem>
    <Divider variant="inset" component="li" />
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
      </ListItemAvatar>
      <ListItemText
        primary="Oui Oui"
        secondary={
          <React.Fragment>
            <Typography
              sx={{ display: 'inline' }}
              component="span"
              variant="body2"
              color="text.primary"
            >
              Sandra Adams
            </Typography>
            {' — Do you have Paris recommendations? Have you ever…'}
          </React.Fragment>
        }
      />
    </ListItem>
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
      </ListItemAvatar>
      <ListItemText
        primary="Brunch this weekend?"
        secondary={
          <React.Fragment>
            <Typography
              sx={{ display: 'inline' }}
              component="span"
              variant="body2"
              color="text.primary"
            >
              Ali Connors
            </Typography>
            {" — I'll be in your neighborhood doing errands this…"}
          </React.Fragment>
        }
      />
    </ListItem>
    <Divider variant="inset" component="li" />
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
      </ListItemAvatar>
      <ListItemText
        primary="Summer BBQ"
        secondary={
          <React.Fragment>
            <Typography
              sx={{ display: 'inline' }}
              component="span"
              variant="body2"
              color="text.primary"
            >
              to Scott, Alex, Jennifer
            </Typography>
            {" — Wish I could come, but I'm out of town this…"}
          </React.Fragment>
        }
      />
    </ListItem>
    <Divider variant="inset" component="li" />
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
      </ListItemAvatar>
      <ListItemText
        primary="Oui Oui"
        secondary={
          <React.Fragment>
            <Typography
              sx={{ display: 'inline' }}
              component="span"
              variant="body2"
              color="text.primary"
            >
              Sandra Adams
            </Typography>
            {' — Do you have Paris recommendations? Have you ever…'}
          </React.Fragment>
        }
      />
    </ListItem>
  </List>
);
