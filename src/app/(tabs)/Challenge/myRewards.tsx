import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Platform,
  ActivityIndicator,
  TextInput,
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
  validUntil: string; // ISO
  value?: string;
  redeemed?: boolean;
  terms?: string[];   // ✅ 新增：支持从 Firestore 读取条款
};

export default function MyRewards() {
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

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
          terms: Array.isArray(d.terms) ? d.terms : undefined,
        });
      });
      setRewards(items);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // filter and grouping
  const { activeList, expiredList } = useMemo(() => {
    const now = new Date().getTime();
    const norm = (s: string) => s.toLowerCase();
    const queryText = norm(q);

    const match = (r: Reward) =>
      !queryText ||
      norm(r.title).includes(queryText) ||
      norm(r.subtitle).includes(queryText) ||
      norm(r.description).includes(queryText);

    const act: Reward[] = [];
    const exp: Reward[] = [];
    for (const r of rewards) {
      if (!match(r)) continue;
      const until = r.validUntil ? new Date(r.validUntil).getTime() : Number.POSITIVE_INFINITY;
      const isExpired = r.redeemed === true || until < now;
      (isExpired ? exp : act).push(r);
    }
    return { activeList: act, expiredList: exp };
  }, [rewards, q]);

  // back button
  const goBackToIndex = () => {
    router.replace("/(tabs)/Challenge"); // ✅ 去掉 /index，避免 TS 报错
  };

  const renderCard = (r: Reward, faded?: boolean) => (
    <Pressable
      key={r.id}
      style={[styles.card, faded && { opacity: 0.6 }]}
      onPress={() =>
        router.push({
          pathname: "/(tabs)/Challenge/rewardDetail",
          params: {
            id: r.id,
            title: r.title,
            subtitle: r.subtitle,
            description: r.description,
            logoUri: r.logoUri,          
            validUntil: r.validUntil,
            value: r.value ?? "",
            terms: r.terms ? JSON.stringify(r.terms) : undefined,
          },
        })
      }
    >
      <View style={styles.row}>
        <Image source={{ uri: r.logoUri }} style={styles.logo} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{r.title}</Text>
          {r.subtitle ? <Text style={styles.subtitle}>{r.subtitle}</Text> : null}
          {r.validUntil ? (
            <Text style={styles.valid}>
              Valid until{" "}
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
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.headerRow}>
        <Pressable hitSlop={10} onPress={goBackToIndex}>
          <Ionicons name="chevron-back" size={24} color="#6B7AFF" />
        </Pressable>
        <Text style={styles.headerTitle}>My rewards</Text>
        <View style={{ width: 24, height: 24 }} />
      </View>

      {/* search bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#6B7AFF" />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#9CA3AF"
          value={q}
          onChangeText={setQ}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} color="#6B7AFF" size="large" />
      ) : (activeList.length + expiredList.length) === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="sparkles-outline" size={60} color="#A0A0A0" />
          <Text style={styles.emptyText}>No rewards yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Active */}
          <Text style={styles.sectionTitle}>
            Active ({activeList.length})
          </Text>
          {activeList.map((r) => renderCard(r, false))}

          {/* Expired */}
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
            Expired ({expiredList.length})
          </Text>
          {expiredList.map((r) => renderCard(r, true))}
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

  // search
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#111827",
    paddingVertical: 2,
  },

  sectionTitle: {
    marginTop: 14,
    marginBottom: 6,
    marginHorizontal: 18,
    fontSize: 18,
    fontWeight: "900",
    color: "#3A56C0",
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
