import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../../firebase";

type Category =
  | "All"
  | "Arts"
  | "Food"
  | "Lifestyle"
  | "Music"
  | "Sports"
  | "Study"
  | "Travel";

type Meetup = {
  id: string;
  title: string;
  date: string;
  category?: Category;
  location?: string;
  description?: string;
  creatorId?: string;
  participants: string[];
};

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

function toDisplayDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}/${mm}/${yy}`;
}

export default function AllMeetupsPage() {
  const router = useRouter();
  const [queryText, setQueryText] = useState("");
  const [active, setActive] = useState<Category>("All");
  const [items, setItems] = useState<Meetup[]>([]);

  useEffect(() => {
    const q = query(collection(db, "meetups"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const next: Meetup[] = snap.docs.map((d) => {
        const data = d.data() as any;
        const dateStr =
          typeof data.date?.toDate === "function"
            ? toDisplayDate(data.date.toDate())
            : String(data.date ?? "");
        const cat = String(data.category ?? "");
        return {
          id: d.id,
          title: data.title ?? "",
          date: dateStr,
          category: (CATEGORIES.includes(cat as Category)
            ? (cat as Category)
            : undefined) as Category | undefined,
          location: data.location,
          description: data.description,
          creatorId: data.creatorId,
          participants: Array.isArray(data.participants) ? data.participants : [],
        };
      });
      setItems(next);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    let arr =
      active === "All"
        ? items
        : items.filter((m) => (m.category || "All") === active);
    const q = queryText.trim().toLowerCase();
    if (!q) return arr;
    return arr.filter((m) => m.title.toLowerCase().includes(q));
  }, [active, queryText, items]);

  const onView = (m: Meetup) => {
    router.push({
      pathname: "/(tabs)/Interest/meetupDetail1",
      params: { id: m.id },
    });
  };

  const onCreate = () => {
    router.push("/(tabs)/Interest/newMeetup");
  };

  // header (title + search + chips) moved into FlatList header
  const ListHeader = (
    <View style={{ paddingTop: 0 }}>
      <View style={styles.header}>
        <Pressable
          hitSlop={8}
          onPress={() => router.replace("/(tabs)/Interest/meetupMainPage")}
        >
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
          value={queryText}
          onChangeText={setQueryText}
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
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.meetupRow, { marginHorizontal: 16 }]}>
            <Text style={styles.meetupName}>{item.title}</Text>
            <View style={styles.rightWrap}>
              <Text style={styles.meetupDate}>{item.date}</Text>
              <Pressable style={styles.viewBtn} onPress={() => onView(item)}>
                <Text style={styles.viewText}>View</Text>
                <Feather name="arrow-right" size={14} color="#345BCE" />
              </Pressable>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={<Text style={styles.empty}>No meetups found.</Text>}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 0 }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={16}
        windowSize={8}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}

const BG = "#dbe7ff";
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
  title: { fontSize: 18, fontWeight: "700", color: "#2c3e50" },
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
  chipActive: { backgroundColor: CHIP_ACTIVE_BG },
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
