const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message'); // Import the Message model
const authenticate = require('../middleware/auth');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the username or email already exists
    const userByUsername = await User.findOne({ username });
    const userByEmail = await User.findOne({ email });

    if (userByUsername || userByEmail) {
      return res
        .status(400)
        .json({ msg: userByUsername ? 'Username taken' : 'Email registered' });
    }

    // Hash the password and save the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, payload});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
