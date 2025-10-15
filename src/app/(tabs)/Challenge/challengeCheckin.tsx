import React, { useMemo, useState, useEffect, useRef } from "react";
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
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { auth, db } from "../../../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { uploadToCloudinary } from "../../../utils/upload";

/* ---------- Colors ---------- */
const BG = "#CFE0FF";
const CARD = "#FFFFFF";
const LEMON_BADGE = "#F5E266";
const TEXT_DARK = "#1F2937";
const TEXT_BLUE = "#6A8DE6";
const TEXT_BLUE_DEEP = "#3C5BD6";
const BLUE_TRACK = "#C7D4F7";
const BLUE_PROGRESS = "#6A99F0";

/* ---------- Platform shadow ---------- */
const SHADOW =
  Platform.OS === "ios"
    ? {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      }
    : { elevation: 3 };

/* ---------- Cloudinary settings (ENV-based) ---------- */
const CLOUDINARY = {
  CLOUD_NAME: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  UPLOAD_PRESET: process.env.EXPO_PUBLIC_CLOUDINARY_UNSIGNED_PRESET!,
  FOLDER_CHECKIN: "challenge_checkins",
};

/* ---------- Upload constraints ---------- */
const MAX_IMAGE_MB = 10;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

/* ---------- Types ---------- */
type DayCell = { day: number | null; isToday: boolean };
type WebFileLike = { size?: number } | Blob | null;

type UserChallengeDoc = {
  title?: string;
  totalDays?: number;
  progress?: number;
  checkins?: string[];
  reward?: string;
  cover?: string;
  category?: string;
  status?: "active" | "completed";
  lastNote?: string;
  lastPhoto?: string;
};

/* ---------- Helpers ---------- */

