import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

type Meetup = {
  id: string;
  title: string;
  date: string;
  category: Category;
};
type Category =
  | "All"
  | "Arts"
  | "Food"
  | "Lifestyle"
  | "Music"
  | "Sports"
  | "Study"
  | "Travel";

const CATEGORIES: Category[] = [
  "All",
  "Arts",
  "Food",
  "Lifestyle",
  "Music",
  "Sports",
  "Study",
  "Travel",
];

const ALL_MEETUPS: Meetup[] = [
  { id: "1", title: "Morning Yoga", date: "17/9/25", category: "Lifestyle" },
  { id: "2", title: "Morning Yoga2", date: "18/9/25", category: "Lifestyle" },
  { id: "3", title: "Morning Yoga3", date: "19/9/25", category: "Lifestyle" },
  { id: "4", title: "Art Sketch Jam", date: "20/9/25", category: "Arts" },
  { id: "5", title: "Café Tasting", date: "21/9/25", category: "Food" },
  { id: "6", title: "Indie Music Night", date: "17/9/25", category: "Music" },
  { id: "7", title: "Social Football", date: "18/9/25", category: "Sports" },
  { id: "8", title: "Study Group: React", date: "19/9/25", category: "Study" },
  { id: "9", title: "Weekend Hike", date: "20/9/25", category: "Travel" },
  { id: "10", title: "Morning Yoga4", date: "20/9/25", category: "Lifestyle" },
  { id: "11", title: "Morning Yoga5", date: "21/9/25", category: "Lifestyle" },
  { id: "12", title: "Morning Yoga6", date: "17/9/25", category: "Lifestyle" },
  { id: "13", title: "Morning Yoga7", date: "18/9/25", category: "Lifestyle" },
  { id: "14", title: "Morning Yoga8", date: "19/9/25", category: "Lifestyle" },
  { id: "15", title: "Morning Yoga9", date: "20/9/25", category: "Lifestyle" },
  { id: "16", title: "Morning Yoga10", date: "21/9/25", category: "Lifestyle" },
];

export default function AllMeetupsPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Category>("All");

  const filtered = useMemo(() => {
    let arr =
      active === "All"
        ? ALL_MEETUPS
        : ALL_MEETUPS.filter((m) => m.category === active);
    if (!query.trim()) return arr;
    const q = query.trim().toLowerCase();
    return arr.filter((m) => m.title.toLowerCase().includes(q));
  }, [active, query]);

  const onView = (m: Meetup) => {
    Alert.alert("View", `Open details: ${m.title}`);
  };

  const onCreate = () => {
    Alert.alert("Create", "Go to create meetup (placeholder)");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => console.log("Back")}>
            <Ionicons name="chevron-back" size={22} color="#2c3e50" />
          </Pressable>
          <Text style={styles.title}>All Meetups</Text>
          <Pressable hitSlop={8} onPress={onCreate}>
            <Ionicons name="add" size={22} color="#3b82f6" />
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            placeholder="Search meetups..."
            placeholderTextColor="#9aa3b2"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.chipsWrap}>
          {CATEGORIES.map((c) => {
            const isActive = c === active;
            return (
              <Pressable
                key={c}
                onPress={() => setActive(c)}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 6 }}>
          {filtered.map((item) => (
            <View key={item.id} style={styles.meetupRow}>
              <Text style={styles.meetupName}>{item.title}</Text>
              <View style={styles.rightWrap}>
                <Text style={styles.meetupDate}>{item.date}</Text>
                <Pressable style={styles.viewBtn} onPress={() => onView(item)}>
                  <Text style={styles.viewText}>View</Text>
                  <Feather name="arrow-right" size={14} color="#345BCE" />
                </Pressable>
              </View>
            </View>
          ))}

          {filtered.length === 0 && (
            <Text style={styles.empty}>No meetups found.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const BG = "#D6E6FD";
const CARD_BG = "#ffffff";
const CHIP_BG = "#e5e7eb";
const CHIP_ACTIVE_BG = "#111827";
const BLUE_TEXT = "#345BCE";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
  },

  searchBox: {
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },

  chipsWrap: {
    marginHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: CHIP_BG,
  },
  chipActive: {
    backgroundColor: CHIP_ACTIVE_BG,
  },
  chipText: { fontSize: 12, fontWeight: "700", color: "#111827" },
  chipTextActive: { color: "#fff" },

  meetupRow: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  meetupName: { fontSize: 15, fontWeight: "700", color: "#111827" },

  rightWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  meetupDate: { fontSize: 12, fontWeight: "700", color: "#6b7280" },

  viewBtn: {
    backgroundColor: "#e9f0ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewText: { fontSize: 12, fontWeight: "700", color: BLUE_TEXT },

  empty: { textAlign: "center", color: "#6b7280", marginTop: 16 },
});
