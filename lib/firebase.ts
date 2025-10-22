import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  setPersistence,
  browserLocalPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// ==================== Firebase Config ====================
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FB_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FB_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FB_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FB_STORAGE_BUCKET!,
  appId: process.env.EXPO_PUBLIC_FB_APP_ID!,
  measurementId: process.env.EXPO_PUBLIC_FB_MEASUREMENT_ID!,
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const rnAsyncStoragePersistenceShim = {
  type: "LOCAL",
  async _isAvailable() {
    try {
      const key = "__fb_avail_test__";
      await AsyncStorage.setItem(key, "1");
      await AsyncStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
  async _set(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },
  async _get(key: string) {
    const v = await AsyncStorage.getItem(key);
    return v ?? null;
  },
  async _remove(key: string) {
    await AsyncStorage.removeItem(key);
  },
} as any;

let auth: Auth;

if (Platform.OS === "web") {
  // --- Web ---
  auth = getAuth(app);
  void setPersistence(auth, browserLocalPersistence);
} else {
  // --- RN env ---
  let getReactNativePersistence: any = null;

  try {
    const mod = require("firebase/auth");
    getReactNativePersistence = mod.getReactNativePersistence;
  } catch {}
  if (!getReactNativePersistence) {
    try {
      const mod = require("firebase/auth" + "/react-native");
      getReactNativePersistence = mod.getReactNativePersistence;
    } catch {}
  }

  try {
    if (getReactNativePersistence) {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } else {
      auth = initializeAuth(app, {
        persistence: rnAsyncStoragePersistenceShim,
      });
      console.warn(
        "[firebase] did not find 'firebase/auth/react-native'，use AsyncStorage Shim instead。"
      );
    }
  } catch (e) {
    try {
      auth = getAuth(app);
    } finally {
      console.warn("[firebase] initializeAuth is skipped: Old instance already exists (memory persistence)");
      console.warn(new Error("who-created-auth-first").stack);
    }
  }
}

const db: Firestore = getFirestore(app);

console.log(
  "[auth persistence]",
  Platform.OS,
  (auth as any)?._persistenceManager ? "PERSISTED" : "MEMORY"
);

export { app, auth, db };
