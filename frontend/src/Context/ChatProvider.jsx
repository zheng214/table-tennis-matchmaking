import { createContext, useContext, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import io from 'socket.io-client';
import axios from 'axios';

export const ChatContext = createContext();

let ENDPOINT;
if (process.env.NODE_ENV === 'production') {
  ENDPOINT = 'https://tt-matchmaking.herokuapp.com/'
} else {
  ENDPOINT = 'http://localhost:5000'
}

let socket;

export default function ChatProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('userInfo')));
  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  const history = useHistory();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    setUser(userInfo)
    
    if (!userInfo) {
      history.push('/login');
    }
    socket = io(ENDPOINT);
    if (userInfo) {
      socket.emit('setup', userInfo);
    }
    socket.on('connected', () => {
      setSocketConnected(true);
    })
  }, [history])

  const fetchChats = async () => {
    if (!user) {
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get('/api/chat', config);
      setChats(data);
      setNotifications(data.filter(chat => chat.unseenBy === user._id))
    } catch(e) {
      console.log(e.message)
    }
  }

  useEffect(() => {
    fetchChats();
  }, [user])

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
    async function onMessageRecieved(newMessage) {
      setChats([ newMessage.chat, ...chats.filter(c => c._id !== newMessage.chat._id)])
      if (!selectedChat || selectedChat._id !== newMessage.chat._id) {
        // notification
        if (!notifications.some(notif => notif._id === newMessage.chat._id)) {
          setNotifications([newMessage.chat, ...notifications])
        } else {
          const existingNotif = notifications.find(notif => notif._id === newMessage.chat._id);
          setNotifications([existingNotif, ...notifications.filter(notif => notif._id !== newMessage.chat._id)])
        }
      } else {
        setMessages([ ...messages, newMessage ]);
        updateSeenChat();
      }
    }

    socket.on('message recieved', onMessageRecieved)

    return () => {
      socket.off('message recieved', onMessageRecieved)
    }

  })

  return (
    <ChatContext.Provider value={{
      user,
      setUser,
      selectedChat,
      setSelectedChat,
      chats,
      setChats,
      notifications,
      setNotifications,
      messages,
      setMessages,
      socketConnected,
      setSocketConnected,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const ChatState = () => {
  return useContext(ChatContext);
}