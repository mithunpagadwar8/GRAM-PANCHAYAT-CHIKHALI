import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Configured with Live Credentials provided by user
const firebaseConfig = {
  apiKey: "AIzaSyBkiKQBrYNz9YVR56waGOtDbXtQSl8Jl7I",
  authDomain: "grampanchayatchikhali-8a314.firebaseapp.com",
  projectId: "grampanchayatchikhali-8a314",
  storageBucket: "grampanchayatchikhali-8a314.firebasestorage.com",
  messagingSenderId: "627147233902",
  appId: "1:627147233902:web:473219f2d4c2630da3a47f",
  measurementId: "G-TWDRPV484T"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
