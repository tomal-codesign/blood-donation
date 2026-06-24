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
  is_available?: boolean;
  total_donations?: number;
  last_donation_date?: string;
  location_lat?: number;
  location_lng?: number;
  address?: string;
  registration_number?: string;
  blood_bank_license?: string;
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
  updateUser: (userData: Partial<User>) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
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
          user.role = "donor";
        }
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        set({ token, user, isLoading: false });

        console.log("✅ User logged in:", user.email, "Role:", user.role);
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => {
          if (!state.user) return state;
          const updatedUser = { ...state.user, ...userData };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          return { user: updatedUser };
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

// Initialize auth state from localStorage on app load
if (typeof window !== "undefined") {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");
  if (token && userData) {
    try {
      const user = JSON.parse(userData);
      if (!user.role) {
        console.warn("Stored user missing role, setting default:", user);
        user.role = "donor";
        localStorage.setItem("user", JSON.stringify(user));
      }
      console.log("✅ Auth initialized for:", user.email, "Role:", user.role);
      useAuth.getState().setToken(token);
      useAuth.getState().setUser(user);
      useAuth.getState().setLoading(false);
    } catch (error) {
      console.error("❌ Error parsing user data:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      useAuth.getState().setLoading(false);
    }
  } else {
    useAuth.getState().setLoading(false);
  }
}