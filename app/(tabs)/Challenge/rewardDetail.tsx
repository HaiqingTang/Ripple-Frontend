// app/(tabs)/Challenge/rewardDetail.tsx
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

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

export default function RewardDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // generic network photo (gift/shopping theme)
  const photoUri =
    (params.logoUri as string) ||
    "https://images.unsplash.com/photo-1603988363607-e1e4a66962c4?q=80&w=800&auto=format&fit=crop";

  const title = (params.title as string) || "25% OFF";
  const subtitle = (params.subtitle as string) || "Gift Store";

  // default to today + 30 days when not provided
  const fallbackDate = new Date();
  fallbackDate.setDate(fallbackDate.getDate() + 30);
  const validUntil = (params.validUntil as string) || formatValid(fallbackDate);

  const description =
    (params.description as string) || "Get 25% off your next purchase";

  // terms: allow array via params; otherwise use neutral defaults
  const terms: string[] =
    (params.terms as unknown as string[]) || [
      "Redeemable at participating locations.",
      "Not valid with other discounts or promotions.",
      "No cash value.",
    ];

  // QR code payload (safe default if not provided)
  const qrData =
    (params.qrData as string) ||
    `reward:${encodeURIComponent(title)}|${encodeURIComponent(subtitle)}|exp:${encodeURIComponent(
      validUntil
    )}`;
  const qrUri = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    qrData
  )}`;

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
                <Image source={{ uri: photoUri, cache: "reload" }} style={styles.heroImg} />
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
            <Image source={{ uri: qrUri, cache: "reload" }} style={styles.qr} />
            <Text style={styles.valid}>{validUntil}</Text>
          </View>

          {/* coupon notches */}
          <View style={[styles.notch, styles.notchLeft]} />
          <View style={[styles.notch, styles.notchRight]} />
        </View>
      </ScrollView>
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
    paddingRight: 12,       // small gap between image and center line
    paddingLeft: 4,         // ensure a bit of left breathing room
  },
  rightCol: {
    flex: 1,
    alignItems: "flex-start", // text starts near the center
    paddingLeft: 12,           // balance with leftCol paddingRight
    paddingRight: 4,
  },

  heroImg: {
    width: 92,
    height: 92,
    borderRadius: 10,
    resizeMode: "cover",
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
});