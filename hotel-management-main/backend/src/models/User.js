// File: models/User.js
// Purpose: Define User model for authentication and role management (admin/staff)


const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Define User model
const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'staff'),
    defaultValue: 'staff'
  }
});

module.exports = User;
