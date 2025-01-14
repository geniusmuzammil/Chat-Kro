const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the username or email already exists
    const userByUsername = await User.findOne({ username });
    const userByEmail = await User.findOne({ email });

    if (userByUsername) {
      return res.status(400).json({ msg: 'Username already taken' });
    }

    if (userByEmail) {
      return res.status(400).json({ msg: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the new user
    const newUser = new User({ username, email, password: hashedPassword });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    // Handle the error if the username has invalid characters
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: err.message });
    }

    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    // Find user by username or email
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });

    if (!user) {
      return res.status(400).json({ msg: 'Username or Email not found' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create payload for JWT token
    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Example of a protected route
router.get('/api/messages/conversation/:senderId/:receiverId', authenticate, async (req, res) => {
  const { senderId, receiverId } = req.params;
  try {
    // You can access the user ID of the authenticated user via req.user
    const userId = req.user;

    // Now you can check if the authenticated user is allowed to view the conversation
    // Example: Fetch the messages from the database based on sender and receiver
    const conversation = await Message.find({
      sender: senderId,
      receiver: receiverId,
    });

    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
