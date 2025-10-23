import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, AppState } from "react-native";
import { collection, onSnapshot, query, where, updateDoc, doc, limit /*, orderBy*/ } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

export default function NotificationsBar() {
  const [uid, setUid] = React.useState<string | null>(auth.currentUser?.uid ?? null);
  const [notif, setNotif] = React.useState<{ id: string; title?: string } | null>(null);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return unsub;
  }, []);

  React.useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active" && uid) {
        setUid((x) => (x ? `${x}` : null));
      }
    });
    return () => sub.remove();
  }, [uid]);

  React.useEffect(() => {
    if (!uid) { setNotif(null); return; }
    const qref = query(
      collection(db, "users", uid, "notifications"),
      where("read", "==", false),
      where("type", "==", "MEETUP_DELETED"),
      // orderBy("canceledAt", "desc"),
      limit(1)
    );

    const unsub = onSnapshot(
      qref,
      (snap) => {
        if (snap.empty) { setNotif(null); return; }
        const d = snap.docs[0];
        const data = d.data() as any;
        setNotif({ id: d.id, title: data?.title });
      },
      (err) => {
        if (__DEV__) console.warn("[Notifications] listen error:", err);
      }
    );
    return unsub;
  }, [uid]);

  if (!notif) return null;

  const markRead = async () => {
    if (!uid) return;
    await updateDoc(doc(db, "users", uid, "notifications", notif.id), { read: true });
    setNotif(null);
  };

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="alert-circle" size={20} color="#fff" />
          <Text style={styles.text} numberOfLines={2}>
            Meetup Deleted：{notif.title ?? "(Untitled)"}
          </Text>
        </View>
        <TouchableOpacity onPress={markRead} style={styles.btn}>
          <Text style={styles.btnText}>Got it</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", zIndex: 1000 },
  card: {
    maxWidth: 520, marginHorizontal: 24, backgroundColor: "#2c3e50", borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12, rowGap: 10,
    shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  text: { color: "#fff", flexShrink: 1, fontSize: 15 },
  btn: { alignSelf: "flex-end", paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#6aa8ff", borderRadius: 8 },
  btnText: { color: "#fff", fontWeight: "700" },
});
