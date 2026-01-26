// API Configuration
export const API_BASE_URL = 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  // Admin
  ADMIN_LOGIN: '/admin/login',
  ADMIN_STATS: '/admin/stats',
  
  // Users
  GET_USERS: '/admin/users',
  GET_USER: '/admin/users',
  DELETE_USER: '/admin/users',
  
  // Posts
  GET_POSTS: '/posts',
  DELETE_POST: '/posts',
  
  // Eco Locations
  GET_ECO_LOCATIONS: '/eco-locations',
  CREATE_ECO_LOCATION: '/eco-locations',
  UPDATE_ECO_LOCATION: '/eco-locations',
  DELETE_ECO_LOCATION: '/eco-locations',
};
