import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBNZPnkq1QEJkNMM5PPyFSitVZqZ0lPxGo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "virtual-gyans.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "virtual-gyans",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "virtual-gyans.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "117850250947361567393",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:117850250947361567393:web:virtualgyans",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
