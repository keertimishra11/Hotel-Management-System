// File: middleware/authMiddleware.js
// Purpose: Authenticate requests using JWT and optionally restrict access based on user roles

const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      // CHECK AUTH HEADER
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ message: 'No token provided' });

      //VERIFY TOKEN
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ROLE CHECK
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      req.user = decoded;
      next();
    } catch (err) {
      // Invalid or expired token
      res.status(401).json({ message: 'Invalid token' });
    }
  };
};

module.exports = authMiddleware;
