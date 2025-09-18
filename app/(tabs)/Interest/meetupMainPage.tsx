import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ImageBackground,
  FlatList,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
  where,
} from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { SafeAreaView } from "react-native-safe-area-context";

type Meetup = {
  id: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
  category?: string;
  creatorId?: string;
  participants: string[];
};

export default function MeetupMainPage() {
  const router = useRouter();
  const [queryText, setQueryText] = useState("");
  const [top, setTop] = useState<Meetup | null>(null);
  const [myMeetups, setMyMeetups] = useState<Meetup[]>([]);

  // load latest meetup
  useEffect(() => {
    const q1 = query(collection(db, "meetups"), orderBy("date", "desc"), limit(1));
    const unsub = onSnapshot(q1, (snap) => {
      const d = snap.docs[0];
      if (!d) {
        setTop(null);
        return;
      }
      const data = d.data() as any;
      const dateStr =
        typeof data.date?.toDate === "function"
          ? toDisplayDate(data.date.toDate())
          : String(data.date ?? "");
      setTop({
        id: d.id,
        title: data.title ?? "",
        date: dateStr,
        location: data.location,
        description: data.description,
        category: data.category,
        creatorId: data.creatorId,
        participants: Array.isArray(data.participants) ? data.participants : [],
      });
    });
    return () => unsub();
  }, []);

  // load my meetups preview
  useEffect(() => {
    if (!auth.currentUser) return;
    const q2 = query(
      collection(db, "meetups"),
      where("participants", "array-contains", auth.currentUser.uid),
      orderBy("date", "desc"),
      limit(4)
    );
    const unsub = onSnapshot(q2, (snap) => {
      const list: Meetup[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        const dateStr =
          typeof data.date?.toDate === "function"
            ? toDisplayDate(data.date.toDate())
            : String(data.date ?? "");
        list.push({
          id: d.id,
          title: data.title ?? "",
          date: dateStr,
          location: data.location,
          description: data.description,
          category: data.category,
          creatorId: data.creatorId,
          participants: Array.isArray(data.participants) ? data.participants : [],
        });
      });
      setMyMeetups(list);
    });
    return () => unsub();
  }, []);

  const onAdd = () => router.push("/(tabs)/Interest/newMeetup");

  const onOpenTop = () => {
    if (!top) return;
    router.push({ pathname: "/(tabs)/Interest/meetupDetail1", params: { id: top.id } });
  };

  const onOpenMeetup = (m: Meetup) => {
    router.push({ pathname: "/(tabs)/Interest/meetupDetail1", params: { id: m.id } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header restored to original arrangement and spacing */}
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => router.replace("/(tabs)/Interest")}>
            <Ionicons name="chevron-back" size={22} color="#2c3e50" />
          </Pressable>
          <Text style={styles.title}>Meetups 🌐</Text>
          <Pressable hitSlop={8} onPress={onAdd}>
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
            value={queryText}
            onChangeText={setQueryText}
          />
        </View>

        {/* Hero card clickable */}
        <Pressable onPress={onOpenTop} disabled={!top} style={{ paddingHorizontal: 16 }}>
          <ImageBackground
            source={{
              uri:
                "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=60",
            }}
            style={styles.hero}
            imageStyle={{ borderRadius: 16 }}
          >
            <View style={styles.heroBadge}>
              <Text style={{ fontWeight: "800", color: "#FF5A3E" }}>🔥 HOT</Text>
            </View>
            <View style={styles.heroOverlay} />
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroDate}>{top ? top.date : "—"}</Text>
              <Text style={styles.heroTitle}>{top ? top.title : "No Meetup"}</Text>
            </View>
          </ImageBackground>
        </Pressable>

        {/* My Meetups card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>My Meetups</Text>
            <Pressable
              style={styles.allBtn}
              onPress={() => router.push("/(tabs)/Interest/myMeetups")}
            >
              <Text style={styles.allText}>All Meetups</Text>
              <Feather name="chevron-right" size={16} color="#6b7280" />
            </Pressable>
          </View>
          <FlatList
            data={myMeetups}
            keyExtractor={(i) => i.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <Pressable onPress={() => onOpenMeetup(item)} style={styles.meetupRow}>
                <Text style={styles.meetupName}>{item.title}</Text>
                <Text style={styles.meetupDate}>{item.date}</Text>
              </Pressable>
            )}
            contentContainerStyle={{ paddingTop: 6, paddingBottom: 6 }}
          />
        </View>

        <View style={{ height: 16 }} />
        <Pressable
          style={styles.moreBtn}
          onPress={() => router.push("/(tabs)/Interest/allMeetups")}
        >
          <Text style={styles.moreText}>Explore more meetups</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function toDisplayDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}/${mm}/${yy}`;
}

const BG = "#dbe7ff";
const CARD_BG = "#C6DBFA";
const BLUE_TEXT = "#345BCE";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12, // back to original spacing
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 20, fontWeight: "800", color: "#1f2937" },
  searchBox: {
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: "#111827" },
  hero: { height: 220, borderRadius: 16, overflow: "hidden" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  heroTextWrap: { position: "absolute", bottom: 16, left: 16, right: 16 },
  heroDate: { color: "#fff", fontWeight: "800", fontSize: 18, marginBottom: 4 },
  heroTitle: { color: "#fff", fontWeight: "900", fontSize: 28 },
  heroBadge: {
    position: "absolute",
    right: 12,
    top: 12,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  card: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: CARD_BG,
  },
  cardHeader: {
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: BLUE_TEXT,
  },
  allBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  allText: { color: "#6b7280", fontSize: 12, fontWeight: "600" },
  meetupRow: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  meetupName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  meetupDate: { fontSize: 12, fontWeight: "700", color: "#6b7280" },
  moreBtn: {
    marginHorizontal: 16,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#e9f0ff",
    alignItems: "center",
    justifyContent: "center",
  },
  moreText: { fontSize: 16, fontWeight: "800", color: "#345BCE" },
});
