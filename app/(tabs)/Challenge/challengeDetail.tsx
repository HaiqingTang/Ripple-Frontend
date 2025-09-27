// app/(tabs)/Challenge/challengeDetail.tsx
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function ChallengeDetail() {
  const router = useRouter();
  const params = useLocalSearchParams(); // TODO: receive id/title/image via params

  const onJoin = () => {
    // TODO: integrate join flow
  };

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

      {/* body */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* title */}
          <Text style={styles.title}>
            “Eat Smart, Feel Great” Nutrition Challenge
          </Text>

          {/* hero image fills the top, no blank gap */}
          <Image
            source={{
              uri:
                // open-license placeholder
                "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
            }}
            style={styles.heroImg}
          />

          {/* blocks for future backend wiring */}
          <Section title="Introduction">
            <Text style={styles.paragraph}>
              Join our 4-week healthy eating challenge!{"\n"}
              Each week, we’ll feature a new Ingredient of the Week and provide easy recipes
              to help you incorporate it into your meals.{"\n"}
              Your mission: use the ingredient at least 3 times a week in any dish you prepare.
            </Text>
          </Section>

          <Section title="Reward 🏅">
            <View style={styles.bullets}>
              <Text style={styles.bullet}>
                • $30 Healthy Grocery Voucher for everyone who completes all 4 weeks
              </Text>
              <Text style={styles.bullet}>
                • Exclusive Gold Nutrition Badge on your profile
              </Text>
              <Text style={styles.bullet}>
                • Top 3 participants (creativity & engagement) get a $100 Organic Market Gift Card
              </Text>
            </View>
          </Section>

          <Section title="How to Join">
            <View style={styles.bullets}>
              <Text style={styles.bullet}>1. Tap “join now” to secure your spot</Text>
              <Text style={styles.bullet}>2. Check the weekly ingredient every Monday</Text>
              <Text style={styles.bullet}>3. Share dish photos in the challenge feed</Text>
            </View>
          </Section>

          <View style={styles.metaGrid}>
            <MetaItem label="Current Participants" value="84" />
            <MetaItem label="Max Capacity" value="100" />
          </View>

          {/* join button sits inside the white card bottom */}
          <Pressable style={styles.joinBtn} onPress={onJoin} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.joinText}>join now</Text>
          </Pressable>
        </View>

        {/* small bottom padding for safe spacing */}
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
