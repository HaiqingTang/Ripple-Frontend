// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAINeU8cF1MGlfS_nnJY4bv7q8WvN_1DJA",
  authDomain: "rp-wombat-ef8e6.firebaseapp.com",
  projectId: "rp-wombat-ef8e6",
  storageBucket: "rp-wombat-ef8e6.firebasestorage.app",
  messagingSenderId: "514390289930",
  appId: "1:514390289930:web:3d19b86edf0db93ae0f9f3",
};

// 初始化 App
const app = initializeApp(firebaseConfig);

// 🔑 直接用默认 getAuth（内存持久化）
export const auth = getAuth(app);

// Firestore
export const db = getFirestore(app);

// 匿名登录
export async function ensureSignedIn() {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
  return auth.currentUser!;
}
