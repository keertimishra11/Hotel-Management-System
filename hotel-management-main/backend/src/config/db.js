// File: config/db.js
// Purpose: Setup and manage MySQL database connection using Sequelize ORM

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance (connection)
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false 
  }
);

// Function to test connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connected successfully');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, connectDB };
