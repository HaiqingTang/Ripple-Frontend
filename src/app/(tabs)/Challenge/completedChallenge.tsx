import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { auth, db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";

const BG = "#CFE0FF";
const CARD = "#FFFFFF";
const LEMON = "#FFF7C8";
const LEMON_BADGE = "#F5E266";
const TEXT_DARK = "#1F2937";
const TEXT_BLUE = "#6A8DE6";
const TEXT_BLUE_DEEP = "#3C5BD6";
const BLUE_TRACK = "#C7D4F7";
const BLUE_PROGRESS = "#6A99F0";

const SHADOW =
  Platform.OS === "ios"
    ? {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      }
    : { elevation: 3 };

type DayCell = { day: number | null; isSelected: boolean };

function buildMonth(year: number, monthIndex0: number, marked: Set<number>): DayCell[] {
  const first = new Date(year, monthIndex0, 1);
  const firstWeekday = first.getDay();
  const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();
  const cells: DayCell[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ day: null, isSelected: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, isSelected: marked.has(d) });
  return cells;
}

type ActiveDoc = {
  title?: string;
  totalDays?: number;
  checkins?: string[];
  joined?: number;
};

export default function CompletedChallenge() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ challengeId?: string; dateISO?: string; title?: string; totalDays?: string; joined?: string }>();

  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ActiveDoc | null>(null);

  // 展示月份：默认用完成日期或今天
  const completedDate = params.dateISO ? new Date(params.dateISO) : new Date();
  const [viewYear] = useState(completedDate.getFullYear());
  const [viewMonth] = useState(completedDate.getMonth()); // 0-11

  // 读用户参与记录
  useEffect(() => {
    (async () => {
      const uid = auth.currentUser?.uid;
      const challengeId = (typeof params.challengeId === "string" && params.challengeId.trim()) ? params.challengeId : null;

      if (!uid || !challengeId) {
        // 没登录/没 id → 走静态 fallback
        setActive({
          title: params.title || "Daily 10k steps",
          totalDays: Math.max(1, Number(params.totalDays ?? 20) || 20),
          checkins: [completedDate.toISOString().slice(0,10)], // 至少点亮完成当天
          joined: Math.max(0, Number(params.joined ?? 0) || 0),
        });
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "userChallenges", uid, "active", challengeId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setActive(snap.data() as ActiveDoc);
        } else {
          setActive({
            title: params.title || "Daily 10k steps",
            totalDays: Math.max(1, Number(params.totalDays ?? 20) || 20),
            checkins: [completedDate.toISOString().slice(0,10)],
            joined: Math.max(0, Number(params.joined ?? 0) || 0),
          });
        }
      } catch (e: any) {
        console.error("load completed error:", e);
        Alert.alert("Error", e?.message || "Failed to load check-ins.");
        setActive({
          title: params.title || "Daily 10k steps",
          totalDays: Math.max(1, Number(params.totalDays ?? 20) || 20),
          checkins: [completedDate.toISOString().slice(0,10)],
          joined: Math.max(0, Number(params.joined ?? 0) || 0),
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 计算当月高亮
  const markedDays = useMemo(() => {
    const set = new Set<number>();
    const arr = active?.checkins || [];
    for (const s of arr) {
      const d = new Date(s);
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        set.add(d.getDate());
      }
    }
    if (set.size === 0 && completedDate.getFullYear() === viewYear && completedDate.getMonth() === viewMonth) {
      set.add(completedDate.getDate());
    }
    return set;
  }, [active?.checkins, viewYear, viewMonth]);

  const monthCells = useMemo(() => buildMonth(viewYear, viewMonth, markedDays), [viewYear, viewMonth, markedDays]);

  const monthTitle = useMemo(() => {
    try {
      const dtf = new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric" });
      return dtf.format(new Date(viewYear, viewMonth, 1));
    } catch {
      const m = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      return `${m[viewMonth]} ${viewYear}`;
    }
  }, [viewYear, viewMonth]);

  const handleBack = () => {
    try {
      // @ts-ignore
      if (router.canGoBack?.()) router.back();
      else router.replace("/(tabs)/Challenge");
    } catch {
      router.replace("/(tabs)/Challenge");
    }
  };

  const title = active?.title || params.title || "Daily 10k steps";
  const totalDays = Math.max(1, Number(active?.totalDays ?? params.totalDays ?? 20) || 20);
  const completedCount = (active?.checkins || []).length || 1; // 避免 0/0
  const progressPctRaw = Math.round((completedCount / totalDays) * 100);
  const progressPct = isFinite(progressPctRaw) ? Math.min(100, Math.max(0, progressPctRaw)) : 100;
  const joined = Math.max(0, Number(active?.joined ?? params.joined ?? 0) || 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: TEXT_BLUE }}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      {/* 头部 */}
      <View style={styles.headerBar}>
        <Pressable onPress={handleBack} hitSlop={10} style={styles.backBtn} android_ripple={{ color: "#dfe7ff", borderless: true }}>
          <Ionicons name="chevron-back" size={28} color={TEXT_BLUE} />
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>completed challenge</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 完成卡 */}
        <View style={[styles.cardSoft, SHADOW]}>
          <View style={styles.rowBetween}>
            <Text style={styles.titleBold}>{title}</Text>
          </View>

          <View style={[styles.rowBetween, { marginTop: 8 }]}>
            <View style={styles.rowCenter}>
              <Ionicons name="time-outline" size={18} color={TEXT_DARK} />
              <Text style={styles.metaText}>{totalDays} days</Text>
            </View>
            <View style={styles.rowCenter}>
              <Ionicons name="people-outline" size={18} color={TEXT_DARK} />
              <Text style={styles.metaText}>{joined} joined</Text>
            </View>
          </View>

          <Text style={[styles.smallBold, { marginTop: 12 }]}>Progress</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressPct}>{progressPct}%</Text>
          <Text style={[styles.small, { marginTop: 6 }]}>
            {Math.max(0, totalDays - completedCount)} day{totalDays - completedCount === 1 ? "" : "s"} remaining
          </Text>

          <View style={styles.congratsBox}>
            <Text style={styles.congrats}>CONGRATULATIONS!</Text>
            <Text style={styles.congratsSub}>you have completed{`\n`}the challenge!</Text>
          </View>
        </View>

        {/* 奖励卡（示例） */}
        <View style={[styles.rewardCard, SHADOW]}>
          <Text style={styles.rewardTitle}>Reward: Premium Meditation App</Text>
          <Text style={[styles.small, { marginTop: 8 }]}>3-month subscription to premium meditation app</Text>
          <View style={styles.rewardRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>$3 value</Text></View>
            <View style={styles.illus} />
          </View>
        </View>

        {/* 日历 */}
        <View style={[styles.calendarCard, SHADOW]}>
          <Text style={styles.monthTitle}>{monthTitle}</Text>

          <View style={styles.weekRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
              <Text key={w} style={styles.weekText}>{w}</Text>
            ))}
          </View>

          <View style={styles.grid}>
            {monthCells.map((c, idx) => (
              <View key={idx} style={styles.cell}>
                {c.day ? (
                  <View style={[styles.dayBubble, c.isSelected && styles.dayBubbleSelected]}>
                    <Text style={[styles.dayText, c.isSelected && { color: "#fff" }]}>{c.day}</Text>
                  </View>
                ) : (
                  <View style={{ height: 28 }} />
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  headerBar: {
    height: 72,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22 },
  rightPlaceholder: { width: 44, height: 44 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 24, fontWeight: "900", color: TEXT_BLUE, textTransform: "lowercase" },
  scroll: { flex: 1, paddingHorizontal: 16 },
  cardSoft: { backgroundColor: "#EAF7EF", borderRadius: 16, padding: 16, marginTop: 8 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowCenter: { flexDirection: "row", alignItems: "center", gap: 6 },
  titleBold: { color: TEXT_DARK, fontWeight: "800", fontSize: 18 },
  metaText: { color: TEXT_DARK, marginLeft: 6 },
  smallBold: { color: TEXT_DARK, fontWeight: "700" },
  small: { color: TEXT_DARK, fontSize: 14 },
  progressTrack: { height: 10, backgroundColor: BLUE_TRACK, borderRadius: 999, marginTop: 8 },
  progressBar: { height: 10, backgroundColor: BLUE_PROGRESS, borderRadius: 999 },
  progressPct: { color: TEXT_DARK, fontWeight: "700", marginTop: 6 },
  congratsBox: { marginTop: 12, borderRadius: 14, backgroundColor: "#F2F7FF", paddingHorizontal: 16, paddingVertical: 20 },
  congrats: { fontSize: 26, fontWeight: "900", letterSpacing: 1.2, color: TEXT_BLUE },
  congratsSub: { marginTop: 6, color: TEXT_DARK, fontWeight: "600" },
  rewardCard: { backgroundColor: LEMON, borderRadius: 16, padding: 16, marginTop: 14 },
  rewardTitle: { color: TEXT_DARK, fontWeight: "800", fontSize: 16 },
  rewardRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  badge: { backgroundColor: LEMON_BADGE, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontWeight: "700", color: TEXT_DARK },
  illus: { flex: 1, height: 70, borderRadius: 12, backgroundColor: "#EAEFFF", marginLeft: 12 },
  calendarCard: { backgroundColor: CARD, borderRadius: 12, padding: 16, marginTop: 14 },
  monthTitle: { fontSize: 18, fontWeight: "800", color: TEXT_DARK, marginTop: 6 },
  weekRow: { flexDirection: "row", alignItems: "center", marginTop: 8, paddingHorizontal: 4 },
  weekText: { flexBasis: "14.2857%", maxWidth: "14.2857%", textAlign: "center", color: TEXT_DARK, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, paddingHorizontal: 4 },
  cell: { flexBasis: "14.2857%", maxWidth: "14.2857%", alignItems: "center", paddingVertical: 8 },
  dayBubble: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  dayBubbleSelected: { backgroundColor: TEXT_BLUE_DEEP },
  dayText: { color: TEXT_DARK, fontWeight: "700" },
});
