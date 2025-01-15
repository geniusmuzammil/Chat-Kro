const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Send message (protected route)
router.post('/send', authenticate, async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  try {
    if (req.user !== senderId) {
      return res.status(403).json({ msg: 'Unauthorized action' });
    }

    const newMessage = new Message({ sender: senderId, receiver: receiverId, content });
    await newMessage.save();

    res.status(200).json(newMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get messages between two users
router.get('/conversation/:user1/:user2', authenticate, async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    if (![user1, user2].includes(req.user)) {
      return res.status(403).json({ msg: 'Access denied' });
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
