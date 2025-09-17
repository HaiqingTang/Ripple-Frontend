import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../../../firebase";

type Meetup = {
  id: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
  category?: string;
  creatorId?: string;
  participants: string[];
  sponsorName?: string;
  tags?: string[];
  imageUrl?: string;
};

export default function MeetupDetailPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : undefined;

  const [query, setQuery] = useState("");
  const [meetup, setMeetup] = useState<Meetup | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">(
    "idle"
  );

  useEffect(() => {
    if (!id) {
      setStatus("error");
      return;
    }
    const load = async () => {
      try {
        setStatus("loading");
        const ref = doc(db, "meetups", String(id));
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setStatus("error");
          return;
        }
        const data = snap.data() as any;
        const dateStr =
          typeof data.date?.toDate === "function"
            ? toDisplayDate(data.date.toDate())
            : String(data.date ?? "");
        setMeetup({
          id: snap.id,
          title: data.title ?? "",
          date: dateStr,
          location: data.location,
          description: data.description,
          category: data.category,
          creatorId: data.creatorId,
          participants: Array.isArray(data.participants) ? data.participants : [],
          sponsorName: data.sponsorName,
          tags: Array.isArray(data.tags) ? data.tags : [],
          // handle empty string fallback
          imageUrl:
            typeof data.imageUrl === "string" && data.imageUrl.trim() !== ""
              ? data.imageUrl
              : "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
        });
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    };
    load();
  }, [id]);

  // join handler
  const onJoin = async () => {
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to join");
      return;
    }
    try {
      if (!id) return;
      const ref = doc(db, "meetups", String(id));
      // Non-empty assertion to avoid TS errors; runtime verification has been done above
      await updateDoc(ref, { participants: arrayUnion(auth.currentUser!.uid) });
      Alert.alert("Joined", "You have joined this meetup");
      setMeetup((prev) =>
        prev
          ? {
              ...prev,
              participants: prev.participants.includes(auth.currentUser!.uid)
                ? prev.participants
                : [...prev.participants, auth.currentUser!.uid],
            }
          : prev
      );
    } catch {
      Alert.alert("Error", "Failed to join meetup");
    }
  };

  if (status === "loading" || status === "idle") {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ margin: 20 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (status === "error" || !meetup) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ margin: 20 }}>
          <Text style={{ marginBottom: 12 }}>Invalid or missing meetup id</Text>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) router.back();
            }}
            style={{
              height: 40,
              width: 160,
              borderRadius: 10,
              backgroundColor: "#e9f0ff",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#345BCE", fontWeight: "800" }}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* header */}
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color="#2c3e50" />
          </Pressable>
          <Text style={styles.title}>Meetup Detail</Text>
          <View style={styles.iconBtn} />
        </View>

        {/* search */}
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

        {/* top card */}
        <View style={styles.card}>
          <View style={styles.topRow}>
            <Image
              source={{
                uri:
                  meetup.imageUrl ??
                  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
              }}
              style={styles.thumb}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.meetupTitle} numberOfLines={1}>
                {meetup.title}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={styles.meta} numberOfLines={1}>
                  Location: {meetup.location ?? "Unknown"}
                </Text>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/Interest/meetupLocation1",
                      params: { id: meetup.id },
                    })
                  }
                >
                  <Ionicons name="chevron-forward" size={16} color="#345BCE" />
                </Pressable>
              </View>
              <Text style={styles.meta} numberOfLines={1}>
                Meetup Time: {meetup.date}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                Sponsor: {meetup.sponsorName ?? meetup.creatorId ?? "Unknown"}
              </Text>
            </View>
          </View>

          <View style={styles.tagRow}>
            {(meetup.tags ?? []).map((t) => (
              <View key={t} style={styles.tagChip}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <View style={styles.introCard}>
            <Text style={styles.introText}>
              {meetup.description ?? "No description provided"}
            </Text>
          </View>

          <Text style={styles.participants}>
            Participants: {meetup.participants.length}
          </Text>

          <Pressable style={styles.joinBtn} onPress={onJoin}>
            <Text style={styles.joinText}>Join Now</Text>
          </Pressable>
        </View>
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
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
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
  introCard: { backgroundColor: WHITE, borderRadius: 12, padding: 12 },
  introText: { fontSize: 14, lineHeight: 20, color: "#1f2937" },
  participants: { marginTop: 10, fontSize: 13, fontWeight: "700", color: GREY },
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
