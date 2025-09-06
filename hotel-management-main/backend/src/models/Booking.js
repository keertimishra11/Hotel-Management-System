// File: models/Booking.js
// Purpose: Define Booking model with fields, status enum, and relationships with Room

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); 
const Room = require('./Room'); // Room model (for associations)

// Define Booking model 
const Booking = sequelize.define('Booking', {
  customer_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customer_email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  check_in: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  check_out: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('booked', 'checked-in', 'checked-out', 'cancelled'),
    defaultValue: 'booked'
  }
});

//  MODEL ASSOCIATIONS 
// One Room can have multiple Bookings
Room.hasMany(Booking, { foreignKey: 'roomId' });
// Each Booking belongs to a single Room
Booking.belongsTo(Room, { foreignKey: 'roomId' });

module.exports = Booking;
