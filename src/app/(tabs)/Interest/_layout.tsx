// app/(tabs)/Interest/_layout.tsx
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { auth } from "../../../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

const DEV_EMAIL = "1624701945@qq.com"; 
const DEV_PASSWORD = "Password123";     

// Ensure we are signed in before rendering any Interest pages
async function ensureSignedIn() {
  if (auth.currentUser) return; // already signed in
  try {
    await signInWithEmailAndPassword(auth, DEV_EMAIL, DEV_PASSWORD);
  } catch (err: any) {
    const code = String(err?.code || "");
    if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
      await createUserWithEmailAndPassword(auth, DEV_EMAIL, DEV_PASSWORD);
    } else {
      console.log("ensureSignedIn error:", err);
    }
  }
}

export default function InterestLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await ensureSignedIn();
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Close the native header for all screens under (tabs)/Interest
  return <Stack screenOptions={{ headerShown: false }} />;
}
