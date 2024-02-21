const express = require("express");
const router = express.Router();



const {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
} = require("../Controllers/Chat");

const { protect } = require("../Middleware/authMiddleware");



router.post("/accesschat",protect, accessChat);
router.get("/fetchchat",protect, fetchChats);
router.post('/createGroup',protect,createGroupChat);
router.put('/renamegroup',protect,renameGroup);
router.put('/groupremove',protect,removeFromGroup);
router.put('/groupadd',protect,addToGroup);


module.exports = router;