// yyyy-mm-dd (local time)
const ymd = (d = new Date()) => {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

// ensure validUntil is in the future; fallback to +30 days end-of-day
function ensureFutureISO(iso?: string) {
  const now = Date.now();
  if (iso) {
    const t = new Date(iso).getTime();
    if (Number.isFinite(t) && t > now + 60_000) return new Date(t).toISOString();
  }
  const d = new Date();
  d.setDate(d.getDate() + 30);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

// issue reward into users/{uid}/rewards/{cid}
async function issueRewardIfEligible(opts: {
  uid: string;
  cid: string;
  rewardName?: string;
  rewardSubtitle?: string;
  rewardValue?: string;
  rewardDesc?: string;
  rewardValidUntil?: string;
  logoUri?: string;
}) {
  const {
    uid,
    cid,
    rewardName,
    rewardSubtitle,
    rewardValue,
    rewardDesc,
    rewardValidUntil,
    logoUri,
  } = opts;

  const hasAny =
    (rewardName && rewardName.trim()) ||
    (rewardSubtitle && rewardSubtitle.trim()) ||
    (rewardValue && rewardValue.trim()) ||
    (rewardDesc && rewardDesc.trim());
  if (!hasAny) return;

  const ref = doc(db, "users", uid, "rewards", cid); // avoid duplication by using challengeId as doc id
  await setDoc(
    ref,
    {
      title: rewardName || "Reward",
      subtitle: rewardSubtitle || "",
      description: rewardDesc || "",
      value: rewardValue || "",
      logoUri: logoUri || "",
      validUntil: ensureFutureISO(rewardValidUntil),
      redeemed: false,
      expired: false,
      issuedAt: serverTimestamp(),
      challengeId: cid,
    },
    { merge: true }
  );
}

// build month cells
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

const formatBytes = (n: number) => {
  if (!Number.isFinite(n)) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let s = n;
  while (s >= 1024 && i < units.length - 1) {
    s /= 1024;
    i++;
  }
  return `${s.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const isAllowedType = (mime?: string | null) => {
  if (!mime) return false;
  const m = mime.toLowerCase();
  return m.startsWith("image/") || ALLOWED_MIME.includes(m);
};

// get file size across platforms
const getFileSize = async (uri: string, webFile: WebFileLike) => {
  if (Platform.OS === "web") {
    const maybeSize = (webFile as any)?.size;
    if (typeof maybeSize === "number") return maybeSize;
    const resp = await fetch(uri);
    const blob = await resp.blob();
    const blobSize = (blob as any)?.size;
    return typeof blobSize === "number" ? blobSize : 0;
  } else {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return 0;
    return typeof info.size === "number" ? (info.size as number) : 0;
  }
};

// validate size & type
const validateSelection = async (mime: string | null, uri: string, webFile: WebFileLike) => {
  if (!isAllowedType(mime)) {
    throw new Error("Only image files are allowed (jpg / png / webp / HEIC / HEIF).");
  }
  const size = await getFileSize(uri, webFile);
  const limit = MAX_IMAGE_MB * 1024 * 1024;
  if (size > limit) {
    throw new Error(`Image is too large (${formatBytes(size)}). Please keep it ≤ ${MAX_IMAGE_MB}MB.`);
  }
  return size;
};

/* ---------- Coupon UI (compact) ---------- */
const COUPON_BG = "#FFE7E7";
const COUPON_BORDER = "#FF6B6B";
const COUPON_LEFT_BG = "#FFF1F1";
const COUPON_TEXT = "#E02424";

function CouponCard({
  amountText,
  ruleText,
  validityText,
}: {
  amountText: string;
  ruleText: string;
  validityText?: string;
}) {
  return (
    <View style={coupon.wrap}>
      <View style={[coupon.card, SHADOW]}>
        <View style={coupon.left}>
          <Text style={coupon.amount} numberOfLines={1}>
            {amountText}
          </Text>
        </View>

        <View className="mid" style={coupon.mid}>
          <View style={coupon.dash} />
          <View style={[coupon.notch, coupon.notchTop]} />
          <View style={[coupon.notch, coupon.notchBottom]} />
        </View>

        <View style={coupon.right}>
          <Text style={coupon.rule} numberOfLines={1}>
            {ruleText}
          </Text>
          {!!validityText && (
            <Text style={coupon.validity} numberOfLines={1}>
              {validityText}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const coupon = StyleSheet.create({
  wrap: { marginTop: 10, borderRadius: 14, overflow: "hidden" },
  card: {
    height: 88,
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: COUPON_BG,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COUPON_BORDER,
  },
  left: {
    width: "32%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COUPON_LEFT_BG,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 6,
  },
  amount: { fontSize: 20, fontWeight: "900", color: COUPON_TEXT },
  mid: { width: 14, alignItems: "center", justifyContent: "center", position: "relative" },
  dash: {
    height: "74%",
    width: 0,
    borderLeftWidth: 1.5,
    borderColor: COUPON_BORDER,
    borderStyle: "dashed",
  },
  notch: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: BG,
    left: -2,
  },
  notchTop: { top: -9 },
  notchBottom: { bottom: -9 },
  right: { flex: 1, justifyContent: "center", paddingHorizontal: 12, gap: 4 },
  rule: { fontSize: 16, fontWeight: "800", color: COUPON_TEXT },
  validity: { fontSize: 12, fontWeight: "700", color: COUPON_TEXT, opacity: 0.9 },
});

/* ---------- Component ---------- */
export default function ChallengeCheckin() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid ?? null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setUid(user?.uid ?? null));
    return unsub;
  }, []);

  const params = useLocalSearchParams<{
    challengeId?: string;
    category?: string;
    title?: string;
    totalDays?: string;
    cover?: string; // cover used as reward logoUri
    joined?: string;
  }>();

  const routeCid =
    typeof params.challengeId === "string" && params.challengeId.trim()
      ? params.challengeId
      : "";
  const [cid] = useState(routeCid);
  const [category, setCategory] = useState(
    typeof params.category === "string" ? params.category : ""
  );

  const [title, setTitle] = useState(params.title || "Challenge");
  const [totalDaysNum, setTotalDaysNum] = useState(
    Math.max(1, Number(params.totalDays || 20) || 20)
  );
  const [joined, setJoined] = useState(Math.max(0, Number(params.joined ?? 0) || 0));
  const [progressPct, setProgressPct] = useState(0);
  const [checkedToday, setCheckedToday] = useState(false);

  const [note, setNote] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoLocalPreview, setPhotoLocalPreview] = useState<string | null>(null);

  const [rewardName, setRewardName] = useState("");
  const [rewardSubtitle, setRewardSubtitle] = useState("");
  const [rewardValue, setRewardValue] = useState("");
  const [rewardDesc, setRewardDesc] = useState("");
  const [rewardValidUntil, setRewardValidUntil] = useState("");

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
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${names[displayMonth]} ${displayYear}`;
    }
  }, [displayYear, displayMonth]);

  const formatValidUntil = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const dd = String(d.getDate()).padStart(2, "0");
    return `Valid until ${dd} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  /* ---------- Real-time user challenge sync ---------- */
  useEffect(() => {
    if (!uid || !cid) return;

    const ref = doc(db, "userChallenges", uid, "active", cid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) return;
        const d = snap.data() as UserChallengeDoc;

        if (d.title) setTitle(d.title);
        if (typeof d.totalDays === "number" && d.totalDays > 0) setTotalDaysNum(d.totalDays);
        if (d.category && !category) setCategory(d.category);

        const list = (d.checkins ?? []).filter(Boolean);
        const td = Math.max(1, Number(d.totalDays ?? totalDaysNum) || totalDaysNum);

        const pctFromList = Math.min(100, Math.round((list.length / td) * 100));
        const pct =
          typeof d.progress === "number"
            ? Math.min(100, Math.max(0, d.progress))
            : pctFromList;
        setProgressPct(pct);

        const todayStr = ymd();
        const didCheckToday = list.includes(todayStr);
        setCheckedToday(didCheckToday);

        if (didCheckToday) {
          if (typeof d.lastNote === "string") setNote(d.lastNote);
          if (typeof d.lastPhoto === "string" && d.lastPhoto) {
            setPhotoUri(d.lastPhoto);
            setPhotoLocalPreview(null);
          }
        }

        const selected = (list ?? [])
          .map((s) => {
            const [y, m, dnum] = s.split("-").map((n) => parseInt(n, 10));
            return { y, m: m - 1, d: dnum };
          })
          .filter((x) => x.y === displayYear && x.m === displayMonth)
          .map((x) => x.d);

        setMarkedDays(selected);
      },
      (err) => console.error("realtime sync error:", err)
    );

    return () => unsub();
  }, [uid, cid, category, totalDaysNum, displayYear, displayMonth]);

  /* ---------- Subscribe public challenge ---------- */
  useEffect(() => {
    const cat = category || (typeof params.category === "string" ? params.category : "");
    if (!cid || !cat) return;

    const pubRef = doc(db, "challenges", cat, "items", cid);
    const unsub = onSnapshot(pubRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const j = Number(data?.joined ?? 0);
      setJoined(Number.isFinite(j) && j >= 0 ? j : 0);
      const rc = (data as any)?.rewardConfig;
      setRewardName(rc?.name || "");
      setRewardSubtitle(rc?.vendor || "");
      setRewardValue(rc?.value || "");
      setRewardDesc(rc?.description || "");
      setRewardValidUntil(rc?.validUntil || "");
    });

    return () => unsub();
  }, [cid, category]);

  const lastUploadedUrlRef = useRef<string | null>(null);

  /* ---------- Pick image ---------- */
  const pickOneImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Media library access is needed to select an image.");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      selectionLimit: 1,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
      base64: false,
    });

    if (result.canceled) return null;
    const asset = result.assets?.[0];
    if (!asset?.uri) return null;

    setPhotoLocalPreview(asset.uri);

    return {
      localUri: asset.uri as string,
      mime: (asset as any)?.mimeType || "image/jpeg",
      webFile: Platform.OS === "web" ? (((asset as any)?.file as any) ?? null) : null,
    };
  };

  const onPickPhoto = async () => {
    if (checkedToday) return;

    const picked = await pickOneImage();
    if (!picked) return;

    try {
      await validateSelection(picked.mime, picked.localUri, picked.webFile);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : typeof err === "string" ? err : "Invalid file";
      Alert.alert("Invalid image", msg);
      return;
    }

    try {
      const url = await uploadToCloudinary(
        picked.localUri,
        picked.mime,
        (picked.webFile as any),
        CLOUDINARY.FOLDER_CHECKIN,
        setPhotoUploading
      );
      setPhotoUri(url);
      lastUploadedUrlRef.current = url;
    } catch (e: any) {
      Alert.alert("Upload failed", e?.message || "Please try again.");
    }
  };

  /* ---------- Handle check-in ---------- */
  const onCheckIn = async () => {
    const today = new Date();
    const todayStr = ymd(today);
    if (!uid || !cid) return;

    try {
      // ensure userChallenge doc exists
      const ref = doc(db, "userChallenges", uid, "active", cid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          title,
          totalDays: totalDaysNum,
          progress: 0,
          reward: "",
          cover: typeof params.cover === "string" ? params.cover : "",
          category: category || (typeof params.category === "string" ? params.category : ""),
          challengeId: cid,
          joinedAt: serverTimestamp(),
          status: "active",
          checkins: [],
        });
      }

      // write today's check-in
      const photoToSave = photoUri || lastUploadedUrlRef.current || "";
      await updateDoc(ref, {
        checkins: arrayUnion(todayStr),
        lastNote: note || "",
        lastPhoto: photoToSave,
        lastCheckinAt: serverTimestamp(),
      });

      // recompute progress after write
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

      // local UI updates
      setProgressPct(pct);
      setCheckedToday(true);
      if (!markedDays.includes(today.getDate())) {
        setMarkedDays((prev) => [...prev, today.getDate()]);
      }

      // finished
      if (list.length >= td) {
        await issueRewardIfEligible({
          uid,
          cid,
          rewardName,
          rewardSubtitle,
          rewardValue,
          rewardDesc,
          rewardValidUntil,
          logoUri: typeof params.cover === "string" ? params.cover : "",
        });

        router.replace({
          pathname: "/Challenge/completedChallenge",
          params: {
            challengeId: cid,
            dateISO: today.toISOString(),
            title,
            totalDays: String(totalDaysNum),
            joined: String(joined),
            category: category || (typeof params.category === "string" ? params.category : ""),
          },
        });
      } else {
        Alert.alert("Nice!", "Today's check-in is saved.");
      }
    } catch (e: any) {
      Alert.alert("Check-in Error", e?.message || "Failed to check in.");
    }
  };

  const remaining = Math.max(0, totalDaysNum - Math.round((progressPct / 100) * totalDaysNum));
  const locked = checkedToday;

  /* ---------- Render ---------- */
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      {/* Header */}
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
        {/* Progress card */}
        <View style={[styles.cardSoft, SHADOW]}>
          <Text style={styles.titleBold}>{title}</Text>

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

        {/* Coupon-style Reward */}
        {(rewardName || rewardSubtitle || rewardValue || rewardDesc || rewardValidUntil) && (
          <CouponCard
            amountText={rewardValue || "¥5"}
            ruleText={rewardName || rewardSubtitle || "Available on orders over 500"}
            validityText={rewardValidUntil ? formatValidUntil(rewardValidUntil) : undefined}
          />
        )}

        {/* Calendar */}
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

          {/* Check-in inputs */}
          <Text style={[styles.smallBold, { marginTop: 18 }]}>Today’s Check-in</Text>
          <Text style={[styles.label, { marginTop: 12 }]}>Notes (Optional)</Text>
          <View style={[styles.inputBox, SHADOW]}>
            <TextInput
              value={note}
              onChangeText={locked ? undefined : setNote}
              editable={!locked}
              placeholder="How did it go? Share your progress..."
              placeholderTextColor="#9CA3AF"
              multiline
              style={styles.input}
            />
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Add photo (Optional)</Text>
          <Pressable
            onPress={onPickPhoto}
            disabled={locked || photoUploading}
            style={[styles.photoBox, SHADOW]}
          >
            {photoLocalPreview || photoUri ? (
              <Image
                source={{ uri: photoLocalPreview || (photoUri as string) }}
                style={styles.photo}
              />
            ) : (
              <View style={styles.photoInner}>
                <Ionicons name="image-outline" size={36} color="#9CA3AF" />
                <Text style={styles.photoHint}>Tap to add photo</Text>
              </View>
            )}
          </Pressable>
          {photoUploading ? (
            <View
              style={{
                marginTop: 6,
                alignSelf: "flex-start",
                backgroundColor: "#3b5aa9",
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>Uploading…</Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.btn, (locked || photoUploading) && { backgroundColor: "#A1A1AA" }]}
            onPress={locked || photoUploading ? undefined : onCheckIn}
            disabled={locked || photoUploading}
          >
            <Text style={styles.btnText}>
              {locked ? "checked in" : photoUploading ? "uploading…" : "check in"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
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
  cardSoft: {
    backgroundColor: "#EAF7EF",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  calendarCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 16,
    marginTop: 14,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowCenter: { flexDirection: "row", alignItems: "center", gap: 6 },
  titleBold: { color: TEXT_DARK, fontWeight: "800", fontSize: 20 },
  metaText: { color: TEXT_DARK, marginLeft: 6, fontWeight: "600" },
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
  monthTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT_DARK,
    marginTop: 6,
  },
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
  dayBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dayBubbleMarked: { backgroundColor: TEXT_BLUE_DEEP },
  dayBubbleToday: { backgroundColor: BLUE_PROGRESS },
  dayText: { color: TEXT_DARK, fontWeight: "700" },
  label: { color: TEXT_DARK, fontWeight: "700" },
  inputBox: {
    borderRadius: 12,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
  btnText: {
    color: "#fff",
    fontWeight: "800",
    textTransform: "lowercase",
    fontSize: 16,
  },
});
