import { Slot } from "expo-router";
import { AppProvider } from "@/context/AppContext";
import NotificationsBar from "@/components/NotificationsBar";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import React from "react";

export default function Root() {
  const [uid, setUid] = React.useState<string | null>(auth.currentUser?.uid ?? null);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return unsub;
  }, []);

  return (
    <AppProvider>
      <Slot />
      {uid && <NotificationsBar key={uid} />}
    </AppProvider>
  );
}
