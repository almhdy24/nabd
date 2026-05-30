import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCO9ODZDF10jPoEEBdkuBerulX54CumMFc",
  authDomain: "com-almhdy24-nabd.firebaseapp.com",
  projectId: "com-almhdy24-nabd",
  storageBucket: "com-almhdy24-nabd.firebasestorage.app",
  messagingSenderId: "106015853692",
  appId: "1:106015853692:web:fb69444c1d1eba8dda0df9"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Use default memory cache (no IndexedDB issues in React Native)
const db = initializeFirestore(app, {});

export { auth, db };
