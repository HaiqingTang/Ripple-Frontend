import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ 新增
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Item = {
  id: string;
  title: string;
  icon: string;
  days: number;
  joined: number;
  percent: number;
  reward: string;
};

const MOCK_ONGOING: Item[] = [
  { id: "10k-steps", title: "Daily 10k steps", icon: "💪", days: 20, joined: 123, percent: 20, reward: "protein powder discount" },
  { id: "meditation", title: "Daily Meditation", icon: "🧘", days: 30, joined: 114, percent: 60, reward: "Luxury Massage coupon" },
  { id: "sketch", title: "Daily Sketch Challenge", icon: "🎨", days: 10, joined: 514, percent: 10, reward: "" },
];

const MOCK_COMPLETED: Item[] = [
  { id: "reading-30m", title: "Read 30 Minutes Daily", icon: "📚", days: 30, joined: 666, percent: 100, reward: "Premium Meditation App (3 months)" },
  { id: "hydrate", title: "Drink 2L Water", icon: "💧", days: 14, joined: 245, percent: 100, reward: "Stainless Bottle 10% off" },
];

const BOTTOM_SPACER = 64; // ✅ 预留底部空间

export default function CurrentChallengeList() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const { ongoing, completed } = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return { ongoing: MOCK_ONGOING, completed: MOCK_COMPLETED };
    const match = (x: Item) => x.title.toLowerCase().includes(kw);
    return { ongoing: MOCK_ONGOING.filter(match), completed: MOCK_COMPLETED.filter(match) };
  }, [q]);

  const toCheckin = (c: Item) => {
    router.push({ pathname: "/Challenge/challengeCheckin", params: { id: c.id, title: c.title } });
  };
  const toCompletedDetail = (c: Item) => {
    const dateISO = new Date().toISOString();
    router.push({
      pathname: "/Challenge/completedChallenge",
      params: { id: c.id, title: c.title, totalDays: String(c.days), joined: String(c.joined), dateISO },
    });
  };

  const renderCard = (c: Item, isCompleted: boolean) => (
    <View key={`${isCompleted ? "done-" : "go-"}${c.id}`} style={styles.card}>
      <Text style={styles.cardTitle}>
        <Text style={{ fontSize: 22 }}>{c.icon} </Text>
        {c.title}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={18} color="#000" />
          <Text style={styles.metaTextDark}>{c.days} days</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={18} color="#000" />
          <Text style={styles.metaTextDark}>{c.joined} joined</Text>
        </View>
      </View>

      <Text style={styles.progressLabel}>Progress</Text>
      <Text style={styles.percentCenter}>{isCompleted ? 100 : c.percent}%</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${isCompleted ? 100 : c.percent}%` }]} />
      </View>

      <View style={styles.bottomRow}>
        {c.reward ? (
          <View style={styles.rewardChip}>
            <Text style={styles.rewardText}>{c.reward}</Text>
          </View>
        ) : (
          <View />
        )}

        {isCompleted ? (
          <Pressable
            style={[styles.actionBtn, { backgroundColor: "#16A34A" }]}
            onPress={() => toCompletedDetail(c)}
            android_ripple={{ color: "#D1FAE5" }}
          >
            <Text style={styles.actionText}>view</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.actionBtn}
            onPress={() => toCheckin(c)}
            android_ripple={{ color: "#E0E7FF" }}
          >
            <Text style={styles.actionText}>check in</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable hitSlop={10} style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#6B7AFF" />
          </Pressable>
          <Text style={styles.title}>My challenges</Text>
          <View style={{ width: 24 }} />
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
        <ScrollView
          contentContainerStyle={{ paddingBottom: BOTTOM_SPACER + 24 }} // ✅ 强制底部留白
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>ongoing</Text>
          {ongoing.length === 0 ? (
            <Text style={styles.emptyText}>No ongoing challenge</Text>
          ) : (
            ongoing.map((c) => renderCard(c, false))
          )}

          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>completed</Text>
          {completed.length === 0 ? (
            <Text style={styles.emptyText}>No completed challenge</Text>
          ) : (
            completed.map((c) => renderCard(c, true))
          )}

          <View style={{ height: BOTTOM_SPACER }} /> {/* ✅ Spacer 双保险 */}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const BLUE = "#DDE7FF";
const DEEP = "#6B7AFF";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BLUE }, // ✅ SafeAreaView 背景
  container: {
    flex: 1,
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
    flex: 1,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "900",
    color: DEEP,
  },

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

  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1B1C24",
    marginLeft: 18,
    marginBottom: 8,
  },

  emptyText: {
    marginHorizontal: 18,
    marginTop: 4,
    color: "#334155",
    fontWeight: "600",
  },

  card: {
    marginHorizontal: 18,
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 22,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaTextDark: { color: "#000", fontWeight: "600" },

  progressLabel: { marginTop: 14, color: "#111827", fontWeight: "800" },
  percentCenter: { marginTop: 6, fontWeight: "700", color: "#111827" },
  progressBar: { marginTop: 8, height: 12, borderRadius: 999, backgroundColor: "#CDD6F0" },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: "#86A0FF" },

  bottomRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rewardChip: { backgroundColor: "#4F46E5", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  rewardText: { color: "#fff", fontWeight: "800" },

  actionBtn: { backgroundColor: "#6B7AFF", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 },
  actionText: { color: "#fff", fontWeight: "800", textTransform: "lowercase" },
});

