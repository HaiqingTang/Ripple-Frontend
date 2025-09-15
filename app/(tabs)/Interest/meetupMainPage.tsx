import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// 🔁 Firestore
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../../../firebase";

type Meetup = {
  id: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
  category?: string;
};

export default function MeetupMainPage() {
  const router = useRouter();
  const [queryText, setQueryText] = useState("");
  const [top, setTop] = useState<Meetup | null>(null);

  // 🔁 拉取最新一条 meetup
  useEffect(() => {
    const q = query(collection(db, "meetups"), orderBy("date", "desc"), limit(1));
    const unsub = onSnapshot(q, (snap) => {
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
      });
    });
    return () => unsub();
  }, []);

  const onAdd = () => console.log("Add meetup");

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 32, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            hitSlop={8}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)/Interest"); // 没有历史时兜底
              }
            }}
          >
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

        {/* 顶部大卡片 */}
        <View style={{ paddingHorizontal: 16 }}>
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
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
