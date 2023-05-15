const express = require('express');
const router = express.Router();
const { registerUser, authUser, allUsers, editProfile, emailExists } = require('../controllers/userControllers');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').post(registerUser).get(protect, allUsers);
router.post('/login', authUser)
router.route('/edit').put(protect, editProfile);
router.get('/emailExists/:email', emailExists)

module.exports = router;
