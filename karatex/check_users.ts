import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listUsers() {
  console.log("Fetching users from Firestore project:", firebaseConfig.projectId);
  const snapshot = await getDocs(collection(db, 'users'));
  console.log(`Found ${snapshot.size} users:`);
  snapshot.forEach(doc => {
    console.log(doc.id, "=>", doc.data().email, "| status:", doc.data().status);
  });
  process.exit(0);
}

listUsers().catch(console.error);
