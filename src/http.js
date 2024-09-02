// src/http.js
import axios from 'axios';
import router from '@/router';

// Create an instance of axios with the base URL
// baseURL: 'https://virtualrealitycreators.com/sticksavvy/api/admin',  //online
// baseURL: 'http://127.0.0.1:8000/api/admin',  //local
// baseURL: 'https://virtualrealitycreators.com/tieGuy-bakend/api',

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=<calculated when request is sent>',
    'Accept' : 'application/json'
  },
});
  
  // Add a request interceptor to include the auth token in requests
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Add a response interceptor to handle token expiration or other responses
  apiClient.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        // Handle token expiration, e.g., redirect to login page
        localStorage.removeItem('authToken');
        router.push({ name: 'login' }); // Use router instance to redirect
      }
      return Promise.reject(error);
    }
  );
  


export default apiClient;
