import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

// 颜色
const BG = "#CFE0FF";
const CARD = "#FFFFFF";
const LEMON = "#FFF7C8";
const LEMON_BADGE = "#F5E266";
const TEXT_DARK = "#1F2937";
const TEXT_BLUE = "#6A8DE6";
const TEXT_BLUE_DEEP = "#3C5BD6";
const BLUE_TRACK = "#C7D4F7";
const BLUE_PROGRESS = "#6A99F0";
const ICON = "#2E3A59";

const SHADOW =
  Platform.OS === "ios"
    ? {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      }
    : { elevation: 3 };

// 日历
type DayCell = { day: number | null; isSelected: boolean };
function buildMonth(year: number, monthIndex0: number, selectedDay?: number): DayCell[] {
  const first = new Date(year, monthIndex0, 1);
  const firstWeekday = first.getDay();
  const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();
  const cells: DayCell[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ day: null, isSelected: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, isSelected: d === selectedDay });
  return cells;
}

export default function CompletedChallenge() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    dateISO?: string;
    note?: string;
    photo?: string;
    title?: string;
    totalDays?: string;
    joined?: string;
  }>();

  // 参数
  const completedDate = params.dateISO ? new Date(params.dateISO) : new Date();
  const title = params.title || "Daily 10k steps";
  const totalDays = Number(params.totalDays || 20);
  const joined = Number(params.joined || 892);

  // 日历
  const year = completedDate.getFullYear();
  const month = completedDate.getMonth();
  const selectedDay = completedDate.getDate();

  const monthCells = useMemo(
    () => buildMonth(year, month, selectedDay),
    [year, month, selectedDay]
  );

  const monthTitle = useMemo(() => {
    try {
      const dtf = new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric" });
      return dtf.format(new Date(year, month, 1));
    } catch {
      const m = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
      ];
      return `${m[month]} ${year}`;
    }
  }, [year, month]);

  return (
    <View style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 顶部标题 */}
        <View style={styles.headerRow}>
          <Ionicons name="chevron-back" size={24} color={TEXT_BLUE} onPress={() => router.back()} />
          <Text style={styles.headerTitle}>completed challenge</Text>
          <View style={{ width: 24 }} />
        </View>

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
            <View style={[styles.progressBar, { width: "100%" }]} />
          </View>
          <Text style={styles.progressPct}>100%</Text>
          <Text style={[styles.small, { marginTop: 6 }]}>0 day remaining</Text>

          <View style={styles.congratsBox}>
            <Text style={styles.congrats}>CONGRATULATIONS!</Text>
            <Text style={styles.congratsSub}>you have completed{`\n`}the challenge!</Text>
          </View>
        </View>

        {/* 奖励卡 */}
        <View style={[styles.rewardCard, SHADOW]}>
          <Text style={styles.rewardTitle}>Reward: Premium Meditation App</Text>
          <Text style={[styles.small, { marginTop: 8 }]}>
            3-month subscription to premium meditation app
          </Text>

          <View style={styles.rewardRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>$3 value</Text>
            </View>
            <View style={styles.illus} />
          </View>
        </View>

        {/* 日历 */}
        <View style={[styles.calendarCard, SHADOW]}>
          <Text style={styles.monthTitle}>{monthTitle}</Text>

          <View style={styles.weekRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
              <Text key={w} style={styles.weekText}>
                {w}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {monthCells.map((c, idx) => (
              <View key={idx} style={styles.cell}>
                {c.day ? (
                  <View
                    style={[
                      styles.dayBubble,
                      c.isSelected && styles.dayBubbleSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        c.isSelected && { color: "#fff" },
                      ]}
                    >
                      {c.day}
                    </Text>
                  </View>
                ) : (
                  <View style={{ height: 28 }} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* 底部 5 图标 */}
        <View style={styles.bottomBar}>
          <Ionicons name="happy-outline" size={26} color={ICON} />
          <Ionicons name="clipboard-outline" size={26} color={ICON} />
          <Ionicons name="chatbubble-ellipses-outline" size={26} color={ICON} />
          <Ionicons name="time-outline" size={26} color={ICON} />
          <Ionicons name="person-outline" size={26} color={ICON} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_BLUE,
    textTransform: "lowercase",
  },

  // 内容
  cardSoft: {
    backgroundColor: "#EAF7EF",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowCenter: { flexDirection: "row", alignItems: "center", gap: 6 },
  titleBold: { color: TEXT_DARK, fontWeight: "800", fontSize: 18 },

  smallBold: { color: TEXT_DARK, fontWeight: "700" },
  small: { color: TEXT_DARK, fontSize: 14 },
  progressTrack: {
    height: 10,
    backgroundColor: BLUE_TRACK,
    borderRadius: 999,
    marginTop: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: BLUE_PROGRESS,
    borderRadius: 999,
  },
  progressPct: { color: TEXT_DARK, fontWeight: "700", marginTop: 6 },

  congratsBox: {
    marginTop: 12,
    borderRadius: 14,
    backgroundColor: "#F2F7FF",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  congrats: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: TEXT_BLUE,
  },
  congratsSub: {
    marginTop: 6,
    color: TEXT_DARK,
    fontWeight: "600",
  },

  rewardCard: {
    backgroundColor: LEMON,
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
  },
  rewardTitle: { color: TEXT_DARK, fontWeight: "800", fontSize: 16 },
  rewardRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  badge: {
    backgroundColor: LEMON_BADGE,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { fontWeight: "700", color: TEXT_DARK },
  illus: { flex: 1, height: 70, borderRadius: 12, backgroundColor: "#EAEFFF", marginLeft: 12 },

  calendarCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 16,
    marginTop: 14,
  },
  monthTitle: { fontSize: 18, fontWeight: "800", color: TEXT_DARK, marginTop: 6 },

  // 7 列稳定布局
  weekRow: { flexDirection: "row", alignItems: "center", marginTop: 8, paddingHorizontal: 4 },
  weekText: {
    flexBasis: "14.2857%",
    maxWidth: "14.2857%",
    textAlign: "center",
    color: TEXT_DARK,
    fontWeight: "600",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, paddingHorizontal: 4 },
  cell: {
    flexBasis: "14.2857%",
    maxWidth: "14.2857%",
    alignItems: "center",
    paddingVertical: 8,
  },
  dayBubble: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  dayBubbleSelected: { backgroundColor: TEXT_BLUE_DEEP },
  dayText: { color: TEXT_DARK, fontWeight: "700" },

  bottomBar: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 20,
  },
});

