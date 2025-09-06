// File: server.js
// Purpose: Main entry point for the Hotel Management backend API, sets up Express server, connects to DB, and defines global routes

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');
const Room = require('./models/Room');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const seedRooms = require("./seed/seedRooms"); 
const statsRoutes = require("./routes/statsRoutes");



const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use("/", statsRoutes);
app.use('/api/admin', adminRoutes);


// Simple health route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Hotel Management API — server is up' });
});

// Example test route for bookings (placeholder)
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route working — replace with real endpoints later' });
});

// Connect to MySQL
connectDB().then(() => {
  // Sync DB models
  sequelize.sync({ force: false }).then(async () => {
    console.log("✅ Database synced");
    await seedRooms(); // ✅ auto-run seeder ONCE
  });
});

// API route: add a room
app.post('/api/rooms', async (req, res) => {
  try {
    const { room_number, type, tariff } = req.body;
    const room = await Room.create({ room_number, type, tariff });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});



