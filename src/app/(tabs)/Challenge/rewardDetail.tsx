import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { db, auth } from "../../../firebase";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";

const PAGE_BG = "#C6DBFA";
const TITLE_BLUE = "#3C7BD6";

// format helper for "Valid until DD Month YYYY"
function formatValid(d: Date) {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = months[d.getMonth()];
  const yyyy = d.getFullYear();
  return `Valid until ${dd} ${mm} ${yyyy}`;
}

type RewardDoc = {
  title?: string;
  subtitle?: string;
  description?: string;
  logoUri?: string;
  validUntil?: string;     // ISO string
  value?: string;
  redeemed?: boolean;
  issuedAt?: any;
  redeemedAt?: any;
};

export default function RewardDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; title?: string; subtitle?: string; description?: string; logoUri?: string; validUntil?: string; }>();

  const rewardId = params.id; // 如果从列表点进来，会带 id
  const uid = auth.currentUser?.uid;

  const [loading, setLoading] = useState<boolean>(!!rewardId); // 只有有 id 才尝试读 Firestore
  const [docData, setDocData] = useState<RewardDoc | null>(null);

  // Firestore 实时读取（优先使用）
  useEffect(() => {
    if (!rewardId || !uid) return;
    const ref = doc(db, "users", uid, "rewards", rewardId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) setDocData(snap.data() as RewardDoc);
        setLoading(false);
      },
      (err) => {
        console.error("rewardDetail onSnapshot error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [rewardId, uid]);

  // 兜底：如果没从 Firestore 读到，就用路由参数
  const title = docData?.title ?? (params.title as string) ?? "25% OFF";
  const subtitle = docData?.subtitle ?? (params.subtitle as string) ?? "Gift Store";
  const description = docData?.description ?? (params.description as string) ?? "Get 25% off your next purchase";
  const logo = docData?.logoUri ?? (params.logoUri as string) ?? "https://images.unsplash.com/photo-1603988363607-e1e4a66962c4?q=80&w=800&auto=format&fit=crop";
  const validUntilISO = docData?.validUntil ?? (params.validUntil as string) ?? "";

  // 有 ISO 则格式化，否则给 30 天后兜底
  const validUntilText = useMemo(() => {
    try {
      if (validUntilISO) return formatValid(new Date(validUntilISO));
    } catch {}
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 30);
    return formatValid(fallback);
  }, [validUntilISO]);

  // terms: 可以未来从 doc 拿数组；现在沿用你原默认
  const terms: string[] = [
    "Redeemable at participating locations.",
    "Not valid with other discounts or promotions.",
    "No cash value."
  ];

  // 生成二维码
  const qrData = `reward:${encodeURIComponent(title)}|${encodeURIComponent(subtitle)}|exp:${encodeURIComponent(validUntilText)}`;
  const qrUri = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`;

  // 兑换（写入 redeemed=true, redeemedAt=serverTimestamp）
  const markRedeemed = async () => {
    if (!uid || !rewardId) {
      Alert.alert("Action not available", "Missing user or reward id.");
      return;
    }
    try {
      await updateDoc(doc(db, "users", uid, "rewards", rewardId), {
        redeemed: true,
        redeemedAt: serverTimestamp(),
      });
      Alert.alert("Success", "Reward marked as redeemed.");
    } catch (e: any) {
      console.error("markRedeemed error:", e);
      Alert.alert("Error", e?.message || "Failed to update reward.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4, borderRadius: 8 }}>
          <Ionicons name="chevron-back" size={22} color={TITLE_BLUE} />
        </Pressable>
        <Text style={styles.headerTitle}>Reward Details</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={TITLE_BLUE} />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ticket */}
          <View style={styles.ticketWrap}>
            {/* top content */}
            <View style={styles.topBox}>
              {/* two-column layout: image center-left, text center-right */}
              <View style={styles.row}>
                <View style={styles.leftCol}>
                  <Image source={{ uri: logo }} style={styles.heroImg} />
                </View>
                <View style={styles.rightCol}>
                  <Text style={styles.offerTitle}>{title}</Text>
                  <Text style={styles.offerSub}>{subtitle}</Text>
                </View>
              </View>

              {/* centered tagline */}
              <Text style={styles.descStrong}>{description}</Text>

              {/* terms */}
              <View style={{ marginTop: 10, gap: 8 }}>
                {terms.map((t, idx) => (
                  <View style={styles.termRow} key={`${idx}-${t.slice(0, 8)}`}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.termText}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* dashed separator */}
            <View style={styles.dashed} />

            {/* bottom content */}
            <View style={styles.bottomBox}>
              <Image source={{ uri: qrUri }} style={styles.qr} />
              <Text style={styles.valid}>{validUntilText}</Text>

              {/* 兑换按钮（如果未兑换时显示） */}
              {docData?.redeemed ? (
                <View style={styles.redeemedTag}>
                  <Ionicons name="checkmark-done-circle-outline" size={18} color="#16a34a" />
                  <Text style={styles.redeemedText}>Redeemed</Text>
                </View>
              ) : rewardId ? (
                <Pressable style={styles.redeemBtn} onPress={markRedeemed}>
                  <Ionicons name="gift-outline" size={18} color="#fff" />
                  <Text style={styles.redeemText}>Mark as redeemed</Text>
                </Pressable>
              ) : null}
            </View>

            {/* coupon notches */}
            <View style={[styles.notch, styles.notchLeft]} />
            <View style={[styles.notch, styles.notchRight]} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const SHADOW =
  Platform.OS === "ios"
    ? {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      }
    : { elevation: 3 };

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAGE_BG },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: TITLE_BLUE,
  },

  ticketWrap: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    ...SHADOW,
  },

  /* top area with balanced margins */
  topBox: { padding: 16, paddingTop: 16, paddingBottom: 12 },

  // two equal columns so content sits near the center line
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftCol: {
    flex: 1,
    alignItems: "flex-end", // push image toward the center
    paddingRight: 12,       // gap between image and center line
    paddingLeft: 4,
  },
  rightCol: {
    flex: 1,
    alignItems: "flex-start",
    paddingLeft: 12,
    paddingRight: 4,
  },

  heroImg: {
    width: 92,
    height: 92,
    borderRadius: 10,
    resizeMode: "cover",
    backgroundColor: "#f3f4f6",
  },
  offerTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  offerSub: { fontSize: 13, color: "#111827", marginTop: 2 },

  descStrong: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },

  termRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  bullet: { color: "#111827", marginTop: 2 },
  termText: { color: "#111827" },

  dashed: {
    height: 1,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    marginHorizontal: 12,
  },

  bottomBox: { alignItems: "center", paddingVertical: 18, paddingHorizontal: 12 },
  qr: { width: 160, height: 160, resizeMode: "contain", marginTop: 6, marginBottom: 8 },
  valid: { fontSize: 11, color: "#9CA3AF" },

  notch: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: PAGE_BG,
    top: "50%",
    marginTop: -9,
  },
  notchLeft: { left: -9 },
  notchRight: { right: -9 },

  // redeem styles
  redeemBtn: {
    marginTop: 10,
    backgroundColor: "#3C7BD6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  redeemText: { color: "#fff", fontWeight: "800" },

  redeemedTag: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  redeemedText: { color: "#166534", fontWeight: "800" },
});
