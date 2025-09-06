import axios from 'axios';

// Create a pre-configured axios instance
const API = axios.create({
  baseURL: 'http://localhost:5000/api', 
});

// Interceptor to attach token for protected routes
API.interceptors.request.use((req) => {

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // If token exists, attach it to the request headers
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  // Return modified request
  return req;
});

export default API;
