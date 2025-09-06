// File: routes/invoiceRoutes.js
// Purpose: Generate PDF invoices for bookings with full booking and room details

const express = require('express');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Generate Invoice
router.get('/:id/invoice', authMiddleware(['admin', 'staff']), async (req, res) => {
    try {
        // Find booking by ID and include associated room info
        const booking = await Booking.findByPk(req.params.id, {
            include: Room
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Create invoices directory if it doesn't exist
        const invoicesDir = path.join(__dirname, '../../invoices');
        if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir);

        // Create PDF document        
        const doc = new PDFDocument({ margin: 50 });
        const invoicePath = path.join(__dirname, `../../invoices/invoice_${booking.id}.pdf`);

        if (!fs.existsSync(path.join(__dirname, '../../invoices'))) {
            fs.mkdirSync(path.join(__dirname, '../../invoices'));
        }

        const stream = fs.createWriteStream(invoicePath);
        doc.pipe(stream);

        // --- HEADER ---
        doc
            .fillColor('#2C3E50')
            .fontSize(24)
            .font('Helvetica-Bold')
            .text('The Grand Hotel', { align: 'center' });

        doc
            .fontSize(10)
            .fillColor('#7F8C8D')
            .text('123 Paradise Street, Mumbai, India', { align: 'center' })
            .moveDown();

        doc.moveTo(50, 90).lineTo(550, 90).strokeColor('#BDC3C7').lineWidth(1).stroke();

        // --- CUSTOMER INFO ---
        doc.moveDown(0.8);
        doc.fontSize(12).fillColor('#34495E').font('Helvetica-Bold').text(`Invoice ID : ${booking.id}`);
        doc.font('Helvetica').fillColor('#000').text(`Date : ${new Date().toLocaleDateString()}`);
        doc.text(`Customer : ${booking.customer_name}`);
        doc.text(`Email : ${booking.customer_email}`);

        doc.moveDown();
        doc.fillColor('#7F8C8D').font('Helvetica-Bold').text('Booking Details', { underline: true });
        doc.moveDown(0.5);

        const start = new Date(booking.check_in);
        const end = new Date(booking.check_out);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const total = nights * booking.Room.tariff;

        // --- ROOM DETAILS ---
        doc.font('Helvetica').fillColor('#2C3E50').fontSize(11)
            .text(`Room Number : ${booking.Room.room_number}`, { continued: true })
            .text(`   Type : ${booking.Room.type}`);
        doc.text(`Stay : ${booking.check_in} to ${booking.check_out}`);
        doc.text(`Tariff per night : Rs.${booking.Room.tariff}`);
        doc.text(`Total Nights : ${nights}`);

        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#BDC3C7').stroke();

        // --- TOTAL AMOUNT BOX ---
        doc.moveDown();
        doc.rect(50, doc.y, 500, 25).fillAndStroke('#FDEDEC', '#E74C3C');
        doc.fillColor('#000').fontSize(12).text('Total Amount :', 60, doc.y + 9);
        doc.fillColor('#E74C3C').fontSize(14).text(`Rs.${total}`, 0, doc.y - 15, { align: 'right', width: 510 });

        doc.moveDown(2);

        // --- FOOTER ---
        doc.moveTo(50, 720).lineTo(550, 720).strokeColor('#BDC3C7').stroke();
        doc.moveDown();
        doc.fontSize(9).fillColor('#7F8C8D')
            .text('Thank you for staying with The Grand Hotel!', { align: 'center' })
            .text('For bookings & inquiries: +91 98XXX XXXXX | contact@grandhotel.com', { align: 'center' })
            .text('Website: www.grandhotel.com', { align: 'center' });

        // Finalize PDF and send as download
        doc.end();
        stream.on('finish', () => {
            res.download(invoicePath);
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
