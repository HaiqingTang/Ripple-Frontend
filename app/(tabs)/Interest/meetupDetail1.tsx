import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Tag = "Lifestyle" | "Music";

export default function MeetupDetailPage() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const onBack = () => {};
  const onCreate = () => {};
  const onJoin = () => {};

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={onBack} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color="#2c3e50" />
          </Pressable>
          <Text style={styles.title}>Meetups</Text>
          <Pressable hitSlop={8} onPress={onCreate} style={styles.iconBtn}>
            <Ionicons name="add" size={22} color="#3b82f6" />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            placeholder="Search meetups..."
            placeholderTextColor="#9aa3b2"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>

        {/* Top card */}
        <View style={styles.card}>
          <View style={styles.topRow}>
            <Image
              source={{
                uri:
                  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
              }}
              style={styles.thumb}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.meetupTitle} numberOfLines={1}>
                Morning Yoga
              </Text>
              <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={styles.meta} numberOfLines={1}>
                        Location: Carlton
                      </Text>
                      <Pressable onPress={() => router.push("/Interest/meetupLocation1")}>
                        <Ionicons name="chevron-forward" size={16} color="#345BCE" />
                      </Pressable>
                    </View>
              <Text style={styles.meta} numberOfLines={1}>
                Meetup Time: 25/8 8:00 am
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                Sponsor: Emily Carter
              </Text>
            </View>
          </View>

          <View style={styles.tagRow}>
            {(["Lifestyle", "Music"] as Tag[]).map((t) => (
              <View key={t} style={styles.tagChip}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <View style={styles.introCard}>
            <Text style={styles.introText}>
              Start your day with an energising yoga session in the park. This
              class is designed for all levels, focusing on flexibility,
              breathing, and mindfulness. Bring your own mat, stay hydrated, and
              enjoy a refreshing morning practice with the community.
            </Text>
          </View>

          <Text style={styles.participants}>Participants: 10</Text>

          <Pressable style={styles.joinBtn} onPress={onJoin}>
            <Text style={styles.joinText}>Join Now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const BG = "#D6E6FD";
const CARD_BG = "#C6DBFA";
const WHITE = "#ffffff";
const BLUE_TEXT = "#345BCE";
const GREY = "#6b7280";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2c3e50",
    letterSpacing: 0.3,
  },

  searchBox: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    backgroundColor: WHITE,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },

  card: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 12,
  },
  topRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  thumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: WHITE },
  meetupTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 4 },
  meta: { fontSize: 12, color: GREY, marginTop: 2 },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d6e1ff",
  },
  tagText: { fontSize: 12, fontWeight: "700", color: BLUE_TEXT },

  section: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: BLUE_TEXT, marginBottom: 10 },
  introCard: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 12,
  },
  introText: { fontSize: 14, lineHeight: 20, color: "#1f2937" },
  participants: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "700",
    color: GREY,
  },
  joinBtn: {
    marginTop: 10,
    alignSelf: "center",
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  joinText: { color: "#fff", fontWeight: "800" },
});
