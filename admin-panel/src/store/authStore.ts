import { create } from 'zustand';
import { auth } from '../utils/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

interface AuthState {
  isAuthenticated: boolean;
  adminEmail: string | null;
  error: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // Check if session exists in localStorage
  const savedAuth = localStorage.getItem('mx_admin_auth');
  const savedEmail = localStorage.getItem('mx_admin_email');

  return {
    isAuthenticated: savedAuth === 'true',
    adminEmail: savedEmail,
    error: null,
    login: async (email, pass) => {
      const validEmail = localStorage.getItem('mx_valid_email') || 'Waqar@nchgroup.in';
      const validPass = localStorage.getItem('mx_valid_pass') || 'nch@waqar21';

      if (email === validEmail && pass === validPass) {
        try {
          // Attempt to sign in first
          await signInWithEmailAndPassword(auth, email, pass);
          localStorage.setItem('mx_admin_auth', 'true');
          localStorage.setItem('mx_admin_email', email);
          set({ isAuthenticated: true, adminEmail: email, error: null });
          return true;
        } catch (error: any) {
          // If the user doesn't exist yet, we can create it on the fly
          // because we already verified the hardcoded credentials above.
          try {
            await createUserWithEmailAndPassword(auth, email, pass);
            localStorage.setItem('mx_admin_auth', 'true');
            localStorage.setItem('mx_admin_email', email);
            set({ isAuthenticated: true, adminEmail: email, error: null });
            return true;
          } catch (createError: any) {
            set({ error: 'Failed to authenticate with Firebase: ' + createError.message });
            return false;
          }
        }
      } else {
        set({ error: 'Invalid username or password.' });
        return false;
      }
    },
    logout: async () => {
      try {
        await signOut(auth);
      } catch (e) {
        console.error(e);
      }
      localStorage.removeItem('mx_admin_auth');
      localStorage.removeItem('mx_admin_email');
      set({ isAuthenticated: false, adminEmail: null, error: null });
    }
  };
});
