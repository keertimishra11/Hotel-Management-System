// Component: Navbar
// Purpose: Displays the top navigation bar with links to Dashboard, Rooms, Bookings, and Login/Logout functionality

import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const location = useLocation(); // Tracks current route for active link highlighting
  const navigate = useNavigate(); // Used to programmatically navigate after logout

  // Removes JWT token and role from localStorage, updates login state, redirects to login page
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/"); // Redirect to login page
  };

  // Navigation items to display when user is logged in
  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Rooms", path: "/rooms" },
    { name: "Bookings", path: "/bookings" },
  ];

  // -------------------
  // RENDER UI
  // -------------------

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(135deg, #0C0F2C 0%, #1A1F4B 100%)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.7)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Navbar Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            letterSpacing: 1,
            color: "#FFCD2D",
            fontSize: "2.5vw",
          }}
        >
          Hotel Management
        </Typography>

        {/* Navigation links container */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {isLoggedIn ? (
            <>
              {/* Map through navItems and create a Button for each */}
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  component={Link} // Use react-router Link for SPA navigation
                  to={item.path}
                  sx={{
                    color: location.pathname === item.path ? "#FFCD2D" : "#fff",
                    fontWeight: location.pathname === item.path ? "bold" : "normal",
                    "&:hover": {
                      color: "#FF9F1C",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderRadius: 2,
                    },
                    transition: "0.3s",
                  }}
                >
                  {item.name}
                </Button>
              ))}

              {/* Logout button */}
              <Button
                onClick={handleLogout}
                sx={{
                  width: "85px",
                  backgroundColor: "#FFCD2D",
                  color: "#0C0F2C",
                  fontWeight: "bold",
                  borderRadius: "20px",
                  px: 3,
                  boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
                  "&:hover": {
                    backgroundColor: "#FF9F1C",
                    color: "#fff",
                  },
                  transition: "0.3s",
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            /* Login button for unauthenticated users */
            <Button
              component={Link}
              to="/" // Redirect to login page
              sx={{
                color: location.pathname === "/" ? "#FFCD2D" : "#fff",
                fontWeight: location.pathname === "/" ? "bold" : "normal",
                "&:hover": {
                  color: "#FF9F1C",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 2,
                },
                transition: "0.3s",
              }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
