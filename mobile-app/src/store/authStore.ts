import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  role: 'user' | 'admin';
}

interface AuthStore {
  user: UserProfile | null;
  userProfile: UserProfile | null;
  token: string | null;
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';
  approvalStatus: 'pending' | 'approved' | 'rejected' | null;
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  userProfile: null,
  token: null,
  authStatus: 'loading',
  approvalStatus: null,

  initAuth: async () => {
    try {
      console.log('[AuthStore] Initializing authentication...');
      const token = await AsyncStorage.getItem('auth_token');
      
      if (!token) {
        console.log('[AuthStore] No local token found.');
        set({ user: null, userProfile: null, token: null, authStatus: 'unauthenticated', approvalStatus: null });
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[AuthStore] Authentication successful. User:', data.user.email);
        set({
          user: data.user,
          userProfile: data.user,
          token,
          authStatus: 'authenticated',
          // Since the server doesn't explicitly restrict pending users yet, default to approved
          // or we can map it accordingly
          approvalStatus: 'approved', 
        });
      } else {
        console.log('[AuthStore] Token validation failed. Status:', response.status);
        await AsyncStorage.removeItem('auth_token');
        set({ user: null, userProfile: null, token: null, authStatus: 'unauthenticated', approvalStatus: null });
      }
    } catch (error) {
      console.error('[AuthStore] Failed to initialize authentication:', error);
      set({ user: null, userProfile: null, token: null, authStatus: 'unauthenticated', approvalStatus: null });
    }
  },

  login: async (email, password) => {
    console.log('[AuthStore] Logging in...');
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    await AsyncStorage.setItem('auth_token', data.token);
    set({
      user: data.user,
      userProfile: data.user,
      token: data.token,
      authStatus: 'authenticated',
      approvalStatus: 'approved',
    });
  },

  register: async (formData) => {
    console.log('[AuthStore] Registering user...');
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        displayName: formData.fullName,
        phoneNumber: formData.phoneNumber || null,
        companyName: formData.companyName,
        userType: formData.userType,
        city: formData.city,
        state: formData.state,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    // Do not automatically log the user in; require manual login instead
  },

  logout: async () => {
    console.log('[AuthStore] Logging out...');
    await AsyncStorage.removeItem('auth_token');
    set({ user: null, userProfile: null, token: null, authStatus: 'unauthenticated', approvalStatus: null });
  },

  forgotPassword: async (email) => {
    console.log('[AuthStore] Requesting password reset...');
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Password reset failed');
    }
  },

  updateProfile: async (dataToUpdate) => {
    const token = get().token;
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(dataToUpdate),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update profile');
    }

    set({
      user: data,
      userProfile: data,
    });
  },
}));
