import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { db, auth } from "../../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

/* ---------- Types ---------- */
type Item = {
  id: string;
  title: string;
  icon: string;
  days: number;
  joined: number;
  percent: number;
  reward: string;
  category?: string;
  status?: "active" | "completed";
  checkedToday?: boolean;
};

/* ---------- Constants ---------- */
const BOTTOM_SPACER = 64;
const BLUE = "#DDE7FF";
const DEEP = "#6B7AFF";

const ymd = (d = new Date()) => {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};
const TODAY = ymd();

/* ---------- Component ---------- */
export default function CurrentChallengeList() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [ongoing, setOngoing] = useState<Item[]>([]);
  const [completed, setCompleted] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Subscribe userChallenges ---------- */
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const baseCol = collection(db, "userChallenges", uid, "active");
    const ongoingQ = query(baseCol, where("status", "==", "active"));
    const completedQ = query(baseCol, where("status", "==", "completed"));

    const toCheckedToday = (x: any) => {
      let ok = Array.isArray(x.checkins) && x.checkins.includes?.(TODAY);
      if (!ok && x.lastCheckinAt) {
        try {
          const ts =
            x.lastCheckinAt?.toDate?.() ??
            (x.lastCheckinAt.seconds
              ? new Date(x.lastCheckinAt.seconds * 1000)
              : null);
          if (ts) ok = ymd(ts) === TODAY;
        } catch {}
      }
      return ok;
    };

    const mapActive = (d: any, id: string): Item => {
      const totalDays = Number(d.totalDays ?? d.days ?? 0) || 0;
      const dc = Number(d.daysCompleted ?? 0) || 0;
      const pctFromCounts =
        totalDays > 0
          ? Math.min(100, Math.round((dc / totalDays) * 100))
          : 0;
      const percent =
        typeof d.progress === "number"
          ? Math.min(100, Math.max(0, d.progress))
          : pctFromCounts;

      return {
        id,
        title: d.title || "Untitled Challenge",
        icon: d.icon || "🔥",
        days: totalDays,
        joined: 0, // placeholder, will be updated immediately
        percent,
        reward: "",
        category: d.category || "",
        status: d.status === "completed" ? "completed" : "active",
        checkedToday: toCheckedToday(d),
      };
    };

    // Ongoing real-time retrieval of joined/rewardConfig
    const unsubOngoing = onSnapshot(ongoingQ, async (snap) => {
      const raw = snap.docs.map((docSnap) => mapActive(docSnap.data(), docSnap.id));
      const enriched: Item[] = await Promise.all(
        raw.map(async (it) => {
          if (!it.category || !it.id) return it;
          try {
            const ref = doc(db, "challenges", it.category, "items", it.id);
            const s = await getDoc(ref);
            if (s.exists()) {
              const data = s.data() as any;
              const j = Number(data?.joined ?? 0);
              const name: string =
                typeof data?.rewardConfig?.name === "string"
                  ? data.rewardConfig.name.trim()
                  : "";
              return {
                ...it,
                joined: Number.isFinite(j) ? j : 0,
                reward: name,
              } as Item;
            }
          } catch {}
          return it;
        })
      );
      setOngoing(enriched);
      setLoading(false);
    });

    // Completed real-time retrieval of joined/rewardConfig
    const unsubCompleted = onSnapshot(completedQ, async (snap) => {
      const raw: Item[] = snap.docs.map((docSnap) => {
        const d = docSnap.data() as any;
        return {
          id: docSnap.id,
          title: d.title || "Untitled Challenge",
          icon: d.icon || "🏁",
          days: Number(d.totalDays ?? d.days ?? 0),
          joined: 0,
          percent: 100,
          reward: "",
          category: d.category || "",
          status: "completed",
          checkedToday: toCheckedToday(d),
        };
      });

      const enriched: Item[] = await Promise.all(
        raw.map(async (it) => {
          if (!it.category || !it.id) return it;
          try {
            const ref = doc(db, "challenges", it.category, "items", it.id);
            const s = await getDoc(ref);
            if (s.exists()) {
              const data = s.data() as any;
              const j = Number(data?.joined ?? 0);
              const name: string =
                typeof data?.rewardConfig?.name === "string"
                  ? data.rewardConfig.name.trim()
                  : "";
              return {
                ...it,
                joined: Number.isFinite(j) ? j : 0,
                reward: name, // ✅ 明确 string
              } as Item;
            }
          } catch {}
          return it;
        })
      );
      setCompleted(enriched);
    });

    return () => {
      unsubOngoing();
      unsubCompleted();
    };
  }, []);

  /* ---------- Search ---------- */
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return { ongoing, completed };
    const match = (x: Item) => x.title.toLowerCase().includes(kw);
    return {
      ongoing: ongoing.filter(match),
      completed: completed.filter(match),
    };
  }, [q, ongoing, completed]);

  /* ---------- Navigation ---------- */
  const toCheckin = (c: Item) => {
    router.push({
      pathname: "/Challenge/challengeCheckin",
      params: {
        challengeId: c.id,
        category: c.category,
        title: c.title,
        totalDays: String(c.days),
        joined: String(c.joined),
      },
    });
  };

  const toCompletedDetail = (c: Item) => {
    router.push({
      pathname: "/Challenge/completedChallenge",
      params: {
        challengeId: c.id,
        category: c.category,
        title: c.title,
        totalDays: String(c.days),
        joined: String(c.joined),
      },
    });
  };

  /* ---------- Card Renderer ---------- */
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
          <Ionicons name="people-outline" size={18} color="#000" />
          <Text style={styles.metaTextDark}>{c.joined} joined</Text>
        </View>
      </View>

      <Text style={styles.progressLabel}>Progress</Text>
      <Text style={styles.percentCenter}>{isCompleted ? 100 : c.percent}%</Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${isCompleted ? 100 : c.percent}%` },
          ]}
        />
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
            <Text style={styles.actionText}>
              {c.checkedToday ? "view" : "check in"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  /* ---------- Render ---------- */
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
          <Ionicons
            name="search"
            size={18}
            color="#99A2C0"
            style={{ marginHorizontal: 10 }}
          />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#99A2C0"
            value={q}
            onChangeText={setQ}
            returnKeyType="search"
            style={styles.searchInput}
          />
        </View>

        {/* Content */}
        {loading ? (
          <ActivityIndicator style={{ marginTop: 80 }} color={DEEP} size="large" />
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: BOTTOM_SPACER + 24 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>ongoing</Text>
            {filtered.ongoing.length === 0 ? (
              <Text style={styles.emptyText}>No ongoing challenge</Text>
            ) : (
              filtered.ongoing.map((c) => renderCard(c, false))
            )}

            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>completed</Text>
            {filtered.completed.length === 0 ? (
              <Text style={styles.emptyText}>No completed challenge</Text>
            ) : (
              filtered.completed.map((c) => renderCard(c, true))
            )}

            <View style={{ height: BOTTOM_SPACER }} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BLUE },
  container: { flex: 1, paddingTop: Platform.select({ ios: 54, android: 22 }) },
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
    fontWeight: "600" },
  card: {
    marginHorizontal: 18,
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
  },
  cardTitle: { fontSize: 22, fontWeight: "900", color: "#0F172A" },
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
  progressBar: {
    marginTop: 8,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#CDD6F0",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#86A0FF",
  },
  bottomRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rewardChip: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  rewardText: { color: "#fff", fontWeight: "800" },
  actionBtn: {
    backgroundColor: "#6B7AFF",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  actionText: {
    color: "#fff",
    fontWeight: "800",
    textTransform: "lowercase",
  },
});
