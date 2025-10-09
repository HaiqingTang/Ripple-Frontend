import React, { useMemo, useState } from "react";
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
} from "react-native";
import type { KeyboardTypeOptions } from "react-native"; // 类型引入
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { db, auth } from "../../../firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

type ThemeKey = "fitness" | "nutrition" | "tech" | "art" | "meditation";
type RewardType = "badge" | "voucher" | "points" | "other";

const THEME_META: Record<
  ThemeKey,
  { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  fitness: { title: "Fitness", subtitle: "Move daily, get stronger, feel amazing.", icon: "barbell-outline" },
  nutrition: { title: "Nutrition", subtitle: "Healthier plan, healthier you", icon: "restaurant-outline" },
  tech: { title: "Tech", subtitle: "Make tech simple, make ideas real.", icon: "hardware-chip-outline" },
  art: { title: "Art", subtitle: "Create daily, explore styles, find your voice.", icon: "color-palette-outline" },
  meditation: { title: "Meditation", subtitle: "Calm mind, steady focus, gentle practice", icon: "leaf-outline" },
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

// 默认 reward terms（与详情页一致）
const DEFAULT_REWARD_TERMS = [
  "Redeemable at participating locations.",
  "Not valid with other discounts or promotions.",
  "No cash value.",
];

export default function CreateChallenge() {
  const router = useRouter();

  // challenge 基本信息
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState<ThemeKey | null>(null);
  const [capacity, setCapacity] = useState<string>("");
  const [duration, setDuration] = useState<string>(""); // days

  // reward setup — 基础 + 扩展
  const [rewardName, setRewardName] = useState("");
  const [rewardDesc, setRewardDesc] = useState("");
  const [rewardType, setRewardType] = useState<RewardType | null>(null);
  const [rewardValue, setRewardValue] = useState("");
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [rewardVendor, setRewardVendor] = useState("");             // 副标题
  const [rewardLogoUri, setRewardLogoUri] = useState("");           // 覆盖默认封面
  const [rewardTermsText, setRewardTermsText] = useState("");       // 多行 -> terms[]
  const [rewardQuantity, setRewardQuantity] = useState<string>(""); // 库存/上限
  const [rewardExpiryDays, setRewardExpiryDays] = useState<string>(""); // 奖励有效期（天）
  const [rewardQrPayload, setRewardQrPayload] = useState("");       // 固定二维码载荷

  const TITLE_MAX = 30;
  const DESC_MAX = 360;

  const isValid = useMemo(() => {
    return (
      title.trim().length > 0 &&
      description.trim().length > 0 &&
      theme !== null &&
      Number(capacity) > 0 &&
      Number(duration) > 0 &&
      rewardName.trim().length > 0 &&
      rewardType !== null
    );
  }, [title, description, theme, capacity, duration, rewardName, rewardType]);

  // 工具：根据天数计算 ISO
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

  // 发布
  const onSubmit = async () => {
    if (!isValid) {
      Alert.alert("Incomplete", "Please fill all required fields before publishing.");
      return;
    }

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert("Error", "Please log in before creating a challenge.");
        return;
      }

      // 选择封面：若输入了 rewardLogoUri 就优先用；否则用主题预设
      const themeCover =
        theme === "nutrition"
          ? "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=640&q=80&auto=format&fit=crop"
          : theme === "fitness"
          ? "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=640&auto=format&fit=crop"
          : "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop";
      const cover = rewardLogoUri.trim() || themeCover;

      // 计算奖励有效期：优先使用 rewardExpiryDays；否则用 challenge 的 duration
      const rewardDays = Number(rewardExpiryDays) > 0 ? Number(rewardExpiryDays) : Number(duration);
      const validUntilISO = toValidUntilISO(rewardDays);

      const terms = parseTerms();
      const quantityNum = Math.max(0, Number(rewardQuantity) || 0);

      // 1) 创建 challenge 文档（公开配置）
      const challengeRef = doc(collection(db, "challenges", theme!, "items"));
      await setDoc(challengeRef, {
        // 基本字段
        title: title.trim(),
        desc: description.trim(),
        category: theme,
        creatorId: uid,
        capacity: Number(capacity),
        days: Number(duration),
        joined: 0,
        active: true,
        cover,
        createdAt: serverTimestamp(),

        // 只用 rewardConfig
        rewardConfig: {
          name: rewardName.trim(),
          description: rewardDesc.trim(),
          type: rewardType,
          value: rewardValue.trim(),
          vendor: rewardVendor.trim(),
          logoUri: cover,
          terms,
          quantity: quantityNum,
          issuedCount: 0,
          qrPayload: rewardQrPayload.trim() || null,
          validUntil: validUntilISO,
        },
      });

      Alert.alert("Published", "Your challenge has been published.", [
        {
          text: "OK",
          onPress: () =>
            router.replace({
              pathname: "/(tabs)/Challenge/nutritionChallengeList",
              params: { category: theme! },  // ← 回到对应分类
            } as any),
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
      {/* header */}
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

          {/* Theme */}
          <FieldLabel text="Theme" top={16} />
          <View style={{ gap: 10 }}>
            {(Object.keys(THEME_META) as ThemeKey[]).map((key) => {
              const meta = THEME_META[key];
              const active = theme === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setTheme(key)}
                  style={[
                    styles.themeCard,
                    active && { borderColor: COLORS.activeStroke },
                  ]}
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
            onChangeText={(t) => setCapacity(t.replace(/[^\d]/g, ""))}
            placeholder="Enter max capacity"
            keyboardType="number-pad"
          />

          {/* Duration */}
          <FieldLabel text="Duration (days)" top={16} />
          <InputBox
            value={duration}
            onChangeText={(t) => setDuration(t.replace(/[^\d]/g, ""))}
            placeholder="e.g., 21"
            keyboardType="number-pad"
          />

          {/* Reward Setup */}
          <View style={{ marginTop: 18, marginBottom: 6, flexDirection: "row", alignItems: "baseline", gap: 6 }}>
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
            <Ionicons name={showTypeMenu ? "chevron-up" : "chevron-down"} size={18} color={COLORS.titleBlue} />
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

          <FieldLabel text="Logo URL (optional)" top={10} />
          <InputBox
            value={rewardLogoUri}
            onChangeText={setRewardLogoUri}
            placeholder="https://..."
            autoCapitalize="none"
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
            placeholder={"Redeemable at participating locations.\nNot valid with other discounts or promotions.\nNo cash value."}
            minHeight={96}
          />

          <FieldLabel text="QR / Barcode payload (optional)" top={10} />
          <InputBox
            value={rewardQrPayload}
            onChangeText={setRewardQrPayload}
            placeholder="If set, QR code will encode this exact string"
          />

          {/* Publish */}
          <Pressable
            style={[styles.submitBtn, disabled && styles.submitBtnDisabled]}
            onPress={onSubmit}
            disabled={disabled}
            hitSlop={8}
          >
            <Text style={[styles.submitText, disabled && styles.submitTextDisabled]}>
              Publish
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** ——— Reusable UI ——— */
function FieldLabel({ text, top = 8 }: { text: string; top?: number }) {
  return <Text style={[styles.sectionTitle, { marginTop: top }]}>{text}</Text>;
}

// 带类型的 InputBox，避免 onChangeText 的参数隐式 any
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
      {typeof counter === "number" ? (
        <Text style={styles.counter}>{counter}</Text>
      ) : null}
    </View>
  );
}

// 带类型的 TextareaBox
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
      {typeof counter === "number" ? (
        <Text style={styles.counter}>{counter}</Text>
      ) : null}
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
