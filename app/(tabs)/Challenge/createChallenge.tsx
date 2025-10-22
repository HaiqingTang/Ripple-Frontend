import React, { useMemo, useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Alert,
  Image,
} from "react-native";
import type { KeyboardTypeOptions } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { db, auth } from "../../../firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { uploadToCloudinary } from "../../../utils/upload";

type ThemeKey = "fitness" | "nutrition" | "tech" | "art" | "meditation";
type RewardType = "badge" | "voucher" | "points" | "other";

/** Theme metadata (for selection cards) */
const THEME_META: Record<
  ThemeKey,
  { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  fitness: {
    title: "Fitness",
    subtitle: "Move daily, get stronger, feel amazing.",
    icon: "barbell-outline",
  },
  nutrition: {
    title: "Nutrition",
    subtitle: "Healthy plate, healthier you",
    icon: "restaurant-outline",
  },
  tech: {
    title: "Tech",
    subtitle: "Make tech simple, make ideas real.",
    icon: "hardware-chip-outline",
  },
  art: {
    title: "Art",
    subtitle: "Create daily, explore styles, find your voice.",
    icon: "color-palette-outline",
  },
  meditation: {
    title: "Meditation",
    subtitle: "Calm mind, steady focus, gentle practice",
    icon: "leaf-outline",
  },
};

/** Default cover image for each theme */
const THEME_COVERS: Record<ThemeKey, string> = {
  meditation:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
  nutrition:
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop",
  tech:
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  fitness:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
  art:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop",
};

const COLORS = {
  pageBg: "#C6DBFA",
  titleBlue: "#3C7BD6",
  smallCardBg: "#D6E6FD",
  white: "#FFFFFF",
  placeholder: "#6F7EA6",
  text: "#1F2B5C",
  stroke: "#C9D7FF",
  activeStroke: "#5C95E9",
  primary: "#5C95E9",
  helper: "#6F7EA6",
};

// Default reward terms
const DEFAULT_REWARD_TERMS = [
  "Redeemable at participating locations.",
  "Not valid with other discounts or promotions.",
  "No cash value.",
];

