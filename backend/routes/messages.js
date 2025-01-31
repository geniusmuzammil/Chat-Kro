const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const authenticate = require('../middleware/auth');
const mongoose = require("mongoose");

const router = express.Router();

// Send message (protected route)
router.post('/send', authenticate, async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  try {
    if (req.user !== senderId) {
      return res.status(403).json({ msg: 'Unauthorized action' });
    }

    const newMessage = new Message({ senderId: senderId, receiverId: receiverId, content });
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
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get("/recipients/:userId", authenticate, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId); // Convert to ObjectId

    const recipients = await Message.aggregate([
      { 
        $match: { 
          $or: [{ senderId: userId }, { receiverId: userId }] 
        } 
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"]
          },
        },
      },
      {
        $lookup: {
          from: "users", // Assuming your User collection is named "users"
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $project: {
          _id: 1,
          username: { $arrayElemAt: ["$userDetails.username", 0] } // Extract username from userDetails array
        }
      }
    ]);

    res.json(recipients);
  } catch (error) {
    console.error("Error fetching recipients:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
