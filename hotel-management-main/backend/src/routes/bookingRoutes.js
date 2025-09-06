// File: routes/bookingRoutes.js
// Purpose: Handle all booking-related APIs including CRUD, status updates, stats, and export

const express = require('express');
const { Op } = require('sequelize');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const authMiddleware = require('../middleware/authMiddleware');
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");

const router = express.Router();

// Check room availability
router.post('/check', async (req, res) => {
    try {
        const { roomId, check_in, check_out } = req.body;

        // Validate required fields
        if (!roomId || !check_in || !check_out) {
            return res.status(400).json({ available: false, message: "roomId, check_in, and check_out are required" });
        }

        const checkInDate = new Date(check_in);
        const checkOutDate = new Date(check_out);

        // Validate date formats
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            return res.status(400).json({ available: false, message: "Invalid check-in or check-out date" });
        }

        // Check for overlapping Booking
        const overlappingBooking = await Booking.findOne({
            where: {
                roomId,
                status: { [Op.in]: ['booked', 'checked-in'] },
                [Op.or]: [
                    { check_in: { [Op.between]: [checkInDate, checkOutDate] } },
                    { check_out: { [Op.between]: [checkInDate, checkOutDate] } },
                    { check_in: { [Op.lte]: checkInDate }, check_out: { [Op.gte]: checkOutDate } }
                ]
            }
        });

        console.log("Found overlappingBooking:", overlappingBooking);

        if (overlappingBooking) {
            return res.json({ available: false, message: 'Room already booked for these dates' });
        }

        res.json({ available: true });
    } catch (err) {
        console.error("Error checking availability:", err);
        res.status(500).json({ error: err.message });
    }
});

// Create booking (staff or admin)
router.post('/', authMiddleware(['admin', 'staff']), async (req, res) => {
    try {
        const { customer_name, customer_email, roomId, check_in, check_out } = req.body;

        // Check availability first
        const overlappingBooking = await Booking.findOne({
            where: {
                roomId,
                [Op.or]: [
                    {
                        check_in: { [Op.between]: [check_in, check_out] }
                    },
                    {
                        check_out: { [Op.between]: [check_in, check_out] }
                    },
                    {
                        check_in: { [Op.lte]: check_in },
                        check_out: { [Op.gte]: check_out }
                    }
                ]
            }
        });

        if (overlappingBooking) {
            return res.status(400).json({ message: 'Room already booked for these dates' });
        }

         // Create booking with default status 'booked'
        const booking = await Booking.create({
            customer_name,
            customer_email,
            roomId,
            check_in,
            check_out,
            status: 'booked'
        });

        res.json({ message: 'Booking created successfully', booking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all bookings (admin only)
router.get('/', authMiddleware(['admin']), async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            include: Room
        });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update booking status (check-in / check-out)
router.put('/:id/status', authMiddleware(['admin', 'staff']), async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Validate status value
        if (!['booked', 'checked-in', 'checked-out', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        booking.status = status;
        await booking.save();

        res.json({ message: `Booking status updated to ${status}`, booking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export bookings as Excel 
router.get("/export/excel", authMiddleware(['admin']), async (req, res) => {
    try {
        const bookings = await Booking.findAll({ include: Room });
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Bookings");

        // Define columns
        worksheet.columns = [
            { header: "ID", key: "id", width: 10 },
            { header: "Customer Name", key: "customer_name", width: 25 },
            { header: "Customer Email", key: "customer_email", width: 30 },
            { header: "Room Number", key: "room_number", width: 15 },
            { header: "Room Type", key: "room_type", width: 20 },
            { header: "Check-In", key: "check_in", width: 20 },
            { header: "Check-Out", key: "check_out", width: 20 },
            { header: "Status", key: "status", width: 15 },
        ];

        // Add each booking as a row
        bookings.forEach(b => {
            worksheet.addRow({
                id: b.id,
                customer_name: b.customer_name,
                customer_email: b.customer_email,
                room_number: b.Room.room_number,
                room_type: b.Room.type,
                check_in: b.check_in,
                check_out: b.check_out,
                status: b.status,
            });
        });

        // Set response headers for file download
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=bookings.xlsx");

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
