import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { matrixLogin, matrixLogout, restoreSession } from '../matrix/auth';

interface AuthState {
  userId: string | null;
  accessToken: string | null;
  serverUrl: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (serverUrl: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
     (set, get) => ({
      userId: null,
      accessToken: null,
      serverUrl: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (serverUrl, username, password) => {
        set({ isLoading: true, error: null });
        try {
          const { userId, accessToken } = await matrixLogin({ baseUrl: serverUrl, username, password });
          
          // On successful login, update state
          set({
            userId,
            accessToken,
            serverUrl,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Giriş başarısız',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await matrixLogout();
          set({
            userId: null,
            accessToken: null,
            serverUrl: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Çıkış hatası',
            isLoading: false,
          });
          throw error;
        }
      },

       restore: async () => {
        set({ isLoading: true });
        try {
          const { serverUrl, userId } = get();
          const restored = await restoreSession(serverUrl || undefined, userId || undefined);
          if (restored) {
            // TODO: Initialize client with stored token
            set({
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch {
          set({ isLoading: false });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'neo-auth',
      partialize: (state) => ({
        userId: state.userId,
        serverUrl: state.serverUrl,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);