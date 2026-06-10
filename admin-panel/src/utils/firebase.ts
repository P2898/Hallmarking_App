import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBMhPdxUXDvo9dxxhQ8dUFClejI5iMzjVI",
  authDomain: "hallmarkhub-3a4c9.firebaseapp.com",
  projectId: "hallmarkhub-3a4c9",
  storageBucket: "hallmarkhub-3a4c9.firebasestorage.app",
  messagingSenderId: "427576221201",
  appId: "1:427576221201:web:362ac60afd1711b0e35bb0"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
