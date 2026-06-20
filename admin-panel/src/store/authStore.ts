import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface AuthState {
  isAuthenticated: boolean;
  adminEmail: string | null;
  token: string | null;
  error: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // Check if session exists in localStorage
  const savedToken = localStorage.getItem('mx_admin_token');
  const savedEmail = localStorage.getItem('mx_admin_email');

  return {
    isAuthenticated: !!savedToken,
    adminEmail: savedEmail,
    token: savedToken,
    error: null,
    login: async (email, pass) => {
      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          set({ error: data.error || 'Login failed' });
          return false;
        }

        // Verify the user is an admin
        if (data.user.role !== 'admin') {
          set({ error: 'Access denied: Admin privileges required.' });
          return false;
        }

        localStorage.setItem('mx_admin_token', data.token);
        localStorage.setItem('mx_admin_email', data.user.email);
        set({ isAuthenticated: true, adminEmail: data.user.email, token: data.token, error: null });
        return true;
      } catch (error: any) {
        set({ error: 'Failed to connect to backend: ' + error.message });
        return false;
      }
    },
    logout: async () => {
      localStorage.removeItem('mx_admin_token');
      localStorage.removeItem('mx_admin_email');
      set({ isAuthenticated: false, adminEmail: null, token: null, error: null });
    }
  };
});
