import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * =====================================================
 * FIREBASE CONFIG – SAFE FOR GITHUB + VERCEL
 * =====================================================
 */

const firebaseConfig = {
  VITE_FIREBASE_API_KEY=AIzaSyBkiKQBrYNz9YVR56waGOtDbXtQSl8Jl7I
VITE_FIREBASE_AUTH_DOMAIN=grampanchayatchikhali-8a314.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=grampanchayatchikhali-8a314
VITE_FIREBASE_STORAGE_BUCKET=grampanchayatchikhali-8a314.firebasestorage.com
VITE_FIREBASE_MESSAGING_SENDER_ID=627147233902
VITE_FIREBASE_APP_ID=1:627147233902:web:473219f2d4c2630da3a47f
};

export const isConfigured = () =>
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
