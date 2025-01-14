const mongoose = require('mongoose');

// Regular expression to allow only alphanumeric characters, underscores, and hyphens
const usernameRegex = /^[a-zA-Z0-9_-]+$/;

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    match: [usernameRegex, 'Username can only contain letters, numbers, underscores, and hyphens'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('User', UserSchema);
