// app/_layout.tsx  —— 仅新增这十几行
import { useEffect, useState } from "react";
import { Slot } from "expo-router";
import { ensureSignedIn } from "../../../firebase";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try { await ensureSignedIn(); } finally { setReady(true); }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return <Slot />;
}
