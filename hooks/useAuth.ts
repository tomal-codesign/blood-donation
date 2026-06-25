// hooks/useAuth.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  roles: string[];
  currentRole: string;
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
  toggleRole: () => void;
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
        if (!user.roles || user.roles.length === 0) {
          user.roles = ['donor'];
          user.currentRole = 'donor';
        }
        if (!user.currentRole) {
          user.currentRole = user.roles[0] || 'donor';
        }
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        set({ token, user, isLoading: false });
        console.log("✅ User logged in:", user.email, "Roles:", user.roles);
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => {
          if (!state.user) return state;
          const updatedUser = { ...state.user, ...userData };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          return { user: updatedUser };
        });
      },

      toggleRole: () => {
        set((state) => {
          if (!state.user) return state;
          
          const currentRole = state.user.currentRole;
          const availableRoles = state.user.roles;
          
          // Find next role (donor -> patient -> donor)
          let nextRole = '';
          if (currentRole === 'donor' && availableRoles.includes('patient')) {
            nextRole = 'patient';
          } else if (currentRole === 'patient' && availableRoles.includes('donor')) {
            nextRole = 'donor';
          } else {
            return state;
          }
          
          const updatedUser = { ...state.user, currentRole: nextRole };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          
          toast.success(`Switched to ${nextRole.charAt(0).toUpperCase() + nextRole.slice(1)} mode`);
          
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
      if (!user.roles || user.roles.length === 0) {
        user.roles = ['donor'];
        user.currentRole = 'donor';
        localStorage.setItem("user", JSON.stringify(user));
      }
      if (!user.currentRole) {
        user.currentRole = user.roles[0];
      }
      console.log("✅ Auth initialized for:", user.email, "Roles:", user.roles);
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