import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBnJYVTq-vSZMQhjgVB4mBp9nPFg_3haeE",
  authDomain: "blood-donation-sd.firebaseapp.com",
  projectId: "blood-donation-sd",
  storageBucket: "blood-donation-sd.appspot.com",
  messagingSenderId: "184510140061",
  appId: "1:184510140061:web:7d9c22793069c45eb30e74"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Use default memory cache (no IndexedDB issues in React Native)
const db = initializeFirestore(app, {});

export { auth, db };
