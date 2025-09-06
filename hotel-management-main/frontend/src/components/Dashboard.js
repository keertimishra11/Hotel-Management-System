// Component: Dashboard
// Purpose: Displays admin statistics, occupancy, revenue, bookings, and allows exporting booking logs

import React, { useEffect, useState } from 'react';
import API from '../services/api';
import BookingsList from "./BookingsList";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import CountUp from 'react-countup';

// Icons
import RoomIcon from '@mui/icons-material/MeetingRoom';
import BookIcon from '@mui/icons-material/AssignmentTurnedIn';
import PaymentIcon from '@mui/icons-material/Payment';
import PieChartIcon from '@mui/icons-material/PieChart';
import DownloadIcon from '@mui/icons-material/Download';

function Dashboard() {
  // stats: stores fetched statistics from backend
  const [stats, setStats] = useState({});
  // loading: indicates if API call is in progress
  const [loading, setLoading] = useState(true);
  // error: stores error message if API fails
  const [error, setError] = useState(null);

  // Fetch stats from backend on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/admin/stats'); // GET request to fetch dashboard stats
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch stats"); // Display error if fetch fails
      } finally {
        setLoading(false); // Hide loading spinner once request completes
      }
    };
    fetchStats();
  }, []);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
        <Typography ml={2}>Loading stats...</Typography>
      </Box>
    );
  }

  // Show error if API call fails
  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Calculate occupancy percentage
  const occupancyRate =
    stats.totalRooms > 0
      ? ((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(1)
      : 0;

  // Data for dashboard cards
  const statCards = [
    {
      title: 'Total Rooms',
      value: stats.totalRooms,
      icon: <RoomIcon sx={{ fontSize: 40, color: '#FFCD2D' }} />,
    },
    {
      title: 'Occupied Rooms',
      value: stats.occupiedRooms,
      icon: <RoomIcon sx={{ fontSize: 40, color: '#FF6B6B' }} />,
    },
    {
      title: 'Available Rooms',
      value: stats.availableRooms,
      icon: <RoomIcon sx={{ fontSize: 40, color: '#6BCB77' }} />,
    },
    {
      title: 'Occupancy Rate',
      value: Number(occupancyRate),
      isPercentage: true,
      icon: <PieChartIcon sx={{ fontSize: 40, color: '#FFD93D' }} />,
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: <BookIcon sx={{ fontSize: 40, color: '#4D96FF' }} />,
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue}`,
      icon: <PaymentIcon sx={{ fontSize: 40, color: '#FF9F1C' }} />,
    },
  ];

  // Function to download booking logs in Excel sheet
  const downloadFile = async (type) => {
    try {
      const token = localStorage.getItem("token"); // Get JWT for authorization
      const res = await fetch(`${API.defaults.baseURL}/bookings/export/${type}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob(); // Convert response to Blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = type === "csv" ? "bookings.csv" : "bookings.xlsx";
      document.body.appendChild(link);
      link.click(); // Trigger download
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to download file."); // Alert user if download fails
    }
  };

  // -------------------
  // RENDER UI
  // -------------------

  return (
    <div
      style={{
        padding: '30px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0C0F2C 0%, #1A1F4B 100%)',
      }}
    >
      {/* Dashboard Heading */}
      <Box textAlign="center" mb={8}>
        <Typography
          variant="h4"
          sx={{ color: '#FFCD2D', fontWeight: 'bold' }}
        >
          Admin Dashboard
        </Typography>
        <Box
          sx={{
            width: 80,
            height: 4,
            backgroundColor: '#FFCD2D',
            borderRadius: 2,
            margin: '10px auto 0',
          }}
        />
      </Box>

      {/* First Row of Stat Cards */}
      <Grid container spacing={3} justifyContent="center" sx={{ mb: 2.5 }}>
        {statCards.slice(0, 3).map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                minWidth: 220,
                height: 100,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #1A1F4B, #2E2F6E)',
                color: '#fff',
                boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
                transition: '0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 12px 25px rgba(255,205,45,0.5)',
                },
              }}
            >
              {/* Card content: icon + value */}
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {stat.icon}
                <div>
                  <Typography variant="subtitle1" sx={{ color: '#ccc', mb: "3px" }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" mb={3}>
                    {stat.title === "Total Revenue" ? (
                      <CountUp
                        end={Number(stat.value.replace(/[^\d]/g, ""))}
                        duration={1.5}
                        prefix="₹"
                        separator=","
                      />
                    ) : stat.isPercentage ? (
                      <CountUp end={stat.value} duration={1.5} suffix="%" />
                    ) : typeof stat.value === "number" ? (
                      <CountUp end={stat.value} duration={1.5} separator="," />
                    ) : (
                      stat.value
                    )}
                  </Typography>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Second Row of Stat Cards */}
      <Grid container spacing={3} justifyContent="center" sx={{ mb: 2.5 }}>
        {statCards.slice(3).map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                minWidth: 220,
                height: 100,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #1A1F4B, #2E2F6E)',
                color: '#fff',
                boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
                transition: '0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 12px 25px rgba(255,205,45,0.5)',
                },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {stat.icon}
                <div>
                  <Typography variant="subtitle1" sx={{ color: '#ccc', mb: "3px" }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stat.title === "Total Revenue" ? (
                      <CountUp
                        end={Number(stat.value.replace(/[^\d]/g, ""))}
                        duration={1.5}
                        prefix="₹ "
                        separator=","
                      />
                    ) : stat.isPercentage ? (
                      <CountUp end={stat.value} duration={1.5} suffix="%" />
                    ) : typeof stat.value === "number" ? (
                      <CountUp end={stat.value} duration={1.5} separator="," />
                    ) : (
                      stat.value
                    )}
                  </Typography>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Export Booking Logs */}
      <Grid container justifyContent="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              minWidth: 220,
              height: 100,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
              color: '#fff',
              boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
              transition: '0.3s',
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 12px 25px rgba(76,175,80,0.6)',
              },
            }}
            onClick={() => downloadFile("excel")}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DownloadIcon sx={{ fontSize: 40, color: '#fff' }} />
              <div>
                <Typography variant="subtitle1" sx={{ color: '#ccc', mb: 1}}>
                  Booking Logs
                </Typography>
                <Typography variant="h5" fontWeight="bold" ml={0.6}>
                  Export
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Bookings Section */}
      <Box mt={5}>
        <BookingsList /> 
      </Box>

    </div>
  );
}

export default Dashboard;
