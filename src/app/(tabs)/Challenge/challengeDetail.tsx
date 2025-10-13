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
  runTransaction,
} from "firebase/firestore";

type RewardConfig = {
  name?: string;
  vendor?: string;
  logoUri?: string;
  value?: string;
};

type ChallengeDoc = {
  title?: string;
  desc?: string;
  days?: number;
  joined?: number;
  capacity?: number;
  cover?: string;
  category?: string;
  rewardConfig?: RewardConfig;
};

export default function ChallengeDetail() {
  const router = useRouter();
  // 👇 accept both "id" (legacy) and "challengeId" (new)
  const params = useLocalSearchParams<{
    id?: string | string[];
    challengeId?: string | string[];
    category?: string | string[];
  }>();

  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const altId = Array.isArray(params.challengeId) ? params.challengeId[0] : params.challengeId;
  const rawCat = Array.isArray(params.category) ? params.category[0] : params.category;

  const challengeId = (rawId || altId || "").trim();
  const category = (rawCat || "nutrition").toLowerCase();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ChallengeDoc | null>(null);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  // Smart back logic
  const goBackSmart = () => {
    if (router.canGoBack?.()) {
      router.back();
    } else {
      router.replace({
        pathname: "/(tabs)/Challenge/challengeList",
        params: { category },
      } as any);
    }
  };

  // Fetch challenge info
  useEffect(() => {
    const fetchData = async () => {
      try {
        // fix: if missing id, stop loading and go back
        if (!challengeId) {
          setLoading(false);
          Alert.alert("Missing", "Challenge id is missing.");
          goBackSmart();
          return;
        }
        const ref = doc(db, "challenges", category, "items", challengeId);
        const snap = await getDoc(ref);
        if (snap.exists()) setData(snap.data() as ChallengeDoc);
        else {
          Alert.alert("Not Found", "Challenge no longer exists.");
          goBackSmart();
        }
      } catch (e: any) {
        console.error("fetch challenge error:", e);
        Alert.alert("Error", e?.message || "Failed to load challenge.");
        goBackSmart();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [challengeId, category]);

  // Check if already joined
  useEffect(() => {
    const checkJoined = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid || !challengeId) return;
      const ref = doc(db, "userChallenges", uid, "active", challengeId);
      const snap = await getDoc(ref);
      setAlreadyJoined(snap.exists());
    };
    checkJoined();
  }, [challengeId]);

  // Join logic
  const onJoin = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !data) {
      Alert.alert("Error", "You must be signed in to join a challenge.");
      return;
    }
    if (joining) return;
    setJoining(true);

    const userRef   = doc(db, "userChallenges", uid, "active", challengeId);
    const globalRef = doc(db, "challenges", category, "items", challengeId);

    try {
      await runTransaction(db, async (tx) => {
        // Read the global challenge
        const gSnap = await tx.get(globalRef);
        if (!gSnap.exists()) throw new Error("Challenge not found.");

        const g = gSnap.data() as ChallengeDoc;
        const joined   = Number(g.joined || 0);
        const capacity = Number(g.capacity || 0);

        // Quota check
        if (capacity > 0 && joined >= capacity) {
          throw new Error("This challenge has reached its participant limit.");
        }

        // whether joined
        const uSnap = await tx.get(userRef);
        if (uSnap.exists()) {
          throw new Error("You've already joined this challenge.");
        }

        // Create a User Challenge Document
        tx.set(userRef, {
          title: g.title || "",
          desc: g.desc || "",
          totalDays: g.days || 20,
          daysCompleted: 0,
          progress: 0,
          reward: g.rewardConfig?.name || "",
          cover: g.rewardConfig?.logoUri || g.cover || "",
          category: g.category || category,
          joinedAt: serverTimestamp(),
          challengeId,
          status: "active",
        });

        tx.update(globalRef, { joined: increment(1) });
      });

      Alert.alert("Joined!", `You have joined "${data.title}" 🎉`);
      router.push("/(tabs)/Challenge/currentChallengeList");
    } catch (err: any) {
      console.error("join challenge error:", err);
      Alert.alert("Error", err?.message || "Failed to join challenge.");
    } finally {
      setJoining(false);
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

  const heroUri =
    data.rewardConfig?.logoUri ||
    data.cover ||
    "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable hitSlop={10} onPress={goBackSmart} style={styles.backBtn}>
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
          <Text style={styles.title}>{data.title}</Text>

          <Image source={{ uri: heroUri }} style={styles.heroImg} />

          <Section title="Introduction">
            <Text style={styles.paragraph}>{data.desc || "No description available."}</Text>
          </Section>

          <Section title="Reward 🏅">
            <Text style={styles.bullet}>• {data.rewardConfig?.name || "Reward to be announced"}</Text>
            {!!data.rewardConfig?.vendor && <Text style={styles.bullet}>• {data.rewardConfig.vendor}</Text>}
            {!!data.rewardConfig?.value && <Text style={styles.bullet}>• {data.rewardConfig.value}</Text>}
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

          <Pressable
            style={[
              styles.joinBtn,
              (alreadyJoined || joining) && { backgroundColor: "#ccc" },
            ]}
            onPress={alreadyJoined || joining ? undefined : onJoin}
            disabled={alreadyJoined || joining}
          >
            <Text style={styles.joinText}>
              {alreadyJoined ? "joined" : (joining ? "joining..." : "join now")}
            </Text>
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