export default function CreateChallenge() {
  const router = useRouter();

  // Basic challenge info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState<ThemeKey | null>(null);
  const [capacity, setCapacity] = useState<string>("");
  const [duration, setDuration] = useState<string>("");

  // Cover (gallery import + Cloudinary)
  const [coverLocalUri, setCoverLocalUri] = useState<string | null>(null);
  const [coverMime, setCoverMime] = useState<string | null>(null);
  const [coverWebFile, setCoverWebFile] = useState<File | null>(null);
  const [coverUploadedUrl, setCoverUploadedUrl] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);

  // Reward logo (gallery import + Cloudinary)
  const [rewardLocalUri, setRewardLocalUri] = useState<string | null>(null);
  const [rewardMime, setRewardMime] = useState<string | null>(null);
  const [rewardWebFile, setRewardWebFile] = useState<File | null>(null);
  const [rewardUploadedUrl, setRewardUploadedUrl] = useState<string | null>(null);
  const [rewardUploading, setRewardUploading] = useState(false);

  // Reward configuration
  const [rewardName, setRewardName] = useState("");
  const [rewardDesc, setRewardDesc] = useState("");
  const [rewardType, setRewardType] = useState<RewardType | null>(null);
  const [rewardValue, setRewardValue] = useState("");
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [rewardVendor, setRewardVendor] = useState("");
  const [rewardTermsText, setRewardTermsText] = useState("");
  const [rewardQuantity, setRewardQuantity] = useState<string>("");
  const [rewardExpiryDays, setRewardExpiryDays] = useState<string>("");

  const TITLE_MAX = 30;
  const DESC_MAX = 360;

  const [coverCancelling, setCoverCancelling] = useState(false);
  const [rewardCancelling, setRewardCancelling] = useState(false);

  const coverIgnoreRef = useRef(false);
  const rewardIgnoreRef = useRef(false);

  const toPositiveInt = (v: string | number | null | undefined) => {
    const n = typeof v === "string" ? parseInt(v, 10) : Number(v);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const isValid = useMemo(() => {
    const cap = toPositiveInt(capacity);
    const dur = toPositiveInt(duration);
    return (
      title.trim().length > 0 &&
      description.trim().length > 0 &&
      theme !== null &&
      cap > 0 &&
      dur > 0 &&
      rewardName.trim().length > 0 &&
      rewardType !== null
    );
  }, [title, description, theme, capacity, duration, rewardName, rewardType]);

  const toValidUntilISO = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + Math.max(1, days));
    return d.toISOString();
  };

  const parseTerms = (): string[] => {
    const raw = rewardTermsText.trim();
    if (!raw) return DEFAULT_REWARD_TERMS;
    return raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 12);
  };

  /** Pick one image */
  const pickOneImage = async (
    setLocalUri: (uri: string | null) => void,
    setMime: (m: string | null) => void,
    setWebFile: (f: File | null) => void,
    setUploadedUrl: (u: string | null) => void
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Media library access is needed to select an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      selectionLimit: 1,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
      base64: false,
    });

    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setLocalUri(asset.uri);
    setMime((asset as any)?.mimeType || "image/jpeg");
    setWebFile(Platform.OS === "web" ? (asset as any)?.file ?? null : null);
    setUploadedUrl(null);
  };

  async function uploadCoverImage(
    localUri: string | null,
    mime: string | null,
    webFile: File | Blob | null,
    setUploading: (b: boolean) => void
  ): Promise<string> {
    if (!auth.currentUser?.uid) throw new Error("Please sign in to upload.");
    if (!localUri) return "";
    return await uploadToCloudinary(localUri, mime, webFile,"challenge_covers", setUploading);
  }

  async function uploadRewardImage(
    localUri: string | null,
    mime: string | null,
    webFile: File | Blob | null,
    setUploading: (b: boolean) => void
  ): Promise<string> {
    if (!auth.currentUser?.uid) throw new Error("Please sign in to upload.");
    if (!localUri) return "";
    return await uploadToCloudinary(localUri, mime, webFile, "challenge_rewards", setUploading);
  }

  // Submit handler
  const onSubmit = async () => {
    if (!isValid) {
      Alert.alert("Incomplete", "Please fill all required fields before publishing.");
      return;
    }

    const capInt = toPositiveInt(capacity);
    const durInt = toPositiveInt(duration);
    if (capInt === 0 || durInt === 0) {
      Alert.alert("Invalid input", "Capacity and Duration must be positive integers.");
      return;
    }

    const titleTrim = title.trim();
    const descTrim = description.trim();
    if (titleTrim.length === 0 || descTrim.length === 0) {
      Alert.alert("Incomplete", "Title and Description cannot be empty.");
      return;
    }
    if (titleTrim.length > TITLE_MAX || descTrim.length > DESC_MAX) {
      Alert.alert("Too long", `Title ≤ ${TITLE_MAX} chars, description ≤ ${DESC_MAX} chars.`);
      return;
    }

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert("Error", "Please log in before creating a challenge.");
        return;
      }
      if (!theme) {
        Alert.alert("Error", "Please select a theme.");
        return;
      }

      // ✅ 上传封面
      let finalCoverUrl = coverUploadedUrl || "";
      if (!finalCoverUrl && coverLocalUri) {
        finalCoverUrl = await uploadCoverImage(coverLocalUri, coverMime, coverWebFile, setCoverUploading);
        setCoverUploadedUrl(finalCoverUrl);
      }

      let finalRewardLogoUrl = rewardUploadedUrl || "";
      if (!finalRewardLogoUrl && rewardLocalUri) {
        finalRewardLogoUrl = await uploadRewardImage(rewardLocalUri, rewardMime, rewardWebFile, setRewardUploading);
        setRewardUploadedUrl(finalRewardLogoUrl);
      }

      const cover = finalCoverUrl || (theme ? THEME_COVERS[theme] : THEME_COVERS["nutrition"]);
      const rewardLogo = finalRewardLogoUrl || cover;

      const rewardDaysInt = toPositiveInt(rewardExpiryDays);
      const fallbackDur = toPositiveInt(duration);
      const finalRewardDays = rewardDaysInt > 0 ? rewardDaysInt : fallbackDur;
      if (finalRewardDays === 0) {
        Alert.alert("Invalid reward expiry", "Reward expiry days or duration must be a positive integer.");
        return;
      }

      const validUntilISO = toValidUntilISO(finalRewardDays);
      const terms = parseTerms();
      const quantityNum = Math.max(0, Number(rewardQuantity) || 0);

      const challengeRef = doc(collection(db, "challenges", theme, "items"));
      await setDoc(challengeRef, {
        title: titleTrim,
        desc: descTrim,
        category: theme,
        creatorId: uid,
        capacity: capInt,
        days: durInt,
        joined: 0,
        active: true,
        cover,
        createdAt: serverTimestamp(),
        rewardConfig: {
          name: rewardName.trim(),
          description: rewardDesc.trim(),
          type: rewardType,
          value: rewardValue.trim(),
          vendor: rewardVendor.trim(),
          logoUri: rewardLogo,
          terms,
          quantity: quantityNum,
          issuedCount: 0,
          validUntil: validUntilISO,
        },
      });

      Alert.alert("Published", "Your challenge has been published.", [
        {
          text: "OK",
          onPress: async () => {
            await new Promise((r) => setTimeout(r, 300));
            router.replace({
              pathname: "/(tabs)/Challenge/nutritionChallengeList",
              params: { category: theme },
            } as any);
          },
        },
      ]);
    } catch (e: any) {
      console.error("Error creating challenge:", e);
      Alert.alert("Error", e?.message || "Failed to publish challenge.");
    }
  };

  const disabled = !isValid;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4, borderRadius: 8 }}>
          <Ionicons name="chevron-back" size={22} color={COLORS.titleBlue} />
        </Pressable>
        <Text style={styles.headerTitle}>create challenge</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Title */}
          <FieldLabel text="Title" />
          <InputBox
            value={title}
            onChangeText={(t) => setTitle(t.slice(0, TITLE_MAX))}
            placeholder="Enter your challenge title here"
            counter={TITLE_MAX - title.length}
          />

          {/* Description */}
          <FieldLabel text="Description" top={16} />
          <TextareaBox
            value={description}
            onChangeText={(t) => setDescription(t.slice(0, DESC_MAX))}
            placeholder="Enter your challenge description here"
            counter={DESC_MAX - description.length}
          />

          {/* Theme selection */}
          <FieldLabel text="Theme" top={16} />
          <View style={{ gap: 10 }}>
            {(Object.keys(THEME_META) as ThemeKey[]).map((key) => {
              const meta = THEME_META[key];
              const active = theme === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setTheme(key)}
                  style={[styles.themeCard, active && { borderColor: COLORS.activeStroke }]}
                  hitSlop={8}
                >
                  <View style={styles.themeRow}>
                    <Ionicons
                      name={meta.icon}
                      size={20}
                      color={active ? COLORS.activeStroke : COLORS.titleBlue}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.themeTitle}>{meta.title}</Text>
                      <Text style={styles.themeSub}>{meta.subtitle}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Capacity */}
          <FieldLabel text="Capacity" top={18} />
          <InputBox
            value={capacity}
            onChangeText={(t) => setCapacity(t.replace(/[^\d]/g, "").replace(/^0+/, ""))}
            placeholder="Enter max capacity"
            keyboardType="number-pad"
          />

          {/* Duration */}
          <FieldLabel text="Duration (days)" top={16} />
          <InputBox
            value={duration}
            onChangeText={(t) => setDuration(t.replace(/[^\d]/g, "").replace(/^0+/, ""))}
            placeholder="e.g., 21"
            keyboardType="number-pad"
          />

          {/* Challenge cover upload */}
          <FieldLabel text="Challenge cover" top={18} />
          <View style={styles.imageBlock}>
            <View style={styles.imageBox}>
              <Image
                source={{
                  uri:
                    coverLocalUri ||
                    coverUploadedUrl ||
                    (theme ? THEME_COVERS[theme] : THEME_COVERS["nutrition"]),
                }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <Pressable
                onPress={async () => {
                  coverIgnoreRef.current = false;
                  await pickOneImage(setCoverLocalUri, setCoverMime, setCoverWebFile, setCoverUploadedUrl);
                }}
                style={styles.imageBtn}
              >
                <Text style={styles.imageBtnText}>
                  {coverLocalUri ? "Change Image" : "Select from Gallery"}
                </Text>
              </Pressable>
              {coverUploading && (
                <>
                  <View style={styles.imageUploadingBadge}>
                    <Text style={{ color: "white", fontWeight: "700" }}>Uploading…</Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      coverIgnoreRef.current = true;
                      setCoverUploading(false);
                    }}
                    style={[styles.imageBtn, { backgroundColor: "#fca5a5" }]}
                  >
                    <Text style={[styles.imageBtnText, { color: "#7f1d1d" }]}>Cancel</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>

          {/* Reward logo upload */}
          <FieldLabel text="Reward logo" top={18} />
          <View style={styles.imageBlock}>
            <View style={[styles.imageBox, { height: 120 }]}>
              <Image
                source={{
                  uri:
                    rewardLocalUri ||
                    rewardUploadedUrl ||
                    coverUploadedUrl ||
                    (theme ? THEME_COVERS[theme] : THEME_COVERS["nutrition"]),
                }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <Pressable
                onPress={async () => {
                  rewardIgnoreRef.current = false;
                  await pickOneImage(
                    setRewardLocalUri,
                    setRewardMime,
                    setRewardWebFile,
                    setRewardUploadedUrl
                  );
                }}
                style={styles.imageBtn}
              >
                <Text style={styles.imageBtnText}>
                  {rewardLocalUri ? "Change Image" : "Select from Gallery"}
                </Text>
              </Pressable>
              {rewardUploading && (
                <>
                  <View style={styles.imageUploadingBadge}>
                    <Text style={{ color: "white", fontWeight: "700" }}>Uploading…</Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      rewardIgnoreRef.current = true;
                      setRewardUploading(false);
                    }}
                    style={[styles.imageBtn, { backgroundColor: "#fca5a5" }]}
                  >
                    <Text style={[styles.imageBtnText, { color: "#7f1d1d" }]}>Cancel</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>

          {/* Reward setup */}
          <View
            style={{
              marginTop: 18,
              marginBottom: 6,
              flexDirection: "row",
              alignItems: "baseline",
              gap: 6,
            }}
          >
            <Text style={styles.sectionTitle}>Reward Setup</Text>
            <Text style={{ color: COLORS.primary, fontWeight: "700" }}>＊</Text>
          </View>

          <InputBox
            value={rewardName}
            onChangeText={setRewardName}
            placeholder="Reward name (e.g., Gym Voucher)"
          />

          <TextareaBox
            value={rewardDesc}
            onChangeText={setRewardDesc}
            placeholder="Describe the reward in detail"
            minHeight={90}
          />

          <FieldLabel text="Vendor / Subtitle" top={10} />
          <InputBox
            value={rewardVendor}
            onChangeText={setRewardVendor}
            placeholder="e.g., Fitness Nutrition Store"
          />

          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Type</Text>
          <Pressable
            onPress={() => setShowTypeMenu((s) => !s)}
            style={[styles.selectTrigger, showTypeMenu && { borderColor: COLORS.activeStroke }]}
            hitSlop={6}
          >
            <Text style={[styles.selectText, !rewardType && { color: COLORS.placeholder }]}>
              {rewardType ? rewardType : "Select reward type"}
            </Text>
            <Ionicons
              name={showTypeMenu ? "chevron-up" : "chevron-down"}
              size={18}
              color={COLORS.titleBlue}
            />
          </Pressable>
          {showTypeMenu && (
            <View style={styles.selectMenu}>
              {(["badge", "voucher", "points", "other"] as RewardType[]).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => {
                    setRewardType(t);
                    setShowTypeMenu(false);
                  }}
                  style={styles.selectItem}
                >
                  <Text style={styles.selectItemText}>{t}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Value</Text>
          <InputBox
            value={rewardValue}
            onChangeText={setRewardValue}
            placeholder="e.g., $25.00 / 100 points"
          />

          <FieldLabel text="Quantity / Stock (optional)" top={10} />
          <InputBox
            value={rewardQuantity}
            onChangeText={(t) => setRewardQuantity(t.replace(/[^\d]/g, ""))}
            placeholder="e.g., 100"
            keyboardType="number-pad"
          />

          <FieldLabel text="Reward expiry (days, optional)" top={10} />
          <InputBox
            value={rewardExpiryDays}
            onChangeText={(t) => setRewardExpiryDays(t.replace(/[^\d]/g, ""))}
            placeholder="Leave empty to use challenge duration"
            keyboardType="number-pad"
          />

          <FieldLabel text="Terms (one per line)" top={10} />
          <TextareaBox
            value={rewardTermsText}
            onChangeText={setRewardTermsText}
            placeholder={
              "Redeemable at participating locations.\nNot valid with other discounts or promotions.\nNo cash value."
            }
            minHeight={96}
          />

          {/* Publish */}
          <Pressable
            style={[styles.submitBtn, disabled && styles.submitBtnDisabled]}
            onPress={onSubmit}
            disabled={disabled || coverUploading || rewardUploading}
            hitSlop={8}
          >
            <Text style={[styles.submitText, disabled && styles.submitTextDisabled]}>
              {coverUploading || rewardUploading ? "Uploading…" : "Publish"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Reusable small UI components */
function FieldLabel({ text, top = 8 }: { text: string; top?: number }) {
  return <Text style={[styles.sectionTitle, { marginTop: top }]}>{text}</Text>;
}

type InputBoxProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  counter?: number;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};
function InputBox({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  counter,
  autoCapitalize,
}: InputBoxProps) {
  return (
    <View style={styles.inputWrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={styles.input}
      />
      {typeof counter === "number" ? <Text style={styles.counter}>{counter}</Text> : null}
    </View>
  );
}

type TextareaBoxProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  counter?: number;
  minHeight?: number;
};
function TextareaBox({
  value,
  onChangeText,
  placeholder,
  counter,
  minHeight = 120,
}: TextareaBoxProps) {
  return (
    <View style={styles.textareaWrap}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        style={[styles.input, { minHeight, textAlignVertical: "top" }]}
        multiline
      />
      {typeof counter === "number" ? <Text style={styles.counter}>{counter}</Text> : null}
    </View>
  );
}

const SHADOW =
  Platform.OS === "ios"
    ? { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } }
    : { elevation: 2 };

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pageBg },
  header: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.pageBg,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.titleBlue,
  },
  card: {
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    ...SHADOW,
  },
  sectionTitle: {
    marginHorizontal: 4,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.titleBlue,
  },
  inputWrap: {
    marginTop: 8,
    backgroundColor: COLORS.smallCardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textareaWrap: {
    marginTop: 8,
    backgroundColor: COLORS.smallCardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  input: { fontSize: 14, color: COLORS.text },
  counter: { position: "absolute", right: 10, top: 8, fontSize: 12, color: COLORS.helper },
  themeCard: {
    backgroundColor: COLORS.smallCardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    padding: 12,
  },
  themeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  themeTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  themeSub: { fontSize: 12, color: COLORS.helper, marginTop: 2 },
  selectTrigger: {
    marginTop: 8,
    backgroundColor: COLORS.smallCardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: { fontSize: 14, color: COLORS.text },
  selectMenu: {
    marginTop: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    overflow: "hidden",
    ...SHADOW,
  },
  selectItem: { paddingVertical: 12, paddingHorizontal: 12 },
  selectItemText: { fontSize: 14, color: COLORS.text },
  imageBlock: { marginTop: 8 },
  imageBox: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  imageBtn: {
    backgroundColor: "#cfe0ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  imageBtnText: { color: "#3b5aa9", fontWeight: "700" },
  imageUploadingBadge: {
    backgroundColor: "#3b5aa9",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  submitBtn: {
    marginTop: 22,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: { backgroundColor: "#5C95E9" },
  submitText: { fontSize: 16, fontWeight: "800", color: "#113D7C" },
  submitTextDisabled: { color: "#fff" },
});
