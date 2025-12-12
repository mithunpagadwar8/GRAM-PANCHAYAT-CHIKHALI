import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// -------------------------------
//  🚀 LIVE PRODUCTION FIREBASE CONFIG
// -------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyBkiKQBrYNz9YVR56waGOtDbXtQSl8Jl7I",
  authDomain: "grampanchayatchikhali-8a314.firebaseapp.com",
  projectId: "grampanchayatchikhali-8a314",

  // ✅ FIXED: correct storage bucket
  storageBucket: "grampanchayatchikhali-8a314.appspot.com",

  messagingSenderId: "627147233902",
  appId: "1:627147233902:web:473219f2d4c2630da3a47f",
  measurementId: "G-TWDRPV484T"
};

// -------------------------------
//  🚀 INITIALIZE FIREBASE
// -------------------------------
const app = initializeApp(firebaseConfig);

// Analytics (safe mode for adblock browsers)
let analytics;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Analytics disabled (Adblock or unsupported environment)");
}

// -------------------------------
//  🚀 EXPORT SERVICES
// -------------------------------
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// -------------------------------
//  🚀 CONFIG CHECK
// -------------------------------
export const isConfigured = () => true;
