// File: models/Room.js
// Purpose: Define Room model with fields like room_number, type, tariff for hotel management

const { DataTypes } = require('sequelize'); 
const { sequelize } = require('../config/db');

// Define Room model
const Room = sequelize.define('Room', {
  room_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tariff: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
});

module.exports = Room;
