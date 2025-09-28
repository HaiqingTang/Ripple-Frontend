import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAINeU8cF1MGlfS_nnJY4bv7q8WvN_1DJA",
  authDomain: "rp-wombat-ef8e6.firebaseapp.com",
  projectId: "rp-wombat-ef8e6",
  storageBucket: "rp-wombat-ef8e6.firebasestorage.app",
  messagingSenderId: "514390289930",
  appId: "1:514390289930:web:3d19b86edf0db93ae0f9f3"
}

const app = initializeApp(firebaseConfig);

// Don't need to re-login every time
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
