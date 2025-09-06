// Component: Login
// Purpose: Handles admin/staff login and signup with form validation, authentication via API, and redirects to Dashboard

import React, { useState, useEffect } from 'react';
import API from '../services/api'; // Axios instance for API calls
import { useNavigate } from 'react-router-dom'; // For programmatic navigation
import { Box, Card, CardContent, Typography, TextField, Button, MenuItem } from '@mui/material';

function Login({ setIsLoggedIn }) {

  // STATE VARIABLES
  const [name, setName] = useState(""); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [confirmPassword, setConfirmPassword] = useState(''); // Confirm password input (signup only)
  const [role, setRole] = useState('admin'); // User role selector (admin/staff)
  const [isSignup, setIsSignup] = useState(false); // Toggle between login and signup
  const navigate = useNavigate(); // Navigation hook

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  
  // HANDLERS
  
  // Login handler: authenticate user and store token/role
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      setIsLoggedIn(true);
      navigate("/dashboard"); // Redirect after login
    } catch (err) {
      alert(err.response?.data?.message || "Invalid login");
    }
  };

  // Signup handler: register new user, auto-login, and store token/role
  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await API.post('/auth/register', { name, email, password, role });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      setIsLoggedIn(true);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  // -------------------
  // RENDER UI
  // -------------------

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0C0F2C 0%, #1A1F4B 100%)', 
      }}
    >
      <Card
        sx={{
          width: 450,
          maxWidth: '90vw',
          borderRadius: 3,
          boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
          background: 'linear-gradient(135deg, #1A1F4B, #2E2F6E)', 
          color: '#fff',
          p: 3
        }}
      >
        <CardContent>
          {/* Form title */}
          <Typography variant="h5" gutterBottom textAlign="center" sx={{ fontWeight: 'bold', mb: 3 }}>
            {isSignup ? "SIGN-UP AS ADMIN/STAFF" : "LOG-IN AS ADMIN/STAFF"}
          </Typography>

          {/* Login/Signup Form */}
          <form onSubmit={isSignup ? handleSignup : handleLogin}>
            {/* Name input (signup only) */}
            {isSignup && (
              <TextField
                fullWidth
                type="text"
                label="Name"
                variant="filled"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
                required
                InputProps={{ sx: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, color: '#fff' } }}
                InputLabelProps={{ sx: { color: '#ccc' } }}
              />
            )}

            {/* Email input */}
            <TextField
              fullWidth
              type="email"
              label="Email"
              variant="filled"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              InputProps={{ sx: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#ccc' } }}
            />

            {/* Password input */}
            <TextField
              fullWidth
              type="password"
              label="Password"
              variant="filled"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              InputProps={{ sx: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#ccc' } }}
            />

            {/* Confirm Password input (signup only) */}
            {isSignup && (
              <TextField
                fullWidth
                type="password"
                label="Confirm Password"
                variant="filled"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                required
                InputProps={{ sx: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, color: '#fff' } }}
                InputLabelProps={{ sx: { color: '#ccc' } }}
              />
            )}

            {/* Role selector (signup only) */}
            {isSignup && (
              <TextField
                select
                fullWidth
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                margin="normal"
                required
                InputProps={{ sx: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, color: '#fff' } }}
                InputLabelProps={{ sx: { color: '#ccc' } }}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
              </TextField>
            )}

            {/* Submit button */}
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                mt: 3,
                py: 1.5,
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #FFCD2D, #FF9F1C)',
                color: '#0C0F2C',
                boxShadow: '0 4px 15px rgba(255,205,45,0.5)',
                '&:hover': { background: 'linear-gradient(45deg, #FF9F1C, #FFCD2D)', boxShadow: '0 6px 20px rgba(255,205,45,0.7)' },
              }}
            >
              {isSignup ? "Sign Up" : "Login"}
            </Button>
          </form>

          {/* Toggle login/signup link */}
          <Typography textAlign="center" sx={{ mt: 2, fontSize: 14 }}>
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <Button onClick={() => setIsSignup(!isSignup)} sx={{ color: "#FFCD2D", fontWeight: "bold", textTransform: "none" }}>
              {isSignup ? "Login here" : "Sign up here"}
            </Button>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;
