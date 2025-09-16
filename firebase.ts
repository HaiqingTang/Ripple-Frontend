import { initializeApp, getApps, getApp } from "firebase/app"
import {
  initializeAuth,
  getReactNativePersistence,
  signInAnonymously,
} from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"

const firebaseConfig = {
  apiKey: "AIzaSyAINeU8cF1MGlfS_nnJY4bv7q8WvN_1DJA",
  authDomain: "rp-wombat-ef8e6.firebaseapp.com",
  projectId: "rp-wombat-ef8e6",
  storageBucket: "rp-wombat-ef8e6.firebasestorage.app",
  messagingSenderId: "514390289930",
  appId: "1:514390289930:web:3d19b86edf0db93ae0f9f3"
}

// Avoid repeated application initialization
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Use initializeAuth and specify AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
})

// Firestore
export const db = getFirestore(app)

// Anonymous login helper function
export async function ensureSignedIn() {
  if (!auth.currentUser) {
    await signInAnonymously(auth)
  }
  return auth.currentUser!
}
