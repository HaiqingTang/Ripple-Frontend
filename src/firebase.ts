import { Platform } from "react-native";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, setPersistence, browserLocalPersistence, type Auth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "rp-wombat-ef8e6.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

let auth: Auth;

if (Platform.OS === "web") {
  // Web：持久化到浏览器
  auth = getAuth(app);
  void setPersistence(auth, browserLocalPersistence);
} else {
  // 原生：仅在运行时动态加载，避免 TS/打包器对不存在导出报错
  let initializeAuthRN: any;
  let getReactNativePersistence: any;

  try {
    // 优先从主入口尝试（新版可能有）
    ({ initializeAuth: initializeAuthRN, getReactNativePersistence } = require("firebase/auth"));
  } catch {}

  if (!initializeAuthRN || !getReactNativePersistence) {
    try {
      // 再兜底到子入口（部分版本在这里）
      ({ initializeAuth: initializeAuthRN, getReactNativePersistence } =
        require("firebase/auth/react-native"));
    } catch {}
  }

  if (initializeAuthRN && getReactNativePersistence) {
    try {
      auth = initializeAuthRN(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      auth = getAuth(app); // 热重载等场景兜底
    }
  } else {
    auth = getAuth(app);   // 万一还是没拿到，也保证不崩溃
  }
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
