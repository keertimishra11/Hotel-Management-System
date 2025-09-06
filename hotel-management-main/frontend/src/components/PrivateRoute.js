// PrivateRoute component ensures that only authenticated users can access certain routes

import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  // Check for authentication token in localStorage
  const token = localStorage.getItem("token");

  // If no token is found → user is not logged in
  // Redirect them to the login page
  if (!token) {
    return <Navigate to="/" replace />; 
  }

  // If token exists → user is authenticated
  // Render the children components (protected route)
  return children;
}

export default PrivateRoute;
