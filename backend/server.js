const express = require('express');
const { chats } = require('./data/data');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const colors = require('colors');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const path = require('path');


const app = express();

app.use(express.json());
dotenv.config();
connectDB();

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname1, '/frontend/build')))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname1, 'frontend', 'build', 'index.html'))
  })
} else {
  app.get('/', (req, res) => {
    res.send('API is running')
  })
}

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);


// -------------- DEPLOYMENT ---------------

// -------------- DEPLOYMENT ---------------


app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`.yellow.bold));

const io = require('socket.io')(server, {
  pingTimeout: 60000, 
  cors: {
    origin: 'http://localhost:3000',
  }
});

io.on('connection', (socket) => {
  console.log('connected to socket.io')

  socket.on('setup', (userData) => {
    if (userData) {
      socket.join(userData._id);
      socket.emit('connected');
    }
  })

  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('User joined room: ' + room)
  })

  socket.on('typing', ({ chatId, userId }) => {
    return socket.in(chatId).emit('typing', { chatId, userId })
  })
  socket.on('stop typing', ({ chatId, userId }) => socket.in(chatId).emit('stop typing', { chatId, userId }))

  socket.on('new message', (newMessage) => {
    let chat = newMessage.chat;
    if (!chat.users) {
      return 'chat.users not defined';
    }
    chat.users.forEach(user => {
      if (user._id === newMessage.sender._id) return;
      socket.in(user._id).emit('message recieved', newMessage)
    });
  });

  socket.on('leave room', (room) => {
    console.log('leaving room ', room)
    // socket.leave(room);
  })

  socket.off('setup', () => {
    console.log('User Disconnected');
    socket.leave(userData._id)
  })
})