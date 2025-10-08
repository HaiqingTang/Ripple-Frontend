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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
  onSnapshot,
  collection,
  getDocs,
  query,
  limit,
} from "firebase/firestore";

/* ---------- 颜色与阴影 ---------- */
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

/* ---------- 工具 ---------- */
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

type UserChallengeDoc = {
  title?: string;
  totalDays?: number;
  progress?: number;
  checkins?: string[];
  reward?: string;
  cover?: string;
  category?: string;
  status?: "active" | "completed";
};

/* ---------- 页面 ---------- */
export default function ChallengeCheckin() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    challengeId?: string;
    category?: string;
    title?: string;
    totalDays?: string;
    cover?: string;
    joined?: string; // 兜底
  }>();

  // challengeId：路由带来的优先；缺失则从 userChallenges 兜底取一个
  const routeCid =
    typeof params.challengeId === "string" && params.challengeId.trim()
      ? params.challengeId
      : "";
  const [cid, setCid] = useState<string>(routeCid);

  // 标题/天数
  const [title, setTitle] = useState<string>(params.title || "Daily 10k steps");
  const [totalDaysNum, setTotalDaysNum] = useState<number>(
    Math.max(1, Number(params.totalDays || 20) || 20)
  );

  // 类别（订阅 public joined 用）
  const [category, setCategory] = useState<string>(
    typeof params.category === "string" ? params.category : ""
  );

  // joined：订阅 challenges/{category}/items/{cid}；先用路由值兜底
  const [joined, setJoined] = useState<number>(
    Math.max(0, Number(params.joined ?? 0) || 0)
  );

  // 进度/备注/图片
  const [progressPct, setProgressPct] = useState<number>(0);
  const [note, setNote] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // 日历展示
  const now = new Date();
  const [displayYear] = useState(now.getFullYear());
  const [displayMonth] = useState(now.getMonth());
  const [markedDays, setMarkedDays] = useState<number[]>([]);

  const monthCells = useMemo(
    () => buildMonth(displayYear, displayMonth),
    [displayYear, displayMonth]
  );

  const monthTitle = useMemo(() => {
    try {
      const dtf = new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric" });
      return dtf.format(new Date(displayYear, displayMonth, 1));
    } catch {
      const names = [
        "January","February","March","April","May","June","July",
        "August","September","October","November","December",
      ];
      return `${names[displayMonth]} ${displayYear}`;
    }
  }, [displayYear, displayMonth]);

  const onPickPhoto = () => {
    setPhotoUri(
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&auto=format&fit=crop"
    );
  };

  /* ---------- 兜底：如果没带 challengeId，从用户 active 里取一个 ---------- */
  useEffect(() => {
    (async () => {
      if (cid) return;
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      try {
        const q1 = query(collection(db, "userChallenges", uid, "active"), limit(1));
        const s = await getDocs(q1);
        if (!s.empty) {
          const first = s.docs[0];
          const d = first.data() as UserChallengeDoc;
          setCid(first.id);
          if (d.category) setCategory(String(d.category));
          if (d.title) setTitle(d.title);
          if (typeof d.totalDays === "number" && d.totalDays > 0) {
            setTotalDaysNum(d.totalDays);
          }
        }
      } catch (e) {
        console.log("[fallback cid] error:", e);
      }
    })();
  }, [cid]);

  /* ---------- 读取用户实例：userChallenges/<uid>/active/<cid> ---------- */
  useEffect(() => {
    (async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid || !cid) return;

        const ref = doc(db, "userChallenges", uid, "active", cid);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;

        const d = snap.data() as UserChallengeDoc;

        if (d.title) setTitle(d.title);
        if (typeof d.totalDays === "number" && d.totalDays > 0) {
          setTotalDaysNum(d.totalDays);
        }
        if (d.category && !category) setCategory(d.category);

        // 进度：优先 progress；否则用 checkins 计算
        const list = (d.checkins ?? []).filter(Boolean);
        const td = Math.max(1, Number(d.totalDays ?? totalDaysNum) || totalDaysNum);
        const pctFromList = Math.min(100, Math.round((list.length / td) * 100));
        const pct =
          typeof d.progress === "number"
            ? Math.min(100, Math.max(0, d.progress))
            : pctFromList;
        setProgressPct(pct);

        // 本月高亮
        const selected = list
          .map((s) => new Date(s))
          .filter((x) => x.getFullYear() === displayYear && x.getMonth() === displayMonth)
          .map((x) => x.getDate());
        setMarkedDays(selected);

        // 读取“今天”的 note（有的话回填）
        const todayId = ymd(new Date());
        const noteRef = doc(db, "userChallenges", uid, "active", cid, "checkins", todayId);
        const noteSnap = await getDoc(noteRef);
        if (noteSnap.exists()) {
          const v = String(noteSnap.get("note") ?? "");
          setNote(v);
        }
      } catch (e: any) {
        console.error("initial load error:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid]);

  /* ---------- 订阅 joined：/challenges/{category}/items/{cid} ---------- */
  useEffect(() => {
    const cat =
      (category && String(category)) ||
      (typeof params.category === "string" ? params.category : "");
    if (!cid || !cat) return;

    const pubRef = doc(db, "challenges", cat, "items", cid);
    let unsub: undefined | (() => void);

    (async () => {
      try {
        const once = await getDoc(pubRef);
        if (once.exists()) {
          const j = Number(once.get("joined") ?? 0);
          setJoined(Number.isFinite(j) && j >= 0 ? j : 0);
        }
        unsub = onSnapshot(pubRef, (snap) => {
          const j = Number(snap.data()?.joined ?? 0);
          setJoined(Number.isFinite(j) && j >= 0 ? j : 0);
        });
      } catch (e) {
        console.log("[joined subscribe] error:", e);
      }
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [cid, category, params.category]);

  /* ---------- 打卡：写主文档 + 写“当天 note 的子文档” ---------- */
  const onCheckIn = async () => {
    const today = new Date();
    const todayStr = ymd(today);
    const uid = auth.currentUser?.uid;

    // 本地高亮
    setMarkedDays((prev) => {
      const d = today.getDate();
      return prev.includes(d) ? prev : [...prev, d];
    });

    if (uid && cid) {
      try {
        const ref = doc(db, "userChallenges", uid, "active", cid);
        const snap = await getDoc(ref);

        // 不存在就建壳
        if (!snap.exists()) {
          await setDoc(ref, {
            title,
            totalDays: totalDaysNum,
            daysCompleted: 0,
            progress: 0,
            reward: "",
            cover: params.cover || "",
            category: category || params.category || "",
            challengeId: cid,
            joinedAt: serverTimestamp(),
            status: "active",
            checkins: [],
          } as UserChallengeDoc & {
            daysCompleted: number;
            status: string;
            checkins: string[];
          });
        }

        // 1) 主文档追加当日打卡痕迹
        await updateDoc(ref, {
          checkins: arrayUnion(todayStr),
          lastNote: note || "",
          lastPhoto: photoUri || "",
          lastCheckinAt: serverTimestamp(),
        });

        // 2) 写“当天的 note 子文档”，路径：
        // userChallenges/{uid}/active/{cid}/checkins/{YYYY-MM-DD}
        const noteRef = doc(
          db,
          "userChallenges",
          uid,
          "active",
          cid,
          "checkins",
          todayStr
        );
        await setDoc(
          noteRef,
          {
            note: (note || "").trim(),
            date: todayStr,
            createdAt: serverTimestamp(),
          },
          { merge: true } // 幂等：当天重复打卡则覆盖
        );

        // 3) 重新读取计算进度并回写
        const latest = await getDoc(ref);
        const data = (latest.data() || {}) as UserChallengeDoc;
        const list = (data.checkins ?? []).filter(Boolean);
        const td = Math.max(1, Number(data.totalDays ?? totalDaysNum) || totalDaysNum);
        const pct = Math.min(100, Math.round((list.length / td) * 100));

        await updateDoc(ref, {
          daysCompleted: list.length,
          progress: pct,
          ...(list.length >= td ? { status: "completed", completedAt: serverTimestamp() } : {}),
        });

        setProgressPct(pct);
      } catch (e: any) {
        console.error("check-in error:", e);
        Alert.alert("Check-in Error", e?.message || "Failed to check in.");
        return;
      }
    }

    // 跳转完成页
    router.push({
      pathname: "/(tabs)/Challenge/completedChallenge",
      params: {
        challengeId: cid,
        dateISO: today.toISOString(),
        title,
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
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      {/* 顶部与 completed 保持一致 */}
      <View style={styles.headerBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backBtn}
          android_ripple={{ color: "#dfe7ff", borderless: true }}
        >
          <Ionicons name="chevron-back" size={28} color={TEXT_BLUE} />
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>
          challenge check-in
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 进度卡（绑定 userChallenges & public joined） */}
        <View style={[styles.cardSoft, SHADOW]}>
          <View style={styles.rowBetween}>
            <Text style={styles.titleBold}>{title}</Text>
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
            <View style={[styles.progressBar, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressPct}>{progressPct}%</Text>
          <Text style={[styles.small, { marginTop: 6 }]}>{remaining} days remaining</Text>
        </View>

        {/* 奖励卡（示例） */}
        <View style={[styles.rewardCard, SHADOW]}>
          <Text style={styles.rewardTitle}>Reward: Premium Meditation App</Text>
          <Text style={[styles.small, { marginTop: 8 }]}>
            3-month subscription to {"\n"}premium meditation app
          </Text>
          <View style={styles.rewardRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>$3 value</Text>
            </View>
            <View style={styles.illus} />
          </View>
        </View>

        {/* 日历 + 今日打卡 */}
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

          <Text style={[styles.smallBold, { marginTop: 18 }]}>Today’s Check-in</Text>

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

          <Pressable style={styles.btn} onPress={onCheckIn}>
            <Text style={styles.btnText}>check in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- 样式 ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  headerBar: {
    height: 72,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  rightPlaceholder: { width: 44, height: 44 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "900",
    color: TEXT_BLUE,
    textTransform: "lowercase",
  },

  scroll: { flex: 1, paddingHorizontal: 16 },

  cardSoft: { backgroundColor: "#EAF7EF", borderRadius: 16, padding: 16, marginTop: 8 },
  rewardCard: { backgroundColor: LEMON, borderRadius: 16, padding: 16, marginTop: 14 },
  calendarCard: { backgroundColor: CARD, borderRadius: 12, padding: 16, marginTop: 14 },

  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowCenter: { flexDirection: "row", alignItems: "center", gap: 6 },

  titleBold: { color: TEXT_DARK, fontWeight: "800", fontSize: 20 },
  metaText: { color: TEXT_DARK, marginLeft: 6, fontWeight: "600" },
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
  weekText: {
    flexBasis: "14.2857%",
    maxWidth: "14.2857%",
    textAlign: "center",
    color: TEXT_DARK,
    fontWeight: "600",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, paddingHorizontal: 4 },
  cell: { flexBasis: "14.2857%", maxWidth: "14.2857%", alignItems: "center", paddingVertical: 8 },
  dayBubble: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  dayBubbleMarked: { backgroundColor: TEXT_BLUE_DEEP },
  dayBubbleToday: { backgroundColor: BLUE_PROGRESS },
  dayText: { color: TEXT_DARK, fontWeight: "700" },

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
});
