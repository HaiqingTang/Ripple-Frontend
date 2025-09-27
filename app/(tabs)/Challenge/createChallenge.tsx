// app/(tabs)/Challenge/createChallenge.tsx
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
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

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
  pageBg: "#C6DBFA",       // page + header background
  titleBlue: "#3C7BD6",    // big section titles + header title
  smallCardBg: "#D6E6FD",  // inputs / small cards
  white: "#FFFFFF",        // big content card
  placeholder: "#6F7EA6",
  text: "#1F2B5C",
  stroke: "#C9D7FF",
  activeStroke: "#5C95E9",
  primary: "#5C95E9",
  helper: "#6F7EA6",
};

export default function CreateChallenge() {
  const router = useRouter();

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState<ThemeKey | null>(null);
  const [capacity, setCapacity] = useState<string>("");
  const [duration, setDuration] = useState<string>(""); // days

  // reward setup
  const [rewardName, setRewardName] = useState("");
  const [rewardDesc, setRewardDesc] = useState("");
  const [rewardType, setRewardType] = useState<RewardType | null>(null);
  const [rewardValue, setRewardValue] = useState("");
  const [showTypeMenu, setShowTypeMenu] = useState(false);

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

  const onSubmit = () => {
    if (!isValid) return;
    const payload = {
      title: title.trim(),
      description: description.trim(),
      theme,
      capacity: Number(capacity),
      duration: Number(duration),
      reward: {
        name: rewardName.trim(),
        description: rewardDesc.trim(),
        type: rewardType,
        value: rewardValue.trim(),
      },
      created_at: new Date().toISOString(),
    };
    // TODO: integrate with backend
    // await api.post('/challenges', payload)
    router.back();
  };

  const disabled = !isValid;

  return (
    <SafeAreaView style={styles.safe}>
      {/* header area (flat rectangle, same as page bg) */}
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
        {/* big white content card */}
        <View style={styles.card}>
          {/* Title */}
          <FieldLabel text="Title" />
          <View style={styles.inputWrap}>
            <TextInput
              value={title}
              onChangeText={(t) => setTitle(t.slice(0, TITLE_MAX))}
              placeholder="Enter your challenge title here"
              placeholderTextColor={COLORS.placeholder}
              style={styles.input}
            />
            <Text style={styles.counter}>{TITLE_MAX - title.length}</Text>
          </View>

          {/* Description */}
          <FieldLabel text="Description" top={16} />
          <View style={styles.textareaWrap}>
            <TextInput
              value={description}
              onChangeText={(t) => setDescription(t.slice(0, DESC_MAX))}
              placeholder="Enter your challenge description here"
              placeholderTextColor={COLORS.placeholder}
              style={[styles.input, { minHeight: 120, textAlignVertical: "top" }]}
              multiline
            />
            <Text style={styles.counter}>{DESC_MAX - description.length}</Text>
          </View>

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
          <View style={styles.inputWrap}>
            <TextInput
              value={capacity}
              onChangeText={(t) => setCapacity(t.replace(/[^\d]/g, ""))}
              placeholder="Enter your max capacity here"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="number-pad"
              style={styles.input}
            />
            <Text style={styles.counter}>500</Text>
          </View>

          {/* Duration */}
          <FieldLabel text="Duration (days)" top={16} />
          <View style={styles.inputWrap}>
            <TextInput
              value={duration}
              onChangeText={(t) => setDuration(t.replace(/[^\d]/g, ""))}
              placeholder="e.g., 21"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>

          {/* Reward Setup */}
          <View style={{ marginTop: 18, marginBottom: 6, flexDirection: "row", alignItems: "baseline", gap: 6 }}>
            <Text style={styles.sectionTitle}>Reward Setup</Text>
            <Text style={{ color: COLORS.primary, fontWeight: "700" }}>＊</Text>
          </View>

          {/* Reward Name */}
          <View style={styles.inputWrap}>
            <TextInput
              value={rewardName}
              onChangeText={setRewardName}
              placeholder="e.g., Fitness"
              placeholderTextColor={COLORS.placeholder}
              style={styles.input}
            />
          </View>

          {/* Reward Description */}
          <View style={styles.textareaWrap}>
            <TextInput
              value={rewardDesc}
              onChangeText={setRewardDesc}
              placeholder="Describe what participants will receive"
              placeholderTextColor={COLORS.placeholder}
              style={[styles.input, { minHeight: 90, textAlignVertical: "top" }]}
              multiline
            />
          </View>

          {/* Reward Type */}
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

          {/* Reward Value */}
          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Value</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={rewardValue}
              onChangeText={setRewardValue}
              placeholder="e.g., $25.00"
              placeholderTextColor={COLORS.placeholder}
              style={styles.input}
            />
          </View>

          {/* Submit (no opacity-based disabling) */}
          <Pressable
            style={[styles.submitBtn, disabled && styles.submitBtnDisabled]}
            onPress={onSubmit}
            disabled={disabled}
            hitSlop={8}
          >
            <Text style={[styles.submitText, disabled && styles.submitTextDisabled]}>
              Create
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldLabel({ text, top = 8 }: { text: string; top?: number }) {
  return <Text style={[styles.sectionTitle, { marginTop: top }]}>{text}</Text>;
}

const SHADOW =
  Platform.OS === "ios"
    ? {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      }
    : { elevation: 2 };

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.pageBg },

  /* flat header (same bg as page) */
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

  /* big white card */
  card: {
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    ...SHADOW,
  },

  /* section titles (big titles) */
  sectionTitle: {
    marginHorizontal: 4,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.titleBlue,
  },

  /* inputs / small cards */
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

  /* theme cards */
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

  /* select (dropdown-like) */
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

  /* submit (deep-blue text) */
  submitBtn: {
    marginTop: 22,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: {
    backgroundColor: "#5C95E9", // lighter bg when disabled
  },
  submitText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#113D7C", // deep blue text
  },
  submitTextDisabled: {
    color: "#fff", // lighter blue on disabled
  },
});
