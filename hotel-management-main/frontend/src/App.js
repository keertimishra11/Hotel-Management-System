import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
//
import DashboardSimple from "./components/DashboardSimple";


//


// Import all the pages/components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Rooms from './components/Rooms';
import Navbar from './components/Navbar';
import Bookings from './components/Bookings';
import PrivateRoute from "./components/PrivateRoute";

function App() {
  // State to track login status (initially true if token exists)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  return (
    <BrowserRouter>
      {/* Navbar always visible, passing login state to show/hide links or logout */}
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      {/* Define all routes */}
      <Routes>
        {/* Public Route → Login page */}
        <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
       <Route path="/simple-dashboard" element={<DashboardSimple />} />

        {/* Protected Routes → Only accessible if logged in */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/rooms" element={
          <PrivateRoute>
            <Rooms />
          </PrivateRoute>
        } />
        <Route path="/bookings" element={
          <PrivateRoute>
            <Bookings />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
