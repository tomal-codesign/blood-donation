// hooks/useAuth.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  role: "donor" | "patient" | "hospital" | "admin";
  full_name: string;
  phone: string;
  city: string;
  blood_group?: string;
  location_lat?: number;
  location_lng?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  login: (token: string, user: User) => void;
}

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  token: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isLoading: false });
  },
  login: (token: string, user: User) => {
    // Validate user has role
    if (!user.role) {
      console.error("Login: User role is missing!", user);
      user.role = "donor"; // Default fallback
    }
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user, isLoading: false });

    // Force a small delay to ensure state is updated
    setTimeout(() => {
      const storedUser = localStorage.getItem("user");
      console.log("Verified stored user:", JSON.parse(storedUser || "{}"));
    }, 100);
  },
}));

// Initialize auth state from localStorage on app load
if (typeof window !== "undefined") {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");
  if (token && userData) {
    try {
      const user = JSON.parse(userData);
      // Ensure user has role
      if (!user.role) {
        console.error("Stored user missing role:", user);
        user.role = "donor"; // Default fallback
        // Update localStorage with fixed user
        localStorage.setItem("user", JSON.stringify(user));
      }
      console.log("Initialized user:", user);
      useAuth.getState().setToken(token);
      useAuth.getState().setUser(user);
      useAuth.getState().setLoading(false);
    } catch (error) {
      console.error("Error parsing user data:", error);
      useAuth.getState().setLoading(false);
    }
  } else {
    useAuth.getState().setLoading(false);
  }
}
