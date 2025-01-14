const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const authMiddleware = require('./middleware/auth'); // Import the auth middleware

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);

// Protected message routes
app.use('/api/messages', authMiddleware, messageRoutes); // Apply middleware to message routes

// Socket.io connection
io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('sendMessage', (message) => {
    io.emit('receiveMessage', message); // Broadcast message to all clients
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
