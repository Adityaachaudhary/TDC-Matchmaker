import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Matchmaker, Profile } from '../types';

interface AppState {
  token: string | null;
  matchmaker: Matchmaker | null;
  selectedCustomer: Profile | null;
  sidebarOpen: boolean;
  setAuth: (token: string, matchmaker: Matchmaker) => void;
  clearAuth: () => void;
  setSelectedCustomer: (customer: Profile | null) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      matchmaker: null,
      selectedCustomer: null,
      sidebarOpen: true,

      setAuth: (token, matchmaker) => set({ token, matchmaker }),
      clearAuth: () => set({ token: null, matchmaker: null, selectedCustomer: null }),
      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'tdc-auth',
      partialize: (state) => ({ token: state.token, matchmaker: state.matchmaker }),
    }
  )
);
