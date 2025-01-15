const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); // Updated import for Socket.IO
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const authMiddleware = require('./middleware/auth'); // Import the auth middleware

require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, // Allow cookies or authorization headers
}));

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
