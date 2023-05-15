const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body; // id of the person we're chatting with
  if (!userId) {
    console.log('UserId param not sent with request');
    return res.sendStatus(400);
  }

  let chat = await Chat.find({
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } }
    ]
  })
  .populate('users', '-password')
  .populate('latestMessage');

  chat = await User.populate(chat, {
    path: 'latestMessage.sender',
    select: 'name pic email',
  });

  if (chat.length > 0) {
    res.send(chat[0])
  } else {
    try {
      const createdChat = await Chat.create({
        users: [req.user._id, userId], 
      });
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-password')
      res.status(200);
      res.send(FullChat)
    } catch(err) {
      res.status(500);
      throw new Error(err.message);
    }
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({
      users: { $elemMatch: { $eq: req.user._id }}
    })
    .populate('users', '-password')
    .populate('latestMessage')
    .sort({ updatedAt: -1 })
    .then(async (chat) => {
      chat = await User.populate(chat, {
        path: 'latestMessage.sender',
        select: 'name pic email',
      });
      res.status(200).send(chat);
    })
  } catch(err) {

  }
});

const updateSeenChat = asyncHandler(async (req, res) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: req.body.chatId, unseenBy: req.user._id },
      { $unset: { unseenBy: 1 } },
      { new: true },
    );
    res.status(200).send(chat)
  } catch (error) {
    console.log({ error })
  }
});

const updateUnseenChat = asyncHandler(async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.body.chatId });
    if (!chat.users.includes(req.user._id)) {
      res.status(403).send('Cannot update another users chat');
    }
    const otherUser = chat.users.find(u => !u.equals(req.user._id));
    const result = await Chat.findByIdAndUpdate(chat._id, {
      unseenBy: otherUser
    }, { new: true });
    res.status(200).send(result)
  } catch (error) {
    
  }
});

module.exports = { accessChat, fetchChats, updateSeenChat, updateUnseenChat };