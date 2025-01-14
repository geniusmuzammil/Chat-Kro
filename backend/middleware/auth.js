const jwt = require('jsonwebtoken');

// Middleware to authenticate user via JWT token
const authMiddleware = (req, res, next) => {
  // Get token from the Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId; // Attach the user ID to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error(err.message);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
