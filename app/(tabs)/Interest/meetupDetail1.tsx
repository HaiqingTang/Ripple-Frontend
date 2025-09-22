import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
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
  maxCapacity?: number | null;
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
          imageUrl:
            typeof data.imageUrl === "string" && data.imageUrl.trim() !== ""
              ? data.imageUrl
              : "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
          maxCapacity:
            typeof data.maxCapacity === "number" ? data.maxCapacity : null,
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
            style={styles.backBtnBig}
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
        {/* Header */}
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color="#2c3e50" />
          </Pressable>
          <Text style={styles.title}>Meetup Detail</Text>
          <Pressable
            hitSlop={8}
            onPress={() => router.push("/(tabs)/Interest/newMeetup")}
            style={styles.iconBtn}
          >
            <Ionicons name="add" size={22} color="#3b82f6" />
          </Pressable>
        </View>

        {/* Top card */}
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

            {/* Category */}
            <View style={{ marginTop: 6 }}>
              <View style={styles.catRow}>
                <View style={styles.singleTag}>
                  <Ionicons name="bookmark" size={12} color="white" style={{ marginRight: 6 }} />
                  <Text style={{ color: "white", fontWeight: "700" }}>
                    {meetup.category && meetup.category.trim() !== "" ? meetup.category : "None"}
                  </Text>
                </View>
              </View>
            </View>
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

        {/* Detail section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <View style={styles.introCard}>
            <Text style={styles.introText}>
              {meetup.description ?? "No description provided"}
            </Text>
          </View>

          {/* Participants and capacity */}
          <Text style={styles.participants}>
            Participants: {meetup.participants.length}
            {typeof meetup.maxCapacity === "number" ? ` / ${meetup.maxCapacity}` : ""}
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
    paddingTop: 16,
    paddingBottom: 12,
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
  backBtnBig: {
    height: 40,
    width: 160,
    borderRadius: 10,
    backgroundColor: "#e9f0ff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2c3e50",
    letterSpacing: 0.3,
  },
  card: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 12,
  },

  topRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  thumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: WHITE },
  meetupTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 4 },
  meta: { color: GREY, fontSize: 12, marginTop: 2 },
  tagRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 10 },
  tagChip: { backgroundColor: "#111827", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
    catRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 6 },
  singleTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  section: { marginTop: 12, marginHorizontal: 16 },
  sectionTitle: { color: BLUE_TEXT, fontSize: 16, fontWeight: "800", marginBottom: 8 },
  introCard: { backgroundColor: "#e9f0ff", borderRadius: 12, padding: 12 },
  introText: { color: "#111827" },

  participants: { marginTop: 12, color: BLUE_TEXT, fontWeight: "700" },
  joinBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#d84535",
    alignItems: "center",
    justifyContent: "center",
  },
  joinText: { color: "white", fontWeight: "800" },
});
