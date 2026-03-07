const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken } = require('../middleware/auth');

router.post('/send', verifyToken, messageController.sendMessage);
router.get('/chat/:otherUserId', verifyToken, messageController.getMessages);
router.put('/read/:messageId', verifyToken, messageController.markAsRead);
router.delete('/chat/:otherUserId', verifyToken, messageController.deleteChat);

module.exports = router;
