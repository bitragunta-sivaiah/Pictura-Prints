// api/apiClient.js

import axios from "axios";
 
const getToken = () => localStorage.getItem('userToken');

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json', // Set default content type to JSON
  }
});

// Request interceptor to add authorization token if available
API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle potential errors globally
 

 

export default API