const express = require('express');
const router = express.Router();
const messageController = require('../controllers/MessageController');

// router.post('/send-message', messageController.sendMessage);
router.get('/recent-list/:id', messageController.RecentList);
router.get('/recent-messages/:senderId/:receiverId', messageController.RecentMessages);

module.exports = router;
