// Component: Bookings
// Purpose: Allows users to search for available rooms, view room details, and create bookings

import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    MenuItem,
    Button,
    Grid,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert
} from "@mui/material";
import RoomIcon from "@mui/icons-material/MeetingRoom";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

// Predefined room types for dropdown
const ROOM_TYPES = [
    "Standard", "Deluxe", "Suite", "Executive",
    "Family Room", "Twin Room", "King Room",
    "Presidential Suite", "Studio"
];

function Bookings() {
    const navigate = useNavigate(); // Navigation hook for redirects
    // Form state
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [roomType, setRoomType] = useState("");
    const [loading, setLoading] = useState(false);
    const [available, setAvailable] = useState([]);
    const [error, setError] = useState(null);

    // Snackbar state for showing messages
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info"
    });

    // Booking dialog state
    const [open, setOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [guest, setGuest] = useState({
        name: "", email: "", phone: "", idNumber: ""
    });

    // Redirect user to login if not authenticated
    useEffect(() => {
        if (!localStorage.getItem("token")) navigate("/");
    }, [navigate]);

    // Helper function to show messages via Snackbar
    const showMessage = (message, severity = "info") => {
        setSnackbar({ open: true, message, severity });
    };

    // Validate check-in and check-out dates
    function validateDates(checkIn, checkOut) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to avoid time conflicts

        const inDate = new Date(checkIn);
        const outDate = new Date(checkOut);

        if (inDate < today) {
            return "Check-in date cannot be in the past.";
        }
        if (outDate <= inDate) {
            return "Check-out date must be after check-in date.";
        }
        return null;
    }

    // Check room availability based on selected dates and room type
    const checkAvailability = async () => {
        if (!checkIn || !checkOut) {
            setError("Please select both check-in and check-out dates.");
            setAvailable([]);
            return;
        }

        const dateError = validateDates(checkIn, checkOut);
        if (dateError) {
            setError(dateError);
            setAvailable([]);
            return;
        }

        setError(null);
        setLoading(true);
        setAvailable([]);

        try {
            // Fetch all rooms from API
            const roomsRes = await API.get("/rooms");
            const rooms = roomsRes.data || [];

            // Filter rooms by selected type or show all
            const candidateRooms = roomType
                ? rooms.filter((r) => r.type === roomType)
                : rooms;

            if (candidateRooms.length === 0) {
                setError("No rooms found. Add rooms first.");
                setLoading(false);
                return;
            }

            const availableRooms = [];

            // Check availability for each room
            for (const room of candidateRooms) {
                try {
                    const payload = {
                        roomId: room.id,
                        check_in: checkIn,
                        check_out: checkOut,
                    };

                    const res = await API.post("/bookings/check", payload);

                    if (res.data.available) {
                        availableRooms.push(room); // Room is available
                    }
                } catch (roomErr) {
                    console.error(
                        `Error checking availability for room ${room.id}:`,
                        roomErr.response?.data || roomErr.message
                    );
                }
            }

            setAvailable(availableRooms);

            if (availableRooms.length === 0) {
                setError("No available rooms for these dates.");
            }
        } catch (err) {
            console.error("Failed to load rooms or check availability:", err);
            setError("Failed to check availability. Try again later.");
            showMessage("Failed to check availability. Try again later.", "error");
        } finally {
            setLoading(false);
        }
    };

    // Open booking dialog for selected room
    const startBooking = (room) => {
        setSelectedRoom(room);
        setOpen(true);
    };

    // Create a booking with guest info and selected room
    const createBooking = async () => {
        if (!selectedRoom) {
            showMessage("Please select a room first!", "error");
            return;
        }
        if (!guest.name || !guest.phone) {
            showMessage("Guest name and phone are required.", "error");
            return;
        }
        if (!checkIn || !checkOut) {
            showMessage("Select both check-in and check-out dates.", "error");
            return;
        }

        const dateError = validateDates(checkIn, checkOut);
        if (dateError) {
            showMessage(dateError, "error");
            return;
        }

        const payload = {
            roomId: selectedRoom.id,
            customer_name: guest.name,
            customer_email: guest.email,
            check_in: checkIn,
            check_out: checkOut
        };

        try {
            const res = await API.post("/bookings", payload);
            console.log("Booking response:", res.data);
            setOpen(false);
            setGuest({ name: "", email: "", phone: "", idNumber: "" });
            showMessage("Booking created successfully", "success");
            checkAvailability();
        } catch (e) {
            console.error("Failed booking:", e.response?.data || e.message);
            showMessage(e.response?.data?.message || "Failed to create booking", "error");
        }
    };

    // -------------------
    // RENDER UI
    // -------------------

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #0C0F2C 0%, #1A1F4B 100%)", // Page background
            }}
        >
            <Box sx={{ p: 3 }}>
                {/* Page Title */}
                <Typography
                    variant="h4"
                    textAlign="center"
                    sx={{ color: "#FFCD2D", fontWeight: "bold", mb: 3 }}
                >
                    Bookings
                </Typography>

                {/* Search Form */}
                <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center" mb={3}>
                    {/* Check-in Date */}
                    <TextField
                        type="date"
                        label="Check-In"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        InputLabelProps={{ shrink: true, sx: { color: "#ccc" } }}
                        InputProps={{ sx: { color: "#fff" } }}
                        sx={{
                            backgroundColor: "rgba(255,255,255,0.1)",
                            borderRadius: 2,
                            minWidth: 200,
                            "& input[type='date']::-webkit-calendar-picker-indicator": {
                                filter: "invert(1)",
                            },
                        }}
                    />

                    {/* Check-out Date */}
                    <TextField
                        label="Check-Out"
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        InputLabelProps={{ shrink: true, sx: { color: "#ccc" } }}
                        InputProps={{ sx: { color: "#fff" } }}
                        sx={{
                            backgroundColor: "rgba(255,255,255,0.1)",
                            borderRadius: 2,
                            minWidth: 200,
                            "& input[type='date']::-webkit-calendar-picker-indicator": {
                                filter: "invert(1)",
                            },
                        }}
                    />

                    {/* Room Type Dropdown */}
                    <TextField
                        select
                        label="Room Type"
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value)}
                        SelectProps={{ displayEmpty: true }}
                        InputLabelProps={{ shrink: true, sx: { color: "#ccc" } }}
                        InputProps={{ sx: { color: "#fff" } }}
                        sx={{
                            backgroundColor: "rgba(255,255,255,0.1)",
                            borderRadius: 2,
                            minWidth: 220,
                            "& .MuiSvgIcon-root": {
                                color: "#b4ae99ff",
                            },
                        }}
                    >
                        <MenuItem value="">Any</MenuItem>
                        {ROOM_TYPES.map((t) => (
                            <MenuItem key={t} value={t}>{t}</MenuItem>
                        ))}
                    </TextField>

                    {/* Check Availability Button */}
                    <Button
                        onClick={checkAvailability}
                        variant="contained"
                        sx={{
                            background: "linear-gradient(45deg, #FFCD2D, #FF9F1C)",
                            color: "#0C0F2C",
                            fontWeight: "bold",
                            px: 3
                        }}
                    >
                        Check Availability
                    </Button>
                </Box>

                {/* Loading Indicator */}
                {loading && (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                        <Typography ml={2} color="#fff">Checking availability...</Typography>
                    </Box>
                )}

                {/* Error Message */}
                {error && (
                    <Box display="flex" justifyContent="center" mt={2}>
                        <Typography color="error">{error}</Typography>
                    </Box>
                )}

                {/* Available Rooms List */}
                {available.length > 0 && (
                    <Box mt={4}>
                        <Typography variant="h5" sx={{ color: "#FFCD2D", mb: 2 }}>
                            Available Rooms
                        </Typography>

                        {Object.entries(
                            available.reduce((acc, room) => {
                                if (!acc[room.type]) acc[room.type] = [];
                                acc[room.type].push(room);
                                return acc;
                            }, {})
                        ).map(([type, rooms]) => (
                            <Box key={type} mb={4}>
                                <Typography variant="h6" sx={{ color: "#ffe386ff", mb: 2 }}>
                                    {type}
                                </Typography>
                                <Grid container spacing={3}>
                                    {rooms.map((room) => (
                                        <Grid item xs={12} sm={6} md={4} key={room.id}>
                                            <Card
                                                sx={{
                                                    background: "linear-gradient(135deg, #1A1F4B, #2E2F6E)",
                                                    color: "#fff",
                                                    borderRadius: "15px",
                                                    boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
                                                    transition: '0.3s',
                                                    '&:hover': {
                                                        transform: 'scale(1.03)',
                                                        boxShadow: '0 12px 25px rgba(255,205,45,0.5)',
                                                    },
                                                }}
                                            >
                                                <CardContent
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Box>
                                                        {/* Room Number */}
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                                            <RoomIcon sx={{ color: "#FFCD2D" }} />
                                                            <Typography variant="subtitle1" sx={{ color: "#ccc" }}>
                                                                Room {room.room_number}
                                                            </Typography>
                                                        </Box>

                                                        {/* Room Tariff */}
                                                        <Typography variant="h6" fontWeight="bold" color="#ffe386ff" ml={0.5}>
                                                            ₹ {room.tariff} / night
                                                        </Typography>
                                                    </Box>

                                                    {/* Book Button */}
                                                    <Button
                                                        onClick={() => startBooking(room)}
                                                        variant="contained"
                                                        sx={{
                                                            background: "linear-gradient(45deg, #FFCD2D, #FF9F1C)",
                                                            color: "#0C0F2C",
                                                            fontWeight: "bold",
                                                            ml: "25px",
                                                            mt: "20px"
                                                        }}
                                                    >
                                                        Book
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        ))}
                    </Box>
                )}

                {/* Booking Dialog */}
                <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Guest Details</DialogTitle>
                    <DialogContent>
                        {/* Room Summary */}
                        <Box sx={{ mb: 3, p: 2, borderRadius: 2, background: "linear-gradient(135deg, #1A1F4B, #2E2F6E)", color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
                            <Typography variant="h6" sx={{ color: "#FFCD2D", mb: 1 }}>
                                Room {selectedRoom?.room_number} — {selectedRoom?.type}
                            </Typography>
                            <Typography><strong>Tariff:</strong> ₹{selectedRoom?.tariff} / night</Typography>
                            <Typography><strong>Stay:</strong> {checkIn} → {checkOut}</Typography>
                        </Box>

                        {/* Guest Info Form */}
                        <Box display="flex" gap={2} flexWrap="wrap" mt={1}>
                            <TextField label="Guest Name" fullWidth value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} />
                            <TextField label="Email" fullWidth value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} />
                            <TextField label="Phone" fullWidth value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} />
                            <TextField label="ID Number (Govt ID)" fullWidth value={guest.idNumber} onChange={(e) => setGuest({ ...guest, idNumber: e.target.value })} />
                        </Box>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={createBooking}>Confirm Booking</Button>
                    </DialogActions>
                </Dialog>
            </Box>

            {/* Snackbar for messages */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default Bookings;
