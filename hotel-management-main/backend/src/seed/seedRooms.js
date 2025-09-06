const Room = require("../models/Room");

const ROOM_TYPES = [
  "Standard", "Deluxe", "Suite", "Executive",
  "Family Room", "Twin Room", "King Room",
  "Presidential Suite", "Studio"
];

// Base tariffs (₹) for each type
const BASE_TARIFF = {
  "Standard": 2000,
  "Deluxe": 3500,
  "Suite": 6000,
  "Executive": 4500,
  "Family Room": 3000,
  "Twin Room": 2500,
  "King Room": 4000,
  "Presidential Suite": 10000,
  "Studio": 2800
};

async function seedRooms() {
  try {
    const existing = await Room.count();
    if (existing > 0) {
      console.log("ℹ️ Rooms already exist, skipping seeding.");
      return;
    }

    const roomsToCreate = [];
    let typeIndex = 0;

    // Generate ~100 rooms → 12 floors, 7–8 rooms per floor
    for (let floor = 1; floor <= 15; floor++) {
      const roomsOnFloor = (floor % 2 === 0) ? 8 : 7; // even floors 8, odd floors 7
      for (let r = 1; r <= roomsOnFloor; r++) {
        const room_number = `${floor}${r.toString().padStart(2, "0")}`;
        const type = ROOM_TYPES[typeIndex % ROOM_TYPES.length];
        const tariff = BASE_TARIFF[type];

        roomsToCreate.push({ room_number, type, tariff });
        typeIndex++;
      }
    }

    await Room.bulkCreate(roomsToCreate);
    console.log(`✅ Seeded ${roomsToCreate.length} rooms successfully!`);
  } catch (err) {
    console.error("❌ Error seeding rooms:", err);
  }
}

module.exports = seedRooms;
