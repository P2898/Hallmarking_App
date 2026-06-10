import { create } from 'zustand';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase.config';

interface AuthStore {
  user: any;
  userProfile: any;
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';
  approvalStatus: 'pending' | 'approved' | 'rejected' | null;
  initAuth: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  userProfile: null,
  authStatus: 'loading',
  approvalStatus: null,

  initAuth: () => {
    onAuthStateChanged(auth, async (user) => {
      console.log('[AuthStore] onAuthStateChanged fired. user:', user?.uid ?? 'null');

      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const profile = docSnap.data();
            console.log('[AuthStore] Profile found. approvalStatus:', profile.status);
            set({
              user,
              userProfile: profile,
              authStatus: 'authenticated',
              approvalStatus: profile.status ?? 'approved',
            });
          } else {
            // No Firestore profile yet (e.g. registration Firestore step failed)
            // Treat as approved so the user can access the app and we recreate the profile later
            console.log('[AuthStore] No Firestore profile found for user. Treating as approved.');
            set({
              user,
              userProfile: null,
              authStatus: 'authenticated',
              approvalStatus: 'approved',
            });
          }
        } catch (error: any) {
          // Firestore read failed (e.g. permission-denied) — still mark as authenticated
          // so the user isn't stuck on the splash/login screen
          console.error('[AuthStore] Firestore getDoc failed:', error.code, error.message);
          set({
            user,
            userProfile: null,
            authStatus: 'authenticated',
            approvalStatus: 'approved',
          });
        }
      } else {
        console.log('[AuthStore] No user — unauthenticated.');
        set({ user: null, userProfile: null, authStatus: 'unauthenticated', approvalStatus: null });
      }
    });
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, userProfile: null, authStatus: 'unauthenticated', approvalStatus: null });
  },
}));
