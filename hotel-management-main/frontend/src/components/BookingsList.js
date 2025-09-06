// Component: BookingsList
// Purpose: Display all bookings and allow managing their status (Check-in, Check-out, Cancel) and download invoices

import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, Button, Tabs, Tab } from "@mui/material";
import API from "../services/api";

function BookingsList() {
  // List of all bookings fetched from backend
  const [items, setItems] = useState([]);

  // tab: 0 → Active, 1 → Past, 2 → Cancelled
  const [tab, setTab] = useState(0);

  // Fetch all bookings from API
  const load = async () => {
    try {
      const res = await API.get("/bookings"); 
      setItems(res.data || []); 
    } catch (err) {
      console.error("Error loading bookings:", err);
    }
  };

  // Update booking status (checked-in, checked-out, cancelled)
  const updateStatus = async (id, status) => {
    try {
      await API.put(`/bookings/${id}/status`, { status }); 
      load(); 
    } catch (err) {
      console.error("Error updating booking:", err);
    }
  };

  // Action helpers
  const checkIn = (id) => updateStatus(id, "checked-in"); // Mark booking as checked-in
  const checkOut = (id) => updateStatus(id, "checked-out"); // Mark booking as checked-out
  const cancelBooking = (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      updateStatus(id, "cancelled"); // Cancel booking
    }
  };

  // Load bookings on component mount
  useEffect(() => {
    load();
  }, []);

  // Categorize bookings based on status
  const activeBookings = items.filter(b => b.status === "booked" || b.status === "checked-in");
  const pastBookings = items.filter(b => b.status === "checked-out");
  const cancelledBookings = items.filter(b => b.status === "cancelled");

  // Decide which list to display based on selected tab
  const displayList =
    tab === 0 ? activeBookings : tab === 1 ? pastBookings : cancelledBookings;

  // Download invoice as PDF
  const handleDownloadInvoice = async (id) => {
    try {
      const token = localStorage.getItem("token"); // Auth token

      const response = await fetch(`http://localhost:5000/api/invoices/${id}/invoice`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch invoice");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------
  // RENDER UI
  // -------------------

  return (
    <Box sx={{ p: 2 }}>
      {/* Page Title */}
      <Typography variant="h4" sx={{ color: "#FFCD2D", mb: 2 }}>
        Reservations :
      </Typography>

      {/* Tabs for Active / Past / Cancelled bookings */}
      <Tabs
        value={tab}
        onChange={(e, newVal) => setTab(newVal)}
        textColor="inherit"
        TabIndicatorProps={{ style: { backgroundColor: "#FFCD2D" } }}
        sx={{ mb: 2 }}
      >
        <Tab label="Active" sx={{ color: "#fff" }} />
        <Tab label="Past" sx={{ color: "#fff" }} />
        <Tab label="Cancelled" sx={{ color: "#fff" }} />
      </Tabs>

      {/* No bookings message */}
      {displayList.length === 0 ? (
        <Typography color="gray">
          {tab === 0
            ? "No active bookings."
            : tab === 1
              ? "No past bookings."
              : "No cancelled bookings."}
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {displayList.map((b) => (
            <Grid item xs={12} md={6} key={b.id}>
              {/* Booking Card */}
              <Card
                sx={{
                  background: "linear-gradient(135deg, #1A1F4B, #2E2F6E)",
                  color: "#fff",
                  borderRadius: "15px",
                  boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
                  transition: 'all 0.4s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 2px 10px rgba(255,205,45,0.6)',
                    background: 'linear-gradient(135deg, #1A1F4B 0%, #2E2F6E 50%, #FFCD2D 100%)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '15px',
                    background: 'radial-gradient(circle at top left, rgba(255,205,45,0.2), transparent 70%)',
                    opacity: 0,
                    transition: 'opacity 0.5s ease',
                  },
                  '&:hover::before': {
                    opacity: 1,
                  },
                }}
              >
                <CardContent>
                  {/* Room Info */}
                  <Typography variant="h6" sx={{ color: "#FFCD2D", fontWeight: "bold" }}>
                    Room {b.Room?.room_number} — {b.Room?.type}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#aaa", mb: 1 }}>
                    Booking ID: #{b.id}
                  </Typography>
                  <Typography>
                    Guest: {b.customer_name}
                  </Typography>
                  <Typography>
                    Stay: {b.check_in} → {b.check_out}
                  </Typography>
                  <Typography>Status: {b.status}</Typography>

                  {/* Action Buttons for Active Bookings */}
                  {tab === 0 && (
                    <Box mt={1} display="flex" gap={1}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => checkIn(b.id)}
                        disabled={b.status !== "booked"} // Only allow check-in if booked
                      >
                        Check In
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => checkOut(b.id)}
                        disabled={b.status !== "checked-in"} // Only allow check-out if checked-in
                      >
                        Check Out
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => cancelBooking(b.id)}
                        disabled={b.status === "checked-out"}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}

                  {/* Action Buttons for Past Bookings */}
                  {tab === 1 && (
                    <Box mt={1} display="flex" gap={1} alignItems="center" >
                      <Typography color="#ccc" ml={0.2}>Completed</Typography>
                      <Button
                        variant="contained"  
                        color="secondary"
                        sx={{ width: "183px", height: "35px", ml: "10px" }}
                        onClick={() => handleDownloadInvoice(b.id)}
                      >
                        Download Invoice
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default BookingsList;
