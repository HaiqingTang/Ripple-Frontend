import React, { useMemo, useState, useEffect } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { auth, db } from "../../../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

// ---------- 颜色与阴影 ----------
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

// ---------- 工具 ----------
type DayCell = { day: number | null; isToday: boolean };
function buildMonth(year: number, monthIndex0: number): DayCell[] {
  const first = new Date(year, monthIndex0, 1);
  const firstWeekday = first.getDay();
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

const ymd = (d = new Date()) => {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

// ---------- 页面 ----------
export default function ChallengeCheckin() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    challengeId?: string;
    category?: string;
    title?: string;
    totalDays?: string;
    cover?: string;
  }>();

  // 校验 challengeId（为空就走“仅前端演示模式”，不写库）
  const rawId = params.challengeId;
  const challengeId = typeof rawId === "string" && rawId.trim() ? rawId : null;

  // 展示用（带参优先，没参 fallback）
  const fallbackTitle = params.title || "Daily 10k steps";
  const totalDaysNum = Math.max(1, Number(params.totalDays || 20) || 20);
  const joined = 892; // 纯展示

  const [progressPct, setProgressPct] = useState(0);
  const [note, setNote] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const now = new Date();
  const [displayYear] = useState(now.getFullYear());
  const [displayMonth] = useState(now.getMonth());
  const [markedDays, setMarkedDays] = useState<number[]>([]);

  const monthCells = useMemo(
    () => buildMonth(displayYear, displayMonth),
    [displayYear, displayMonth]
  );

  const monthTitle = useMemo(() => {
    const dtf = new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric" });
    return dtf.format(new Date(displayYear, displayMonth, 1));
  }, [displayYear, displayMonth]);

  const onPickPhoto = () => {
    setPhotoUri(
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&auto=format&fit=crop"
    );
  };

  // 初始读本挑战的 checkins（若有 challengeId）
  useEffect(() => {
    (async () => {
      const uid = auth.currentUser?.uid;
      if (!uid || !challengeId) return;
      const ref = doc(db, "userChallenges", uid, "active", challengeId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data() as { checkins?: string[]; totalDays?: number };
        const list = d.checkins || [];
        const td = Math.max(1, Number(d.totalDays ?? totalDaysNum) || totalDaysNum);
        const pct = Math.min(100, Math.round((list.length / td) * 100));
        setProgressPct(pct);

        const selected = list
          .map((s) => new Date(s))
          .filter((x) => x.getFullYear() === displayYear && x.getMonth() === displayMonth)
          .map((x) => x.getDate());
        setMarkedDays(selected);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeId]);

  // ✅ 打卡
  const onCheckIn = async () => {
    const today = new Date();

    // 本地高亮
    setMarkedDays((prev) => {
      const d = today.getDate();
      if (prev.includes(d)) return prev;
      return [...prev, d];
    });

    const uid = auth.currentUser?.uid;

    if (uid && challengeId) {
      try {
        const ref = doc(db, "userChallenges", uid, "active", challengeId);
        const snap = await getDoc(ref);

        // 不存在就建“壳”
        if (!snap.exists()) {
          await setDoc(ref, {
            title: fallbackTitle,
            totalDays: totalDaysNum,
            daysCompleted: 0,
            progress: 0,
            reward: "",
            cover: params.cover || "",
            category: params.category || "",
            challengeId,
            joinedAt: serverTimestamp(),
            status: "active",
            checkins: [],
          });
        }

        const todayStr = ymd(today);
        await updateDoc(ref, {
          checkins: arrayUnion(todayStr),
          lastNote: note || "",
          lastPhoto: photoUri || "",
          lastCheckinAt: serverTimestamp(),
        });

        // 重新读取计算进度并回写
        const latest = await getDoc(ref);
        const data = latest.data() as { checkins?: string[]; totalDays?: number };
        const list = data?.checkins || [];
        const td = Math.max(1, Number(data?.totalDays ?? totalDaysNum) || totalDaysNum);
        const pct = Math.min(100, Math.round((list.length / td) * 100));

        await updateDoc(ref, {
          daysCompleted: list.length,
          progress: pct,
          // 如果达到或超过目标天数，自动标记完成并写 completedAt
          ...(list.length >= td
            ? { status: "completed", completedAt: serverTimestamp() }
            : {}),
        });

        setProgressPct(pct);
      } catch (e: any) {
        console.error("check-in error:", e);
        Alert.alert("Check-in Error", e?.message || "Failed to check in.");
      }
    }

    // 跳转到 Completed（使用实际路由，带 challengeId）
    router.push({
      pathname: "/(tabs)/Challenge/completedChallenge",
      params: {
        challengeId: challengeId || "",
        dateISO: today.toISOString(),
        title: fallbackTitle,
        totalDays: String(totalDaysNum),
        joined: String(joined),
      },
    });
  };

  const remaining = Math.max(
    0,
    totalDaysNum - Math.round((progressPct / 100) * totalDaysNum)
  );

  return (
    <View style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 顶部标题 */}
        <View style={styles.headerRow}>
          <Ionicons name="chevron-back" size={24} color={TEXT_BLUE} />
          <Text style={styles.headerTitle}>challenge check-in</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* 进度卡 */}
        <View style={[styles.card, styles.round16]}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>{fallbackTitle}</Text>
          </View>

          <View style={[styles.rowBetween, { marginTop: 8 }]}>
            <View style={styles.rowCenter}>
              <Ionicons name="time-outline" size={18} color={TEXT_DARK} />
              <Text style={styles.metaText}>{totalDaysNum} days</Text>
            </View>
            <View style={styles.rowCenter}>
              <Ionicons name="people-outline" size={18} color={TEXT_DARK} />
              <Text style={styles.metaText}>{joined} joined</Text>
            </View>
          </View>

          <Text style={[styles.smallBold, { marginTop: 12 }]}>Your progress</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${isFinite(progressPct) ? progressPct : 0}%` }]} />
          </View>
          <Text style={styles.progressPct}>{isFinite(progressPct) ? progressPct : 0}%</Text>
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
              const isMarked = c.day !== null && markedDays.includes(c.day);
              return (
                <View key={idx} style={styles.cell}>
                  {c.day ? (
                    <View
                      style={[
                        styles.dayBubble,
                        isMarked ? styles.dayBubbleMarked : undefined,
                        c.isToday && !isMarked ? styles.dayBubbleToday : undefined,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isMarked || c.isToday ? { color: "#fff" } : undefined,
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
          <Pressable onPress={() => {}} style={[styles.photoBox, SHADOW]}>
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
          <Pressable style={styles.btn} onPress={onCheckIn}>
            <Text style={styles.btnText}>check in</Text>
          </Pressable>
        </View>

        {/* 底部图标 */}
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
  card: { backgroundColor: CARD, padding: 16, marginTop: 10, ...SHADOW },
  cardSoft: { backgroundColor: LEMON, padding: 16, marginTop: 14, ...SHADOW },
  round16: { borderRadius: 16 },
  round12: { borderRadius: 12 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowCenter: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardTitle: { fontSize: 20, fontWeight: "800", color: TEXT_DARK },
  metaText: { marginLeft: 6, color: TEXT_DARK, fontWeight: "600" },
  smallBold: { color: TEXT_DARK, fontWeight: "700" },
  small: { color: TEXT_DARK, fontSize: 14 },
  progressTrack: { height: 10, backgroundColor: BLUE_TRACK, borderRadius: 999, marginTop: 8 },
  progressBar: { height: 10, backgroundColor: BLUE_PROGRESS, borderRadius: 999 },
  progressPct: { color: TEXT_DARK, fontWeight: "700", marginTop: 6 },
  rewardTitle: { color: TEXT_DARK, fontWeight: "800", fontSize: 16 },
  rewardRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  badge: { backgroundColor: LEMON_BADGE, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontWeight: "700", color: TEXT_DARK },
  illus: { flex: 1, height: 70, borderRadius: 12, backgroundColor: "#EAEFFF", marginLeft: 12 },
  monthTitle: { fontSize: 18, fontWeight: "800", color: TEXT_DARK, marginTop: 6 },
  weekRow: { flexDirection: "row", alignItems: "center", marginTop: 8, paddingHorizontal: 4 },
  weekText: { flexBasis: "14.2857%", maxWidth: "14.2857%", textAlign: "center", color: TEXT_DARK, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, paddingHorizontal: 4 },
  cell: { flexBasis: "14.2857%", maxWidth: "14.2857%", alignItems: "center", paddingVertical: 8 },
  dayBubble: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  dayBubbleMarked: { backgroundColor: TEXT_BLUE_DEEP },
  dayBubbleToday: { backgroundColor: BLUE_PROGRESS },
  dayText: { color: TEXT_DARK, fontWeight: "700" },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: TEXT_DARK },
  label: { color: TEXT_DARK, fontWeight: "700" },
  inputBox: { borderRadius: 12, backgroundColor: CARD, borderWidth: 1, borderColor: "#E5E7EB", marginTop: 8 },
  input: { minHeight: 92, padding: 12, fontSize: 15, color: TEXT_DARK },
  photoBox: { borderRadius: 12, borderWidth: 2, borderStyle: "dashed", borderColor: "#D1D5DB", backgroundColor: "#FFFFFF", marginTop: 8, overflow: "hidden" },
  photoInner: { height: 120, alignItems: "center", justifyContent: "center" },
  photo: { width: "100%", height: 160, resizeMode: "cover" },
  photoHint: { color: "#9CA3AF", marginTop: 6, fontWeight: "700" },
  btn: { marginTop: 18, alignSelf: "center", backgroundColor: "#39B563", paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10 },
  btnText: { color: "#fff", fontWeight: "800", textTransform: "lowercase", fontSize: 16 },
  bottomBar: { marginTop: 20, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingBottom: 16 },
});
