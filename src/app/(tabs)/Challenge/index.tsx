import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

type ChallengeItem = {
  key: string;
  title: string;
  taglineLeft?: string;
  taglineRight?: string;
  imageUri: string;
};

const LIST: ChallengeItem[] = [
  {
    key: "meditation",
    title: "Meditation challenge",
    taglineLeft: "Calm mind,\nclear focus",
    imageUri:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
  },
  {
    key: "nutrition",
    title: "Nutrition challenge",
    taglineRight: "Healthy plate,\nhealthier you",
    imageUri:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop",
  },
  {
    key: "tech",
    title: "Tech challenge",
    taglineLeft: "Stay smart,\nlive connected",
    imageUri:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop",
  },
  {
    key: "fitness",
    title: "Fitness challenge",
    taglineRight: "Move more,\nfeel stronger",
    imageUri:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
  },
  {
    key: "art",
    title: "Art challenge",
    taglineLeft: "Create with joy",
    imageUri:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop",
  },
];

/**
 * Route mapping for each card.
 * Note: do NOT include the (tabs) group in pathname.
 * All categories reuse the same list screen, passing { category } as a param.
 */
const ROUTE_BY_KEY: Record<
  string,
  { pathname: string; params: { category: string } } | undefined
> = {
  nutrition: { pathname: "/Challenge/nutritionChallengeList", params: { category: "nutrition" } },
  fitness: { pathname: "/Challenge/nutritionChallengeList", params: { category: "fitness" } },
  meditation: { pathname: "/Challenge/nutritionChallengeList", params: { category: "meditation" } },
  tech: { pathname: "/Challenge/nutritionChallengeList", params: { category: "tech" } },
  art: { pathname: "/Challenge/nutritionChallengeList", params: { category: "art" } },
};

export default function ChallengeIndex() {
  const router = useRouter();

  const openMyChallenges = () => {
    router.push("/Challenge/currentChallengeList");
  };

  const openMyRewards = () => {
    router.push("/Challenge/myRewards");
  };

  const onCustomize = () => {
    router.push("/Challenge/createChallenge");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        {/* header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>
              Hey username,{"\n"}Ready for some <Text style={styles.headerTitleEm}>challenge?</Text>
            </Text>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
              }}
              style={styles.headerImage}
            />
          </View>

          <View style={styles.customizeContainer}>
            <Pressable onPress={onCustomize} style={styles.customizeBtn} hitSlop={8}>
              <Text style={styles.customizeText}>customise your{"\n"}challenges here</Text>
            </Pressable>
            <View style={styles.dayBox}>
              <Text style={styles.dayText}>Day 6</Text>
            </View>
          </View>
        </View>

        {/* quick actions */}
        <View style={styles.quickRow}>
          <Pressable style={styles.quickCard} onPress={openMyChallenges} hitSlop={8}>
            <View style={styles.quickInner}>
              <Ionicons name="ribbon-outline" size={20} color="#FACC15" />
              <Text style={styles.quickText}>My challenges</Text>
            </View>
          </Pressable>

          <Pressable style={styles.quickCard} onPress={openMyRewards} hitSlop={8}>
            <View style={styles.quickInner}>
              <Ionicons name="trophy-outline" size={20} color="#FACC15" />
              <Text style={styles.quickText}>My rewards</Text>
            </View>
          </Pressable>
        </View>

        {/* list */}
        <View style={styles.listHolder}>
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {LIST.map((it) => {
              const href = ROUTE_BY_KEY[it.key];

              // If the card has a route configured, wrap with Link to keep navigation declarative.
              const CardBody = (
                <>
                  <Text style={styles.cardTitle}>{it.title}</Text>
                  <View style={styles.cardInner}>
                    {it.taglineLeft ? (
                      <View style={styles.flexBox}>
                        <Text style={styles.tagText}>{it.taglineLeft}</Text>
                      </View>
                    ) : (
                      <View style={styles.flexSpacer} />
                    )}
                    <Image source={{ uri: it.imageUri }} style={styles.cardImage} />
                    {it.taglineRight ? (
                      <View style={styles.flexBox}>
                        <Text style={styles.tagText}>{it.taglineRight}</Text>
                      </View>
                    ) : (
                      <View style={styles.flexSpacer} />
                    )}
                  </View>
                </>
              );

              if (href) {
                return (
                  <Link key={it.key} href={href as any} asChild>
                    <Pressable style={styles.card} hitSlop={8}>
                      {CardBody}
                    </Pressable>
                  </Link>
                );
              }

              // Cards without route still render but do not navigate.
              return (
                <Pressable key={it.key} style={styles.card} hitSlop={8}>
                  {CardBody}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const BG = "#C6DBFA";
const HEADER_TEXT = "#5C95E9";
const BIG_BOX = "#5C95E9";
const DAY_BOX_BG = "#D6E6FD";
const DAY_TEXT = "#5C95E9";
const QUICK_BG = "#F1F5F9";
const TITLE_BLUE = "#3C7BD6";
const CARD_BG = "#D6E6FD";
const INNER_BG = "#C6DBFA";
const BODY_TEXT = "#374151";

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
  root: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },

  header: { marginBottom: 12 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerImage: { width: 80, height: 80, borderRadius: 14, backgroundColor: "#fff" },
  headerTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: "800",
    color: HEADER_TEXT,
    lineHeight: 34,
    marginRight: 12,
  },
  headerTitleEm: { color: HEADER_TEXT },

  customizeContainer: {
    backgroundColor: BIG_BOX,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    ...SHADOW,
  },
  customizeBtn: { flex: 1 },
  customizeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  dayBox: {
    backgroundColor: DAY_BOX_BG,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginLeft: 50,
    minWidth: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { fontWeight: "800", fontSize: 26, color: DAY_TEXT },

  quickRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  quickCard: {
    flex: 1,
    backgroundColor: QUICK_BG,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW,
  },
  quickInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  quickText: { fontSize: 14, fontWeight: "700", color: "#1f2937" },

  listHolder: { flex: 1 },
  listContent: { paddingBottom: 100 },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
    ...SHADOW,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TITLE_BLUE,
    marginBottom: 10,
    textAlign: "center",
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: INNER_BG,
    borderRadius: 12,
    padding: 10,
    gap: 12,
    minHeight: 92,
  },
  cardImage: { width: 110, height: 72, borderRadius: 10, resizeMode: "cover" },
  flexBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  flexSpacer: { width: 0 },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: BODY_TEXT,
    lineHeight: 16,
    textAlign: "center",
  },
});
