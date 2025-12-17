import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Replace with your actual Firebase project configuration
// You can get this from the Firebase Console -> Project Settings -> General
export const firebaseConfig = {
  apiKey: "AIzaSyCu0iYRIonhfKhLHmvsZKcR_toNyfidlQU",
  authDomain: "restobill-163f8.firebaseapp.com",
  projectId: "restobill-163f8",
  storageBucket: "restobill-163f8.firebasestorage.app",
  messagingSenderId: "952335235960",
  appId: "1:952335235960:web:6ba1329edfaa2a3919a68d",
  measurementId: "G-DRZM5C6ECN"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);