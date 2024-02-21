const express = require("express");
const {
  allMessages,
  sendMessage,
} = require("../Controllers/Message");
const { protect } = require("../Middleware/authMiddleware");

const router = express.Router();


router.post('/sendMessage',protect,sendMessage);
router.get('/:chatId',protect,allMessages);

module.exports = router;