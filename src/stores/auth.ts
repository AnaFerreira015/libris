import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  email: string;
  name: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      login: (email) => {
        const token = `libris.${btoa(email)}.${Date.now()}`;
        const name = email.split("@")[0];
        set({ token, user: { email, name } });
      },
      logout: () => set({ token: null, user: null }),
      isAuthenticated: () => Boolean(get().token),
    }),
    { name: "libris.auth" },
  ),
);
