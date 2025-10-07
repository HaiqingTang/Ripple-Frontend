import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { db, auth } from "../../../firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";

type ChallengeDoc = {
  title?: string;
  desc?: string;
  days?: number;
  joined?: number;
  reward?: string;
  cover?: string;
  category?: string;
  createdAt?: any;
};

export default function ChallengeDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; category?: string }>();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ChallengeDoc | null>(null);

  const challengeId = params.id || "";
  const category = params.category || "nutrition";

  // 从 Firestore 读取挑战详情
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ref = doc(db, "challenges", category, "items", challengeId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setData(snap.data() as ChallengeDoc);
        } else {
          console.warn("Challenge not found");
          Alert.alert("Not Found", "Challenge no longer exists.");
          router.back();
        }
      } catch (e: any) {
        console.error("fetch challenge error:", e);
        Alert.alert("Error", e?.message || "Failed to load challenge.");
      } finally {
        setLoading(false);
      }
    };
    if (challengeId) fetchData();
  }, [challengeId, category]);

  //  加入挑战并更新参与人数
  const onJoin = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid || !data) {
    Alert.alert("Error", "You must be signed in to join a challenge.");
    return;
  }

  try {
    const userRef = doc(db, "userChallenges", uid, "active", challengeId);
    const globalRef = doc(db, "challenges", category, "items", challengeId);

    // 1) 先查用户是否已加入，避免重复 +1
    const existing = await getDoc(userRef);
    if (existing.exists()) {
      Alert.alert("Already joined", "You've already joined this challenge.");
      // 可选：直接跳到当前挑战页
      // router.push("/(tabs)/Challenge/currentChallengeList");
      return;
    }

    // 2) 写入用户参与记录
    await setDoc(userRef, {
      title: data.title || "",
      desc: data.desc || "",
      totalDays: data.days || 20,
      daysCompleted: 0,
      progress: 0,
      reward: data.reward || "",
      cover: data.cover || "",
      category: data.category || category,
      joinedAt: serverTimestamp(),
      challengeId, // 方便排查
    });

    // 3) 只有第一次加入才全局 joined +1
    await updateDoc(globalRef, { joined: increment(1) });

    Alert.alert("Joined!", `You have joined "${data.title}" 🎉`);
    router.push("/(tabs)/Challenge/currentChallengeList");
  } catch (err: any) {
    console.error("join challenge error:", err);
    Alert.alert("Error", err?.message || "Failed to join challenge.");
  }
};

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#3C7BD6" />
      </SafeAreaView>
    );
  }

  if (!data) return null;

  return (
    <SafeAreaView style={styles.safe}>
      {/* header */}
      <View style={styles.header}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#3C7BD6" />
        </Pressable>
        <Text style={styles.headerTitle}>challenge & reward</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* title */}
          <Text style={styles.title}>{data.title}</Text>

          {/* hero image */}
          <Image
            source={{
              uri:
                data.cover ||
                "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
            }}
            style={styles.heroImg}
          />

          <Section title="Introduction">
            <Text style={styles.paragraph}>{data.desc || "No description available."}</Text>
          </Section>

          <Section title="Reward 🏅">
            <Text style={styles.bullet}>• {data.reward || "Reward to be announced"}</Text>
          </Section>

          <Section title="How to Join">
            <View style={styles.bullets}>
              <Text style={styles.bullet}>1. Tap “join now” to secure your spot</Text>
              <Text style={styles.bullet}>2. Track your daily progress</Text>
              <Text style={styles.bullet}>3. Complete the challenge to earn your reward</Text>
            </View>
          </Section>

          <View style={styles.metaGrid}>
            <MetaItem label="Current Participants" value={String(data.joined || 0)} />
            <MetaItem label="Duration (days)" value={String(data.days || 20)} />
          </View>

          <Pressable style={styles.joinBtn} onPress={onJoin} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.joinText}>join now</Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>{title}</Text>
      {children}
    </View>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const BG = "#DDE7FF";
const TITLE = "#111827";
const TITLE_BLUE = "#3C7BD6";
const CARD_BG = "#FFFFFF";
const JOIN_BG = "#BFD2FF";
const JOIN_TEXT = "#2E5BBB";
const SUBTEXT = "#333";

const SHADOW =
  Platform.OS === "ios"
    ? {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      }
    : { elevation: 3 };

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 4,
  },
  backBtn: { padding: 4, borderRadius: 8 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: TITLE_BLUE,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 16 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    ...SHADOW,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: TITLE,
    textAlign: "center",
    marginBottom: 10,
  },
  heroImg: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  section: { marginTop: 6, marginBottom: 6 },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: TITLE,
    marginBottom: 6,
  },
  paragraph: { color: SUBTEXT, lineHeight: 20 },
  bullets: { gap: 6 },
  bullet: { color: SUBTEXT, lineHeight: 20 },
  metaGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  metaItem: {
    flex: 1,
    backgroundColor: "#F7FAFF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  metaLabel: { fontSize: 12, color: "#6B7280" },
  metaValue: { fontSize: 16, fontWeight: "800", color: TITLE },
  joinBtn: {
    marginTop: 6,
    backgroundColor: JOIN_BG,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    height: 52,
  },
  joinText: { fontSize: 18, fontWeight: "800", color: JOIN_TEXT, textTransform: "lowercase" },
});
