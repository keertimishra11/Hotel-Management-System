const express = require("express");
const router = express.Router();
const { sequelize } = require("../config/db");

router.get("/stats", async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) AS totalUsers,
        (SELECT COUNT(*) FROM rooms) AS totalRooms,
        (SELECT COUNT(*) FROM bookings) AS totalBookings
    `);

    res.json(results[0]);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch stats", details: err.message });
  }
});

module.exports = router;
router.get("/stats", async (req, res) => {
  try {
    console.log("📌 Stats route hit");
    const [results] = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) AS totalUsers,
        (SELECT COUNT(*) FROM rooms) AS totalRooms,
        (SELECT COUNT(*) FROM bookings) AS totalBookings
    `);

    console.log("📊 Stats results:", results);
    res.json(results[0]);
  } catch (err) {
    console.error("❌ Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch stats", details: err.message });
  }
});
