import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Auth state — currently supports guest mode only.
 * When Supabase is wired up, replace isAuthenticated with a real
 * session object from supabase.auth.getSession().
 */
interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  continueAsGuest: () => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isGuest: false,
      continueAsGuest: () => set({ isGuest: true }),
      signOut: () => set({ isAuthenticated: false, isGuest: false }),
    }),
    {
      name: 'memory-orbs-auth',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
