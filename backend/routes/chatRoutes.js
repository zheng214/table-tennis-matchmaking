const express = require('express');
const router = express.Router();
const { accessChat, fetchChats, updateSeenChat, updateUnseenChat } = require('../controllers/chatControllers'); 

const { protect } = require('../middlewares/authMiddleware');

router.route('/').post(protect, accessChat);
router.route('/').get(protect, fetchChats);
router.route('/seen').put(protect, updateSeenChat);
router.route('/unseen').put(protect, updateUnseenChat);

module.exports = router;