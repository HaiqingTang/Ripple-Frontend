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
import * as ImagePicker from "expo-image-picker";
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

/* ---------- Colors ---------- */
const BG = "#CFE0FF";
const CARD = "#FFFFFF";
const LEMON = "#FFF7C8";
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

/* ---------- Cloudinary settings ---------- */
const CLOUDINARY = {
  CLOUD_NAME: "dwo2o5q8y",
  UPLOAD_PRESET: "meetup_unsigned",
  FOLDER_CHECKIN: "challenge_checkins",
};

/* ---------- Helpers ---------- */
type DayCell = { day: number | null; isToday: boolean };

const ymd = (d = new Date()) => {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

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

/* ---------- Types ---------- */
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

/* ---------- Component ---------- */
export default function ChallengeCheckin() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Route params
  const params = useLocalSearchParams<{
    challengeId?: string;
    category?: string;
    title?: string;
    totalDays?: string;
    cover?: string;
    joined?: string;
  }>();

  // Params -> state
  const routeCid =
    typeof params.challengeId === "string" && params.challengeId.trim()
      ? params.challengeId
      : "";
  const [cid] = useState(routeCid);
  const [category, setCategory] = useState(
    typeof params.category === "string" ? params.category : ""
  );

  // Challenge meta & progress
  const [title, setTitle] = useState(params.title || "Daily 10k steps");
  const [totalDaysNum, setTotalDaysNum] = useState(
    Math.max(1, Number(params.totalDays || 20) || 20)
  );
  const [joined, setJoined] = useState(Math.max(0, Number(params.joined ?? 0) || 0));
  const [progressPct, setProgressPct] = useState(0);
  const [checkedToday, setCheckedToday] = useState(false);

  // Check-in inputs
  const [note, setNote] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null); // Cloudinary URL after upload
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoLocalPreview, setPhotoLocalPreview] = useState<string | null>(null);
  const [photoMime, setPhotoMime] = useState<string | null>(null);
  const [photoWebFile, setPhotoWebFile] = useState<File | null>(null);

  // Reward (from public challenge doc)
  const [rewardName, setRewardName] = useState("");
  const [rewardSubtitle, setRewardSubtitle] = useState("");
  const [rewardValue, setRewardValue] = useState("");
  const [rewardDesc, setRewardDesc] = useState("");
  const [rewardValidUntil, setRewardValidUntil] = useState("");

  // Calendar state
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

  const formatValidUntil = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const months = [
      "January","February","March","April","May","June","July",
      "August","September","October","November","December",
    ];
    const dd = String(d.getDate()).padStart(2, "0");
    return `Valid until ${dd} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  /* ---------- Real-time user challenge sync ---------- */
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid || !cid) return;

    const ref = doc(db, "userChallenges", uid, "active", cid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) return;
        const d = snap.data() as UserChallengeDoc;

        if (d.title) setTitle(d.title);
        if (typeof d.totalDays === "number" && d.totalDays > 0)
          setTotalDaysNum(d.totalDays);
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

        // Checked in on the same day: Fill in the lastNote/lastPhoto in the main document
        if (didCheckToday) {
          if (typeof d.lastNote === "string") setNote(d.lastNote);
          if (typeof d.lastPhoto === "string" && d.lastPhoto) {
            setPhotoUri(d.lastPhoto);
            setPhotoLocalPreview(null);
          }
        }

        // Mark the check-in days for this month
        const selected = list
          .map((s) => new Date(s))
          .filter(
            (x) =>
              x.getFullYear() === displayYear && x.getMonth() === displayMonth
          )
          .map((x) => x.getDate());
        setMarkedDays(selected);
      },
      (err) => console.error("realtime sync error:", err)
    );

    return () => unsub();
  }, [cid, category, totalDaysNum, displayYear, displayMonth]);

  /* ---------- Subscribe to public challenge for reward/joined ---------- */
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

  /* ---------- Image picking & upload ---------- */
  const uploadToCloudinary = async (
    localUri: string | null,
    webFile: File | null,
    mime: string | null,
    folder: string,
    setUploading: (b: boolean) => void,
    setUploadedUrl?: (u: string) => void
  ): Promise<string> => {
    if (!localUri) return "";

    try {
      setUploading(true);

      const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY.CLOUD_NAME}/image/upload`;
      const form = new FormData();
      form.append("upload_preset", CLOUDINARY.UPLOAD_PRESET);
      form.append("folder", folder);

      const filename = `${folder}_${auth.currentUser?.uid || "anon"}_${Date.now()}.jpg`;
      const mt = mime || "image/jpeg";

      if (Platform.OS === "web") {
        let fileToSend: Blob | File | null = webFile;
        if (!fileToSend) {
          const resp = await fetch(localUri);
          fileToSend = await resp.blob();
        }
        form.append("file", fileToSend as any, filename);
      } else {
        form.append("file", { uri: localUri, name: filename, type: mt } as any);
      }

      const res = await fetch(endpoint, { method: "POST", body: form as any });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Cloudinary upload failed: ${text}`);
      }
      const data = await res.json();
      const url = data.secure_url as string;
      if (setUploadedUrl) setUploadedUrl(url);
      return url;
    } finally {
      setUploading(false);
    }
  };

  // Pick one image from gallery
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
    setPhotoMime((asset as any)?.mimeType || "image/jpeg");
    setPhotoWebFile(Platform.OS === "web" ? (asset as any)?.file ?? null : null);

    return {
      localUri: asset.uri as string,
      mime: (asset as any)?.mimeType || "image/jpeg",
      webFile: Platform.OS === "web" ? (asset as any)?.file ?? null : null,
    };
  };

  const onPickPhoto = async () => {
    // After clocking in that day, it was locked and no longer allowed to select images
    if (checkedToday) return;

    const picked = await pickOneImage();
    if (!picked) return;

    try {
      const url = await uploadToCloudinary(
        picked.localUri,
        picked.webFile,
        picked.mime,
        CLOUDINARY.FOLDER_CHECKIN,
        setPhotoUploading,
        (u) => setPhotoUri(u)
      );

      if (!url) {
        Alert.alert("Upload failed", "Could not get an image URL from Cloudinary.");
        return;
      }
    } catch (e: any) {
      console.error("check-in photo upload error:", e);
      Alert.alert("Upload error", e?.message || "Could not upload the image.");
    }
  };

  /* ---------- Handle check-in (only updates main doc) ---------- */
  const onCheckIn = async () => {
    const today = new Date();
    const todayStr = ymd(today);
    const uid = auth.currentUser?.uid;
    if (!uid || !cid) return;

    try {
      const ref = doc(db, "userChallenges", uid, "active", cid);
      const snap = await getDoc(ref);

      // Create shell doc if not exists
      if (!snap.exists()) {
        await setDoc(ref, {
          title,
          totalDays: totalDaysNum,
          progress: 0,
          reward: "",
          cover: params.cover || "",
          category: category || params.category || "",
          challengeId: cid,
          joinedAt: serverTimestamp(),
          status: "active",
          checkins: [],
        });
      }

      // Only update existing fields in the main document
      await updateDoc(ref, {
        checkins: arrayUnion(todayStr),
        lastNote: note || "",
        lastPhoto: photoUri || "",
        lastCheckinAt: serverTimestamp(),
      });

      const latest = await getDoc(ref);
      const data = (latest.data() || {}) as UserChallengeDoc;
      const list = (data.checkins ?? []).filter(Boolean);
      const td = Math.max(1, Number(data.totalDays ?? totalDaysNum) || totalDaysNum);
      const pct = Math.min(100, Math.round((list.length / td) * 100));

      await updateDoc(ref, {
        daysCompleted: list.length,
        progress: pct,
        ...(list.length >= td
          ? { status: "completed", completedAt: serverTimestamp() }
          : {}),
      });

      // Distribute rewards
      try {
        if (list.length >= td) {
          const latest2 = await getDoc(ref);
          const latestData = (latest2.data() || {}) as any;

          if (!latestData.rewardIssued) {
            const catForPub =
              latestData.category ||
              category ||
              (typeof params.category === "string" ? params.category : "") ||
              "";

            let rc: any = null;
            if (catForPub) {
              const pubRef = doc(db, "challenges", catForPub, "items", cid);
              const pubSnap = await getDoc(pubRef);
              if (pubSnap.exists()) {
                rc = (pubSnap.data() as any)?.rewardConfig || null;
              }
            }

            const rewardRef = doc(db, "users", uid, "rewards", cid);
            const rewardSnap = await getDoc(rewardRef);
            if (!rewardSnap.exists()) {
              await setDoc(rewardRef, {
                title: rc?.name || title || "Challenge Reward",
                subtitle: rc?.vendor || "",
                description: rc?.description || "",
                value: rc?.value || "",
                validUntil: rc?.validUntil || "",
                logoUri: rc?.logoUri || "",
                challengeId: cid,
                category: catForPub,
                redeemed: false,
                terms: [
                  "One-time redemption",
                  rc?.validUntil ? `Valid until ${rc.validUntil}` : undefined,
                ].filter(Boolean),
                issuedAt: serverTimestamp(),
              });
            }

            await updateDoc(ref, { rewardIssued: true });
          }
        }
      } catch (e) {
        console.warn("Issue reward failed:", e);
      }

      setProgressPct(pct);
      setCheckedToday(true);
      if (!markedDays.includes(today.getDate()))
        setMarkedDays((prev) => [...prev, today.getDate()]);

      if (list.length >= td) {
        router.push({
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
      console.error("check-in error:", e);
      Alert.alert("Check-in Error", e?.message || "Failed to check in.");
    }
  };

  const remaining = Math.max(
    0,
    totalDaysNum - Math.round((progressPct / 100) * totalDaysNum)
  );

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

        {/* Reward card */}
        {(rewardName ||
          rewardSubtitle ||
          rewardValue ||
          rewardDesc ||
          rewardValidUntil) && (
          <View style={[styles.rewardCard, SHADOW]}>
            <Text style={styles.rewardTitle}>
              {rewardName ? `Reward: ${rewardName}` : "Reward"}
            </Text>
            {rewardSubtitle && (
              <Text style={[styles.small, { marginTop: 4 }]}>{rewardSubtitle}</Text>
            )}
            <View style={styles.rewardRow}>
              {rewardValue && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{rewardValue}</Text>
                </View>
              )}
              <View style={styles.illus} />
            </View>
            {(rewardDesc || rewardValidUntil) && (
              <Text style={[styles.small, { marginTop: 10 }]}>
                {rewardDesc}
                {rewardDesc && rewardValidUntil ? "\n" : ""}
                {rewardValidUntil ? formatValidUntil(rewardValidUntil) : ""}
              </Text>
            )}
          </View>
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
            onPress={locked || photoUploading ? undefined : onPickPhoto}
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
  rewardCard: {
    backgroundColor: LEMON,
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
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
  btnText: {
    color: "#fff",
    fontWeight: "800",
    textTransform: "lowercase",
    fontSize: 16,
  },
});
