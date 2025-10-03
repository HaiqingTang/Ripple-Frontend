import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

// ---------- 颜色与阴影 ----------
const BG = "#CFE0FF";            // 整体浅蓝背景（更贴近图示）
const CARD = "#FFFFFF";          // 白卡片
const CARD_SOFT = "#F9F9FF";     // 柔和浅色
const LEMON = "#FFF7C8";         // 浅柠檬色卡片背景
const LEMON_BADGE = "#F5E266";   // $3 value 徽章
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

// ---------- 小工具：生成当月日历 ----------
type DayCell = { day: number | null; isToday: boolean };
function buildMonth(year: number, monthIndex0: number, marked: number[]): DayCell[] {
  // monthIndex0: 0-11
  const first = new Date(year, monthIndex0, 1);
  const firstWeekday = first.getDay(); // 0=Sun
  const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();

  const cells: DayCell[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ day: null, isToday: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday =
      d === new Date().getDate() &&
      monthIndex0 === new Date().getMonth() &&
      year === new Date().getFullYear();
    cells.push({ day: d, isToday });
  }
  return cells;
}

// ---------- 页面 ----------
export default function ChallengeCheckin() {
  const router = useRouter();

  // 文案与“进度卡”示例值（匹配示意图）
  const durationDays = 20;
  const joined = 892;
  const progressPct = 50;
  const remaining = 10;

  // 表单本地状态（图片和文字都可选）
  const [note, setNote] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // 日历（默认显示当前月）
  const now = new Date();
  const [displayYear] = useState(now.getFullYear());
  const [displayMonth] = useState(now.getMonth()); // 0-11
  const [markedDays, setMarkedDays] = useState<number[]>([]); // 本地打勾的日期

  const monthCells = useMemo(
    () => buildMonth(displayYear, displayMonth, markedDays),
    [displayYear, displayMonth, markedDays]
  );

  const monthTitle = useMemo(() => {
    const dtf = new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric" });
    return dtf.format(new Date(displayYear, displayMonth, 1));
  }, [displayYear, displayMonth]);

  const onPickPhoto = async () => {
    // TODO: 接入真实图片选择/拍照（例如 expo-image-picker）
    // 先用占位图，保证页面结构和样式能跑起来
    setPhotoUri(
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&auto=format&fit=crop"
    );
  };

  const onCheckIn = () => {
    const today = new Date();
    if (
      today.getMonth() !== displayMonth ||
      today.getFullYear() !== displayYear
    ) {
      // 你的设计里是在“当前月”上标记；若跨月，可选择切换显示月份
      // 这里简单提示一下
      Alert.alert("Heads up", "Current month differs from calendar shown.");
    }

    // 本地把今天标记出来
    setMarkedDays((prev) => {
      const d = today.getDate();
      if (prev.includes(d)) return prev;
      return [...prev, d];
    });

    // 跳转到完成页面（带参数）
    router.push({
      pathname: "/Challenge/completedChallenge",
      params: {
        dateISO: today.toISOString(),
        note: note || "",
        photo: photoUri || "",
        // 下面是一些展示用的参数，方便完成页还原设计
        title: "Daily 10k steps",
        totalDays: String(durationDays),
        joined: String(joined),
      },
    });
  };

  return (
    <View style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 顶部标题行 */}
        <View style={styles.headerRow}>
          <Ionicons name="chevron-back" size={24} color={TEXT_BLUE} />
          <Text style={styles.headerTitle}>challenge check-in</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* 顶部：进度卡 */}
        <View style={[styles.card, styles.round16]}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Daily 10k steps</Text>
          </View>

          <View style={[styles.rowBetween, { marginTop: 8 }]}>
            <View style={styles.rowCenter}>
              <Ionicons name="time-outline" size={18} color={TEXT_DARK} />
              <Text style={styles.metaText}>{durationDays} days</Text>
            </View>
            <View style={styles.rowCenter}>
              <Ionicons name="people-outline" size={18} color={TEXT_DARK} />
              <Text style={styles.metaText}>{joined} joined</Text>
            </View>
          </View>

          <Text style={[styles.smallBold, { marginTop: 12 }]}>Your progress</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressPct}>{progressPct}%</Text>
          <Text style={[styles.small, { marginTop: 6 }]}>{remaining} days remaining</Text>
        </View>

        {/* 奖励卡 */}
        <View style={[styles.cardSoft, styles.round16]}>
          <Text style={styles.rewardTitle}>Reward: Premium Meditation App</Text>
          <Text style={[styles.small, { marginTop: 8 }]}>
            3-month subscription to{"\n"}premium meditation app
          </Text>

          <View style={styles.rewardRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>$3 value</Text>
            </View>

            {/* 右侧插画占位 */}
            <View style={styles.illus} />
          </View>
        </View>

        {/* 日历 */}
        <View style={[styles.card, styles.round12]}>
          <Text style={styles.monthTitle}>{monthTitle}</Text>

          <View style={styles.weekRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
              <Text key={w} style={styles.weekText}>
                {w}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {monthCells.map((c, idx) => {
              const isMarked = c.day && markedDays.includes(c.day);
              return (
                <View key={idx} style={styles.cell}>
                  {c.day ? (
                    <View
                      style={[
                        styles.dayBubble,
                        isMarked && styles.dayBubbleMarked,
                        c.isToday && !isMarked && styles.dayBubbleToday,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          (isMarked || c.isToday) && { color: "#fff" },
                        ]}
                      >
                        {c.day}
                      </Text>
                    </View>
                  ) : (
                    <View style={{ height: 28 }} />
                  )}
                </View>
              );
            })}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Today’s Check-in</Text>

          {/* Notes */}
          <Text style={[styles.label, { marginTop: 12 }]}>Notes (Optional)</Text>
          <View style={[styles.inputBox, SHADOW]}>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="How did it go? Share your progress..."
              placeholderTextColor="#9CA3AF"
              multiline
              style={styles.input}
            />
          </View>

          {/* Photo */}
          <Text style={[styles.label, { marginTop: 16 }]}>Add photo (Optional)</Text>
          <Pressable onPress={onPickPhoto} style={[styles.photoBox, SHADOW]}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <View style={styles.photoInner}>
                <Ionicons name="image-outline" size={36} color="#9CA3AF" />
                <Text style={styles.photoHint}>Tap to add photo</Text>
              </View>
            )}
          </Pressable>

          {/* 按钮 */}
          <Pressable style={styles.btn} onPress={onCheckIn} android_ripple={{ color: "#E6F5EA" }}>
            <Text style={styles.btnText}>check in</Text>
          </Pressable>
        </View>

        {/* 底部 5 个图标 */}
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

  card: {
    backgroundColor: CARD,
    padding: 16,
    marginTop: 10,
    ...SHADOW,
  },
  cardSoft: {
    backgroundColor: LEMON,
    padding: 16,
    marginTop: 14,
    ...SHADOW,
  },
  round16: { borderRadius: 16 },
  round12: { borderRadius: 12 },

  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowCenter: { flexDirection: "row", alignItems: "center", gap: 6 },

  cardTitle: { fontSize: 20, fontWeight: "800", color: TEXT_DARK },
  metaText: { marginLeft: 6, color: TEXT_DARK, fontWeight: "600" },

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

  rewardTitle: { color: TEXT_DARK, fontWeight: "800", fontSize: 16 },
  rewardRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  badge: {
    backgroundColor: LEMON_BADGE,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { fontWeight: "700", color: TEXT_DARK },

  illus: {
    flex: 1,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#EAEFFF",
    marginLeft: 12,
  },

  monthTitle: { fontSize: 18, fontWeight: "800", color: TEXT_DARK, marginTop: 6 },
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  weekText: {
    flexBasis: "14.2857%",
    maxWidth: "14.2857%",
    textAlign: "center",
    color: TEXT_DARK,
    fontWeight: "600",
    },
  grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 8,
      paddingHorizontal: 4,
    },
    cell: {
      flexBasis: "14.2857%",
      maxWidth: "14.2857%",
      alignItems: "center",
      paddingVertical: 8,
    },
  dayBubble: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  dayBubbleMarked: { backgroundColor: TEXT_BLUE_DEEP },
  dayBubbleToday: { backgroundColor: BLUE_PROGRESS },
  dayText: { color: TEXT_DARK, fontWeight: "700" },

  sectionTitle: { fontSize: 20, fontWeight: "800", color: TEXT_DARK },
  label: { color: TEXT_DARK, fontWeight: "700" },

  inputBox: {
    borderRadius: 12,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
  },
  input: { minHeight: 92, padding: 12, fontSize: 15, color: TEXT_DARK },

  photoBox: {
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    marginTop: 8,
    overflow: "hidden",
  },
  photoInner: { height: 120, alignItems: "center", justifyContent: "center" },
  photo: { width: "100%", height: 160, resizeMode: "cover" },
  photoHint: { color: "#9CA3AF", marginTop: 6, fontWeight: "700" },

  btn: {
    marginTop: 18,
    alignSelf: "center",
    backgroundColor: "#39B563",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnText: { color: "#fff", fontWeight: "800", textTransform: "lowercase", fontSize: 16 },

  bottomBar: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 16,
  },
});
