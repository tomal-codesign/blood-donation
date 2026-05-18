// hooks/useAuth.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
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
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);

// Initialize from localStorage on client side
if (typeof window !== "undefined") {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (token && user) {
    useAuth.getState().setToken(token);
    useAuth.getState().setUser(JSON.parse(user));
  }
}
