import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert, Image } from "react-native";
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

type RewardConfig = {
  name?: string;
  vendor?: string;
  value?: string;
  description?: string;
  validUntil?: string;
  logoUri?: string;
};

type ActiveDoc = {
  title?: string;
  totalDays?: number;
  checkins?: string[];
  joined?: number;
  rewardConfig?: RewardConfig;
  rewardIssued?: boolean;
  category?: string;
};

export default function CompletedChallenge() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ challengeId?: string; dateISO?: string; title?: string; totalDays?: string; joined?: string; category?: string }>();

  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ActiveDoc | null>(null);

  // make completedDate/year/month reactive so we can set them after reading Firestore
  const initialCompletedDate = params.dateISO ? new Date(params.dateISO) : new Date();
  const [completedDate, setCompletedDate] = useState<Date>(initialCompletedDate);
  const [viewYear, setViewYear] = useState<number>(initialCompletedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialCompletedDate.getMonth()); // 0-11

  // Read user participation records + rewardConfig (fallback to public)
  useEffect(() => {
    (async () => {
      const uid = auth.currentUser?.uid;
      const challengeId = (typeof params.challengeId === "string" && params.challengeId.trim()) ? params.challengeId : null;
      const category = typeof params.category === "string" ? params.category : undefined;

      const fallbackActive: ActiveDoc = {
        title: params.title || "Daily 10k steps",
        totalDays: Math.max(1, Number(params.totalDays ?? 20) || 20),
        checkins: [initialCompletedDate.toISOString().slice(0,10)], // at least mark the completion day
        joined: Math.max(0, Number(params.joined ?? 0) || 0),
        category,
      };

      if (!uid || !challengeId) {
        setActive(fallbackActive);
        //Even if you are not logged in/have no ID, use parameter passing or today as perfectDate
        setCompletedDate(initialCompletedDate);
        setViewYear(initialCompletedDate.getFullYear());
        setViewMonth(initialCompletedDate.getMonth());
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "userChallenges", uid, "active", challengeId);
        const snap = await getDoc(ref);
        let base: ActiveDoc = snap.exists() ? (snap.data() as ActiveDoc) : fallbackActive;

        // If no rewardConfig on active, read from public challenge
        if (!base.rewardConfig && category) {
          const pubRef = doc(db, "challenges", category, "items", challengeId);
          const pubSnap = await getDoc(pubRef);
          if (pubSnap.exists()) {
            const rc = (pubSnap.data() as any)?.rewardConfig;
            if (rc) base = { ...base, rewardConfig: rc, category };
          }
        }

        setActive(base);

        // Decide completed date:
        // 1) If router passed dateISO, prefer it
        // 2) Else, derive from last check-in
        // 3) Else, fallback to today
        try {
          if (params.dateISO) {
            const d = new Date(params.dateISO as string);
            setCompletedDate(d);
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
          } else {
            const lastISO = Array.isArray(base.checkins) ? [...base.checkins].sort().pop() : undefined;
            const d = lastISO ? new Date(lastISO) : new Date();
            setCompletedDate(d);
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
          }
        } catch {
          setCompletedDate(initialCompletedDate);
          setViewYear(initialCompletedDate.getFullYear());
          setViewMonth(initialCompletedDate.getMonth());
        }
      } catch (e: any) {
        console.error("load completed error:", e);
        Alert.alert("Error", e?.message || "Failed to load check-ins.");
        setActive(fallbackActive);
        setCompletedDate(initialCompletedDate);
        setViewYear(initialCompletedDate.getFullYear());
        setViewMonth(initialCompletedDate.getMonth());
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate highlights for the month
  const markedDays = useMemo(() => {
    const set = new Set<number>();
    const arr = active?.checkins || [];
    for (const s of arr) {
      const d = new Date(s);
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        set.add(d.getDate());
      }
    }
    // If none in this month, at least highlight completedDate if it is in this month
    if (set.size === 0 && completedDate.getFullYear() === viewYear && completedDate.getMonth() === viewMonth) {
      set.add(completedDate.getDate());
    }
    return set;
  }, [active?.checkins, viewYear, viewMonth, completedDate]);

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
  const completedCount = (active?.checkins || []).length || 1;
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

  const rc = active?.rewardConfig;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      {/* Header */}
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
        {/* Completion Card */}
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

        {/* Reward Card (actual) */}
        {rc && (
          <View style={[styles.rewardCard, SHADOW]}>
            <Text style={styles.rewardTitle}>{rc.name || "Reward"}</Text>
            {!!rc.description && (
              <Text style={[styles.small, { marginTop: 8 }]}>{rc.description}</Text>
            )}
            <View style={styles.rewardRow}>
              {!!rc.value && (
                <View style={styles.badge}><Text style={styles.badgeText}>{rc.value}</Text></View>
              )}
              {rc.logoUri ? (
                <Image
                  source={{ uri: rc.logoUri }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.illus} />
              )}
            </View>
            {!!rc.vendor && (
              <Text style={[styles.small, { marginTop: 8 }]}>{rc.vendor}</Text>
            )}
            {!!rc.validUntil && (
              <Text style={[styles.small, { marginTop: 4 }]}>Valid until {rc.validUntil}</Text>
            )}
          </View>
        )}

        {/* Calendar */}
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
  logo: { flex: 1, height: 70, borderRadius: 12, marginLeft: 12 }, // <- image placeholder size

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
