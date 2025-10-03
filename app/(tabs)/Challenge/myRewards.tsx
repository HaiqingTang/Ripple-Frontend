// app/(tabs)/Challenge/myRewards.tsx
import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

type Reward = {
  id: string;
  brand: string;
  logoUri: string;   // remote image url (free to use)
  title: string;
  subtitle: string;
  validUntil: string;
};

const PAGE_BG = "#C6DBFA";
const TITLE_BLUE = "#3C7BD6";

/* OpenMoji PNGs (CC BY-SA 4.0) — safe placeholders */
const ACTIVE: Reward[] = [
  {
    id: "gift-25",
    brand: "Gift",
    logoUri: "https://openmoji.org/data/color/png/256/1F381.png", // gift
    title: "25% OFF",
    subtitle: "Seasonal deal",
    validUntil: "Valid until 03 March 2022",
  },
  {
    id: "burger-10",
    brand: "Burger",
    logoUri: "https://openmoji.org/data/color/png/256/1F354.png", // hamburger
    title: "$ 10",
    subtitle: "Food voucher",
    validUntil: "Valid until 01 February 2022",
  },
  {
    id: "muscle-20",
    brand: "Fitness",
    logoUri: "https://openmoji.org/data/color/png/256/1F4AA.png", // flexed biceps
    title: "$ 20",
    subtitle: "Gym credit",
    validUntil: "Valid until 11 September 2022",
  },
];

const EXPIRED: Reward[] = [
  {
    id: "bag-1",
    brand: "Shop",
    logoUri: "https://openmoji.org/data/color/png/256/1F6CD.png", // shopping bags
    title: "Pay 1 take 2",
    subtitle: "Outlet promo",
    validUntil: "Valid until 03 October 2022",
  },
  {
    id: "coin-50",
    brand: "Store",
    logoUri: "https://openmoji.org/data/color/png/256/1FA99.png", // coin
    title: "$ 50",
    subtitle: "Store credit",
    validUntil: "Valid until 11 September 2022",
  },
];

export default function MyRewards() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const activeFiltered = useMemo(
    () =>
      ACTIVE.filter(
        (r) =>
          r.title.toLowerCase().includes(q.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(q.toLowerCase()) ||
          r.brand.toLowerCase().includes(q.toLowerCase())
      ),
    [q]
  );

  const expiredFiltered = useMemo(
    () =>
      EXPIRED.filter(
        (r) =>
          r.title.toLowerCase().includes(q.toLowerCase()) ||
          r.subtitle.toLowerCase().includes(q.toLowerCase()) ||
          r.brand.toLowerCase().includes(q.toLowerCase())
      ),
    [q]
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={TITLE_BLUE} />
        </Pressable>
        <Text style={styles.headerTitle}>My rewards</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color="#6F7EA6" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#6F7EA6"
            value={q}
            onChangeText={setQ}
            style={styles.searchInput}
          />
        </View>

        {/* Active */}
        <SectionTitle text={`Active (${activeFiltered.length})`} />
        <View style={{ gap: 10 }}>
          {activeFiltered.map((r) => (
            <Ticket key={r.id} item={r} />
          ))}
        </View>

        {/* Expired */}
        <SectionTitle text={`Expired (${expiredFiltered.length})`} top={18} />
        <View style={{ gap: 10 }}>
          {expiredFiltered.map((r) => (
            <Ticket key={r.id} item={r} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ text, top = 12 }: { text: string; top?: number }) {
  return <Text style={[styles.sectionTitle, { marginTop: top }]}>{text}</Text>;
}

function Ticket({ item }: { item: Reward }) {
  const router = useRouter();

  // Navigate to the reward detail page with the current card's data
  const goToDetail = () => {
    router.push({
      pathname: "/(tabs)/Challenge/rewardDetail",
      params: {
        logoUri: item.logoUri,          // remote image url
        title: item.title,              // e.g., "25% OFF" / "$ 10"
        subtitle: item.subtitle,        // short brand/label
        validUntil: item.validUntil,    // validity line
        description: `Get ${item.title} on your next purchase`, // placeholder description
        // terms: JSON.stringify([...]) // optional: pass terms as JSON string
      },
    });
  };

  return (
    <Pressable onPress={goToDetail} style={styles.ticketWrap}>
      {/* left icon area */}
      <View style={styles.brandBox}>
        <Image source={{ uri: item.logoUri }} style={styles.logo} />
      </View>

      {/* vertical dashed divider */}
      <View style={styles.dotted} />

      {/* right content area */}
      <View style={styles.contentBox}>
        <Text style={styles.offerTitle}>{item.title}</Text>
        <Text style={styles.offerSub}>{item.subtitle}</Text>
        <Text style={styles.validText}>{item.validUntil}</Text>
      </View>

      {/* coupon notches */}
      <View style={[styles.notch, styles.notchLeft]} />
      <View style={[styles.notch, styles.notchRight]} />
    </Pressable>
  );
}


const SHADOW =
  Platform.OS === "ios"
    ? {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
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
  backBtn: { padding: 4, borderRadius: 8 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: TITLE_BLUE,
  },

  searchWrap: {
    marginHorizontal: 14,
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...SHADOW,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#1F2B5C" },

  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "800",
    color: TITLE_BLUE,
  },

  ticketWrap: {
    marginHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "stretch",
    position: "relative",
    overflow: "hidden",
    ...SHADOW,
  },
  brandBox: {
    width: 86,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  logo: { width: 48, height: 48, resizeMode: "contain" },

  dotted: {
    width: 1,
    backgroundColor: "transparent",
    borderRightWidth: 1,
    borderRightColor: "#D1D5DB",
    borderStyle: "dashed",
    marginVertical: 10,
  },

  contentBox: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  offerTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  offerSub: { fontSize: 13, color: "#111827", marginTop: 2 },
  validText: { fontSize: 12, color: "#9CA3AF", marginTop: 6 },

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