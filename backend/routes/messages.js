const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth'); // Import the auth middleware

const router = express.Router();

// Send message (protected route)
router.post('/send', authMiddleware, async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  try {
    // Ensure the senderId matches the authenticated user
    if (req.user !== senderId) {
      return res.status(403).json({ msg: 'You are not authorized to send messages as this user' });
    }

    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
    });
    await newMessage.save();

    res.status(200).json(newMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get messages between two users (protected route)
router.get('/conversation/:user1/:user2', authMiddleware, async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    // Ensure the authenticated user is either user1 or user2
    if (req.user !== user1 && req.user !== user2) {
      return res.status(403).json({ msg: 'You are not authorized to view this conversation' });
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
