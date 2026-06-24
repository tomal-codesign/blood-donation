// lib/api.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth APIs
export const authAPI = {
  register: (data: any) => api.post("/api/auth/register", data),
  login: (data: any) => api.post("/api/auth/login", data),
};

// Donor APIs
export const donorAPI = {
  getProfile: (userId: string) =>
    api.get(`/api/donors/profile?user_id=${userId}`),
  updateProfile: (data: any) => api.put("/api/donors/profile", data),
  toggleAvailability: (data: any) =>
    api.patch("/api/donors/availability", data),
  getStats: (userId: string) => api.get(`/api/donors/stats?user_id=${userId}`),
  getHistory: (userId: string) =>
    api.get(`/api/donors/history?user_id=${userId}`),
  getUpcoming: (userId: string) =>
    api.get(`/api/donors/upcoming?user_id=${userId}`),
  markDonated: (data: any) => api.post("/api/donors/donate", data),
};

export default api;
