import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  setSession: (session: Session | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  clearAuth: () => set({ user: null, session: null }),
}));

// Helper to get role from user metadata
export function getUserRole(user: User | null): "user" | "admin" {
  return (user?.user_metadata?.role as "user" | "admin") ?? "user";
}
