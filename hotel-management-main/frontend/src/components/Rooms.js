// Component: Rooms
// Purpose: Manage hotel rooms including adding, editing, deleting, filtering, and listing rooms

import React, { useState, useEffect } from "react";
import API from "../services/api";
import {
  Typography,
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Box,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RoomIcon from '@mui/icons-material/MeetingRoom';

function Rooms() {
  // List of all rooms fetched from backend
  const [rooms, setRooms] = useState([]);
  
  // State for adding a new room
  const [newRoom, setNewRoom] = useState({ room_number: "", type: "", tariff: "" });

  // State for editing an existing room
  const [editingRoom, setEditingRoom] = useState(null);

  // Loading states for adding or updating rooms
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Search & filter states
  const [search, setSearch] = useState(""); 
  const [filterType, setFilterType] = useState(""); 
  // General UI states
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  // Fetch all rooms from API on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  // Fetch rooms from backend
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await API.get("/rooms"); 
      setRooms(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch rooms");
      setLoading(false);
    }
  };

  // Show loading spinner while fetching rooms
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
        <Typography ml={2}>Loading rooms...</Typography>
      </Box>
    );
  }

  // Show error if fetching rooms failed
  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Add new room
  const addRoom = async (e) => {
    e.preventDefault(); 
    setAdding(true); 
    try {
      await API.post("/rooms", newRoom); 
      setNewRoom({ room_number: "", type: "", tariff: "" }); // Reset form
      fetchRooms(); 
    } catch (err) {
      console.error("Add error:", err.response?.data || err.message);
      alert("Failed to add room");
    } finally {
      setAdding(false); 
    }
  };

  // Update existing room
  const updateRoom = async (e) => {
    e.preventDefault();
    setUpdating(true); 
    try {
      await API.put(`/rooms/${editingRoom.id}`, editingRoom); 
      setEditingRoom(null); 
      fetchRooms(); 
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      alert("Failed to update room");
    } finally {
      setUpdating(false); 
    }
  };

  // Delete a room
  const deleteRoom = async (id) => {
    try {
      await API.delete(`/rooms/${id}`); 
      fetchRooms(); 
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
    }
  };

  // Start editing a room
  const startEdit = (room) => setEditingRoom(room);

  // -------------------
  // RENDER UI
  // -------------------

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0C0F2C 0%, #1A1F4B 100%)", // Page background gradient
      }}
    >
      {/* Page Title */}
      <Box display="flex" flexWrap="wrap" alignItems="center" justifyContent="center" mb={3} gap={8}>
        <Typography
          variant="h4"
          sx={{ color: "#FFCD2D", fontWeight: "bold", mt: "20px" }}
        >
          Rooms Management
        </Typography>

        {/* Search & Filter */}
        <Box display="flex" gap={2} flexWrap="wrap" mt={3.5}>
          {/* Search by room number */}
          <TextField
            label="Search Room Number"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2, width: "190px" }}
            InputLabelProps={{ sx: { color: "#ccc" } }}
            InputProps={{ sx: { color: "#fff" } }}
          />

          {/* Filter by room type */}
          <TextField
            select
            label="Filter by Type"
            size="small"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            SelectProps={{ displayEmpty: true }}
            sx={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2, width: "142px" }}
            InputLabelProps={{ shrink: true, sx: { color: "#ccc" } }}
            InputProps={{ sx: { color: "#fff" } }}
          >
            <MenuItem value="">All</MenuItem>
            {["Standard", "Deluxe", "Suite", "Executive", "Family Room", "Twin Room", "King Room", "Presidential Suite", "Studio"].map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* -------------------
          ADD ROOM FORMS
      ------------------- */}

      <Grid container spacing={3} justifyContent={"center"}>
        {/* Add Room Card */}
        <Grid item xs={12} md={editingRoom ? 6 : 12}>
          <Card sx={{
            mb: 4,
            borderRadius: 3,
            background: "linear-gradient(135deg, #1A1F4B, #2E2F6E)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: "#FFCD2D", mb: 0.05, textAlign: "center", fontSize: "30px" }}>
                Add New Room
              </Typography>

              {/* Add Room Form */}
              <Box component="form" onSubmit={addRoom} sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {/* Room Number */}
                <TextField
                  label="Room Number"
                  variant="filled"
                  value={newRoom.room_number}
                  onChange={(e) => setNewRoom({ ...newRoom, room_number: e.target.value })}
                  required
                  sx={{ width: "150px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2 }}
                  InputLabelProps={{ sx: { color: "#ccc" } }}
                  InputProps={{ sx: { color: "#fff" } }}
                />

                {/* Room Type */}
                <TextField
                  select
                  label="Room Type"
                  value={newRoom.type}
                  onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                  sx={{ width: "500px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2 }}
                  InputLabelProps={{ sx: { color: "#ccc" } }}
                  InputProps={{ sx: { color: "#fff" } }}
                >
                  {["Standard", "Deluxe", "Suite", "Executive", "Family Room", "Twin Room", "King Room", "Presidential Suite", "Studio"].map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </TextField>

                {/* Tariff */}
                <TextField
                  label="Tariff (₹)"
                  type="number"
                  variant="filled"
                  value={newRoom.tariff}
                  onChange={(e) => setNewRoom({ ...newRoom, tariff: e.target.value })}
                  required
                  sx={{ width: "150px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2 }}
                  InputLabelProps={{ sx: { color: "#ccc" } }}
                  InputProps={{ sx: { color: "#fff" } }}
                />

                {/* Add Button */}
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    background: "linear-gradient(45deg, #FFCD2D, #FF9F1C)",
                    color: "#0C0F2C",
                    mt: "6px",
                    height: "45px",
                    fontWeight: "bold",
                    '&:hover': { background: "linear-gradient(45deg, #FF9F1C, #FFCD2D)" },
                  }}
                  disabled={adding}
                >
                  {adding ? "Adding..." : "Add"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* -------------------
          EDIT ROOM FORMS
      ------------------- */}
        {editingRoom && (
          <Grid item xs={12} md={6}>
            <Card sx={{
              mb: 4,
              borderRadius: 3,
              background: "linear-gradient(135deg, #1A1F4B, #2E2F6E)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: "#FFCD2D", mb: 0.05, textAlign: "center", fontSize: "30px" }}>
                  Edit Room {editingRoom.id}
                </Typography>

                {/* Edit Form */}
                <Box component="form" onSubmit={updateRoom} sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {/* Room Number */}
                  <TextField
                    label="Room Number"
                    variant="filled"
                    value={editingRoom.room_number}
                    onChange={(e) => setEditingRoom({ ...editingRoom, room_number: e.target.value })}
                    required
                    sx={{ width: "125px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2 }}
                    InputLabelProps={{ sx: { color: "#ccc" } }}
                    InputProps={{ sx: { color: "#fff" } }}
                  />

                  {/* Room Type */}
                  <TextField
                    select
                    label="Room Type"
                    value={editingRoom.type}
                    onChange={(e) => setEditingRoom({ ...editingRoom, type: e.target.value })}
                    sx={{ width: "420px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2 }}
                    InputLabelProps={{ sx: { color: "#ccc" } }}
                    InputProps={{ sx: { color: "#fff" } }}
                  >
                    {["Standard", "Deluxe", "Suite", "Executive", "Family Room", "Twin Room", "King Room", "Presidential Suite", "Studio"].map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </TextField>

                  {/* Tariff */}
                  <TextField
                    label="Tariff (₹)"
                    type="number"
                    variant="filled"
                    value={editingRoom.tariff}
                    onChange={(e) => setEditingRoom({ ...editingRoom, tariff: e.target.value })}
                    required
                    sx={{ width: "125px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2 }}
                    InputLabelProps={{ sx: { color: "#ccc" } }}
                    InputProps={{ sx: { color: "#fff" } }}
                  />

                  {/* Update Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    color="success"
                    sx={{ fontWeight: "bold", mt: "6px", height: "45px" }}
                    disabled={updating}
                  >
                    {updating ? "Updating..." : "Update"}
                  </Button>

                  {/* Cancel Edit Button */}
                  <Button
                    type="button"
                    variant="outlined"
                    color="warning"
                    sx={{ fontWeight: "bold", mt: "6px", height: "45px" }}
                    onClick={() => setEditingRoom(null)}
                  >
                    Cancel
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* -------------------
           ROOMS LIST
      ------------------- */}
      <Grid container spacing={3} justifyContent="center">
        {rooms
          .filter(room =>
            room.room_number.toString().includes(search) &&
            (filterType ? room.type === filterType : true)
          )
          .map(room => (
            <Grid item xs={12} sm={6} md={4} key={room.id}>
              <Card sx={{
                borderRadius: 3,
                background: "linear-gradient(135deg, #1A1F4B, #2E2F6E)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
                transition: "0.3s",
                '&:hover': { transform: "scale(1.03)", boxShadow: "0 12px 25px rgba(255,205,45,0.5)" },
              }}>
                <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {/* Room Details */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <RoomIcon sx={{ color: '#FFCD2D' }} />
                      <Typography variant="subtitle1" sx={{ color: "#ccc" }}>
                        Room {room.room_number} - {room.type}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" fontWeight="bold" color='#ffe386ff' marginLeft="12px">
                        Rs. {room.tariff}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Edit & Delete Buttons */}
                  <Box>
                    <IconButton onClick={() => startEdit(room)} sx={{ color: "#4D96FF", mt: "30px" }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => deleteRoom(room.id)} sx={{ color: "#FF6B6B", mt: "30px" }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
    </div>
  );
}

export default Rooms;
