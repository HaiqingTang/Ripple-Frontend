import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { db, auth } from "../../../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

type Reward = {
  id: string;
  title: string;
  subtitle: string;
  logoUri: string;
  description: string;
  validUntil: string;
  value?: string;
  redeemed?: boolean;
};

export default function MyRewards() {
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const ref = collection(db, "users", uid, "rewards");
    const qRef = query(ref, orderBy("issuedAt", "desc"));
    const unsub = onSnapshot(qRef, (snap) => {
      const items: Reward[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data() as any;
        items.push({
          id: docSnap.id,
          title: d.title || "Untitled Reward",
          subtitle: d.subtitle || "",
          logoUri:
            d.logoUri ||
            "https://cdn-icons-png.flaticon.com/512/1047/1047711.png",
          description: d.description || "",
          validUntil: d.validUntil || "",
          value: d.value || "",
          redeemed: d.redeemed || false,
        });
      });
      setRewards(items);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable hitSlop={10} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#6B7AFF" />
        </Pressable>
        <Text style={styles.headerTitle}>My Rewards</Text>
        <Ionicons name="gift-outline" size={26} color="#6B7AFF" />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} color="#6B7AFF" size="large" />
      ) : rewards.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="sparkles-outline" size={60} color="#A0A0A0" />
          <Text style={styles.emptyText}>No rewards yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {rewards.map((r) => (
            <View key={r.id} style={[styles.card, r.redeemed && { opacity: 0.6 }]}>
              <View style={styles.row}>
                <Image source={{ uri: r.logoUri }} style={styles.logo} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{r.title}</Text>
                  {r.subtitle ? <Text style={styles.subtitle}>{r.subtitle}</Text> : null}
                  {r.validUntil ? (
                    <Text style={styles.valid}>
                      Valid until:{" "}
                      {new Date(r.validUntil).toLocaleDateString("en-AU")}
                    </Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward-outline" size={20} color="#6B7AFF" />
              </View>

              {r.description ? (
                <Text style={styles.desc} numberOfLines={2}>
                  {r.description}
                </Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const BLUE = "#DDE7FF";
const DEEP = "#6B7AFF";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLUE,
    paddingTop: Platform.select({ ios: 54, android: 22 }),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: DEEP,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
  },
  emptyText: { color: "#777", marginTop: 12, fontWeight: "600" },
  card: {
    backgroundColor: "#EEF3FF",
    marginHorizontal: 18,
    marginVertical: 10,
    borderRadius: 20,
    padding: 18,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: { width: 60, height: 60, borderRadius: 12, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "800", color: DEEP },
  subtitle: { color: "#64748b", marginTop: 2 },
  valid: { color: "#1f2937", marginTop: 4, fontWeight: "600" },
  desc: {
    marginTop: 8,
    color: "#374151",
    lineHeight: 18,
    fontSize: 14,
  },
});
