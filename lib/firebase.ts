import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FB_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FB_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FB_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FB_STORAGE_BUCKET!,
  appId: process.env.EXPO_PUBLIC_FB_APP_ID!,
  measurementId: process.env.EXPO_PUBLIC_FB_MEASUREMENT_ID!,
};

// ---- App 单例
function ensureApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}
const app = ensureApp();

// ---- Auth 单例（RN 上优先持久化；失败时回退到内存，不会崩）
let auth: Auth;

if (Platform.OS === "ios" || Platform.OS === "android") {
  // 先尝试复用已存在实例（热更/重复导入场景）
  try {
    auth = getAuth(app);
    // @ts-ignore 检测是否已设置持久化（有的历史实例可能没有）
    const hasPersistence = !!(auth as any)?._persistenceManager;

    if (!hasPersistence) {
      let getReactNativePersistence: any = null;

      // ❗️用动态字符串避免 Metro 静态解析失败
      try {
        // 等价于 require("firebase/auth/react-native")
        const rnAuth = require("firebase/auth" + "/react-native");
        getReactNativePersistence = rnAuth.getReactNativePersistence;
      } catch {
        // 留空，回退到内存持久化
      }

      if (getReactNativePersistence) {
        // 只有在没有实例或未设置持久化时才初始化；否则重复 initializeAuth 会抛错
        auth = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
      } // else: 继续用内存持久化的 auth
    }
  } catch {
    // 项目内还不存在 auth 实例，尝试带持久化初始化
    let getReactNativePersistence: any = null;
    try {
      const rnAuth = require("firebase/auth" + "/react-native");
      getReactNativePersistence = rnAuth.getReactNativePersistence;
    } catch {
      // ignore
    }

    if (getReactNativePersistence) {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } else {
      // 最保守回退：内存持久化，不会阻断运行
      auth = getAuth(app);
      console.warn(
        "[firebase] RN 持久化入口未找到，已回退为内存持久化（会话间不会自动保持登录）。" +
          "可执行 `npx expo install firebase` 升级以启用持久化。"
      );
    }
  }
} else {
  // Web
  auth = getAuth(app);
}

const db: Firestore = getFirestore(app);
export { app, auth, db };
