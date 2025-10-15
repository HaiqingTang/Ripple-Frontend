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

/** Format "Valid until DD Month YYYY" with a fixed locale (UTC to avoid TZ drift). */
function formatValidLocale(date: Date, locale: string = "en-AU") {
  const core = date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return `Valid until ${core}`;
}

/** Safer ISO parsing:
 *  - If "YYYY-MM-DD", treat as date-only at UTC midnight.
 *  - Else parse normally; return null on invalid.
 */
function parseISODateSafe(iso: string): Date | null {
  if (!iso) return null;
  const ymd = iso.match(/^\d{4}-\d{2}-\d{2}$/);
  try {
    if (ymd) return new Date(`${iso}T00:00:00.000Z`);
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/** Consider reward valid THROUGH the validUntil date (inclusive, until 23:59:59.999 UTC). */
function isExpiredUTC(validUntilISO?: string): boolean {
  if (!validUntilISO) return false;
  const parsed = parseISODateSafe(validUntilISO);
  if (!parsed) return false;
  const end = new Date(parsed);
  end.setUTCHours(23, 59, 59, 999);
  return Date.now() > end.getTime();
}

type RewardDoc = {
  title?: string;
  subtitle?: string;
  description?: string;
  logoUri?: string;
  validUntil?: string; // ISO string
  value?: string;
  redeemed?: boolean;
  issuedAt?: any;
  redeemedAt?: any;
  terms?: string[];
};

const DEFAULT_TERMS = [
  "Redeemable at participating locations.",
  "Not valid with other discounts or promotions.",
  "No cash value.",
];

export default function RewardDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    logoUri?: string;
    validUntil?: string;
    value?: string;
    terms?: string;
  }>();

  const rewardId = params.id;
  const uid = auth.currentUser?.uid;

  const [loading, setLoading] = useState<boolean>(!!rewardId);
  const [docData, setDocData] = useState<RewardDoc | null>(null);

  // diagnostics (distinct error code/log for empty/error states)
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // prevent accidental double redemption
  const [redeemPending, setRedeemPending] = useState(false);

  // Firestore read (unchanged except error diagnostics)
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
        setErrorCode("RD_SNAPSHOT_ERR");
        setErrorMsg(err?.message || "Snapshot listener failed.");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [rewardId, uid]);

  const routeTerms: string[] | undefined = (() => {
    try {
      return params.terms ? JSON.parse(params.terms as string) : undefined;
    } catch {
      return undefined;
    }
  })();

  // Merge sources (Firestore > route params > defaults)
  const title = docData?.title ?? (params.title as string) ?? "";
  const subtitle = docData?.subtitle ?? (params.subtitle as string) ?? "";
  const description =
    docData?.description ?? (params.description as string) ?? "";
  const logo = docData?.logoUri ?? (params.logoUri as string) ?? "";
  const validUntilISO =
    docData?.validUntil ?? (params.validUntil as string) ?? "";
  const terms: string[] = docData?.terms ?? routeTerms ?? DEFAULT_TERMS;

  // Detect true "no data" and record a diagnostic code
  const noData =
    !docData && !title && !subtitle && !description && !logo && !validUntilISO;

  useEffect(() => {
    if (loading) return;
    if (noData && !errorCode) {
      console.error("RewardDetail no data", {
        uid: uid ?? null,
        rewardId: rewardId ?? null,
        paramKeys: Object.keys(params || {}),
      });
      setErrorCode("RD_NO_DATA");
      setErrorMsg("No reward data from Firestore or route params.");
    }
  }, [loading, noData, errorCode, params, rewardId, uid]);

  // Locale-stable "Valid until ..." text with 30-day fallback
  const validUntilText = useMemo(() => {
    const parsed = (validUntilISO && parseISODateSafe(validUntilISO)) || null;
    if (parsed) return formatValidLocale(parsed, "en-AU");
    const fallback = new Date();
    fallback.setUTCDate(fallback.getUTCDate() + 30);
    return formatValidLocale(fallback, "en-AU");
  }, [validUntilISO]);

  // expired status
  const expired = useMemo(() => isExpiredUTC(validUntilISO), [validUntilISO]);

  // Confirm + disable while pending (no accidental taps) + block when expired
  const markRedeemed = () => {
    if (!uid || !rewardId) {
      Alert.alert("Action not available", "Missing user or reward id.");
      return;
    }
    if (expired) {
      Alert.alert("Unavailable", "This reward has expired and can’t be redeemed.");
      return;
    }
    if (redeemPending) return;

    Alert.alert(
      "Confirm redemption",
      "Are you sure you want to mark this reward as redeemed? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "destructive",
          onPress: async () => {
            try {
              setRedeemPending(true);
              await updateDoc(doc(db, "users", uid, "rewards", rewardId), {
                redeemed: true,
                redeemedAt: serverTimestamp(),
              });
              Alert.alert("Success", "Reward marked as redeemed.");
            } catch (e: any) {
              console.error("markRedeemed error:", e);
              Alert.alert("Error", e?.message || "Failed to update reward.");
            } finally {
              setRedeemPending(false);
            }
          },
        },
      ]
    );
  };

  // Fixed return target to MyRewards
  const goBackToMyRewards = () => {
    router.replace("/(tabs)/Challenge/myRewards");
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* header */}
      <View style={styles.header}>
        <Pressable
          onPress={goBackToMyRewards}
          hitSlop={8}
          style={{ padding: 4, borderRadius: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color={TITLE_BLUE} />
        </Pressable>
        <Text style={styles.headerTitle}>Reward Details</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={TITLE_BLUE} />
        </View>
      ) : noData ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
          <Text style={{ marginTop: 10, fontWeight: "800", color: "#ef4444" }}>
            Unable to load this reward.
          </Text>
          <Text style={{ marginTop: 6, color: "#4b5563", textAlign: "center" }}>
            The reward data is missing. Please go back and try again.
          </Text>
          {!!errorCode && (
            <Text
              style={{
                marginTop: 8,
                color: "#6b7280",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              {errorCode}
              {errorMsg ? ` · ${errorMsg}` : ""}
            </Text>
          )}
          <Pressable
            onPress={goBackToMyRewards}
            style={{
              marginTop: 16,
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: "#3C7BD6",
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>
              Back to My Rewards
            </Text>
          </Pressable>
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
              {/* logo + title */}
              <View style={styles.row}>
                <View style={styles.leftCol}>
                  <Image
                    source={{
                      uri:
                        logo ||
                        "https://cdn-icons-png.flaticon.com/512/1047/1047711.png",
                    }}
                    style={styles.heroImg}
                  />
                </View>
                <View style={styles.rightCol}>
                  <Text style={styles.offerTitle}>{title || "Reward"}</Text>
                  <Text style={styles.offerSub}>{subtitle}</Text>
                </View>
              </View>

              {!!description && (
                <Text style={styles.descStrong}>{description}</Text>
              )}

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
              {/* QR */}
              <Image
                source={{
                  uri: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `reward:${encodeURIComponent(title || "")}|${encodeURIComponent(
                      subtitle || ""
                    )}|exp:${encodeURIComponent(validUntilText)}`
                  )}`,
                }}
                style={styles.qr}
              />
              <Text style={styles.valid}>{validUntilText}</Text>

              {docData?.redeemed ? (
                <View style={styles.redeemedTag}>
                  <Ionicons
                    name="checkmark-done-circle-outline"
                    size={18}
                    color="#16a34a"
                  />
                  <Text style={styles.redeemedText}>Redeemed</Text>
                </View>
              ) : expired ? (
                <View style={styles.expiredBtn} pointerEvents="none">
                  <Ionicons name="alert-circle-outline" size={18} color="#fff" />
                  <Text style={styles.expiredText}>Expired</Text>
                </View>
              ) : rewardId ? (
                <Pressable
                  style={[styles.redeemBtn, redeemPending && { opacity: 0.6 }]}
                  onPress={markRedeemed}
                  disabled={redeemPending}
                >
                  {redeemPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="gift-outline" size={18} color="#fff" />
                  )}
                  <Text style={styles.redeemText}>
                    {redeemPending ? "Processing..." : "Mark as redeemed"}
                  </Text>
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

  topBox: { padding: 16, paddingTop: 16, paddingBottom: 12 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftCol: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: 12,
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

  bottomBox: {
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
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

  // redeem UI
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

  // NEW: expired disabled button
  expiredBtn: {
    marginTop: 10,
    backgroundColor: "#9CA3AF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    opacity: 0.9,
  },
  expiredText: { color: "#fff", fontWeight: "800" },

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
