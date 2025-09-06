// File: routes/roomRoutes.js
// Purpose: Handle all room-related APIs including CRUD operations and public listing

const express = require('express');
const Room = require('../models/Room');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public route → View all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.findAll();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-only → Add room
router.post('/', authMiddleware(['admin']), async (req, res) => {
  try {
    const { room_number, type, tariff } = req.body;
    
    // Create new room in DB
    const room = await Room.create({ room_number, type, tariff });
    res.json({ message: 'Room added successfully', room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-only → Update room
router.put('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const { room_number, type, tariff } = req.body;
    
    // Find room by ID
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Update only provided fields
    room.room_number = room_number || room.room_number;
    room.type = type || room.type;
    room.tariff = tariff || room.tariff;
    await room.save();

    res.json({ message: 'Room updated successfully', room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin-only → Delete room
router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    await room.destroy();  // Remove room from DB
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
