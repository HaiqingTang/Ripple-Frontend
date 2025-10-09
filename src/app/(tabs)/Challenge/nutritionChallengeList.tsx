import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { db, auth } from "../../../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

type Challenge = {
  id: string;
  title: string;
  desc: string;
  days: number;
  joined: number;
  reward: string;
  cover: string;
  category: string;
};

export default function NutritionChallengeList() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const category = (params.category || "nutrition").toLowerCase();

  const [q, setQ] = useState("");
  const [list, setList] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);

  // 🔹 Fetch user's joined challenges
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const ref = collection(db, "userChallenges", uid, "active");
    return onSnapshot(ref, (snap) => {
      const arr: string[] = [];
      snap.forEach((d) => arr.push(d.id));
      setJoinedIds(arr);
    });
  }, []);

  // 🔹 Fetch challenge list from Firestore
  useEffect(() => {
    const ref = collection(db, "challenges", category, "items");
    const qRef = query(ref, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(qRef, (snap) => {
      const arr: Challenge[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data() as any;
        arr.push({
          id: docSnap.id,
          title: d.title || "Untitled Challenge",
          desc: d.desc || "",
          days: d.days || 0,
          joined: d.joined || 0,
          reward: d.rewardConfig?.name || d.reward || "",
          cover:
            d.rewardConfig?.logoUri ||
            d.cover ||
            "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=800&auto=format&fit=crop",
          category: d.category || category,
        });
      });
      setList(arr);
      setLoading(false);
    });

    return () => unsub();
  }, [category]);

  // 🔹 Search filter
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return list;
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(kw) ||
        c.desc.toLowerCase().includes(kw) ||
        c.reward.toLowerCase().includes(kw)
    );
  }, [q, list]);

  // 🔹 Open detail page
  const openDetail = (c: Challenge) => {
    router.push({
      pathname: "/Challenge/challengeDetail",
      params: { challengeId: c.id, title: c.title, category: c.category },
    } as any);
  };

  // 🔹 Create new challenge (dev only)
  const createNew = () => {
    router.push("/Challenge/createChallenge");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable hitSlop={10} style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#6B7AFF" />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {category.charAt(0).toUpperCase() + category.slice(1)} challenge
          </Text>
          <Text style={styles.subtitle}>Healthy plate, healthier you</Text>
        </View>

        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&q=80&auto=format&fit=crop",
          }}
          style={styles.avatar}
        />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#99A2C0" style={{ marginHorizontal: 10 }} />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#99A2C0"
          value={q}
          onChangeText={setQ}
          returnKeyType="search"
          style={styles.searchInput}
        />
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} color="#6B7AFF" size="large" />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {filtered.map((c) => {
            const isJoined = joinedIds.includes(c.id);
            return (
              <View key={c.id} style={styles.card}>
                <Text style={styles.cardTitle}>{c.title}</Text>

                <View style={styles.rowTop}>
                  <View style={styles.leftCol}>
                    <Text style={styles.cardDesc}>{c.desc}</Text>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={18} color="#000" />
                        <Text style={styles.metaText}>{c.days} days</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="person-outline" size={18} color="#000" />
                        <Text style={styles.metaText}>{c.joined} joined</Text>
                      </View>
                    </View>

                    <View style={styles.rewardChip}>
                      <View style={styles.rewardDot} />
                      <Text style={styles.rewardText}>{c.reward}</Text>
                    </View>
                  </View>

                  <Image source={{ uri: c.cover }} style={styles.cover} />
                </View>

                {isJoined ? (
                  <Pressable
                    style={[styles.viewBtn, { backgroundColor: "#3C7BD6" }]}
                    onPress={() =>
                      router.push({
                        pathname: "/Challenge/challengeCheckin",
                        params: { challengeId: c.id, category: c.category },
                      } as any)
                    }
                  >
                    <Text style={styles.viewBtnText}>continue</Text>
                  </Pressable>
                ) : (
                  <Pressable style={styles.viewBtn} onPress={() => openDetail(c)}>
                    <Text style={styles.viewBtnText}>view</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* New */}
      <Pressable onPress={createNew} style={styles.fab} accessibilityRole="button">
        <Ionicons name="add" size={40} color="#fff" />
      </Pressable>
    </View>
  );
}

/* ---------- Styles ---------- */
const BLUE = "#DDE7FF";
const DEEP = "#6B7AFF";
const GREEN = "#59C34A";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLUE,
    paddingTop: Platform.select({ ios: 54, android: 22 }),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: DEEP,
    textAlign: "left",
  },
  subtitle: { color: "#7B8BBB", marginTop: 4, fontWeight: "600" },
  avatar: { width: 52, height: 52, borderRadius: 12, marginLeft: 8 },
  searchWrap: {
    marginHorizontal: 18,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 14,
  },
  searchInput: { flex: 1, height: "100%", fontSize: 16, color: "#223" },
  card: {
    marginHorizontal: 18,
    marginVertical: 10,
    backgroundColor: "#EEF3FF",
    borderRadius: 20,
    padding: 18,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: DEEP,
    textAlign: "center",
    marginBottom: 10,
  },
  rowTop: { flexDirection: "row", alignItems: "center" },
  leftCol: { flex: 1, paddingRight: 12 },
  cardDesc: { color: "#4C5A7A", lineHeight: 20, textAlign: "left" },
  metaRow: {
    marginTop: 10,
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 28,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: "#000", fontWeight: "600" },
  rewardChip: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  rewardDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#F6B95B" },
  rewardText: { color: "#DA6464", fontWeight: "700" },
  cover: { width: 92, height: 92, borderRadius: 20, marginLeft: 8 },
  viewBtn: {
    alignSelf: "center",
    marginTop: 14,
    backgroundColor: GREEN,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 20,
  },
  viewBtnText: { color: "#fff", fontWeight: "800", textTransform: "lowercase" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 90,
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: DEEP,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
