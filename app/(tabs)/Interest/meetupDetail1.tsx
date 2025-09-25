import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../../../firebase";

// Use expo-image for caching + placeholder
import { Image as ExpoImage } from "expo-image";

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

  const currentUserId = auth.currentUser?.uid ?? null;

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
      } catch (e) {
        if (__DEV__) {
          console.error("Failed to load meetup detail:", e);
        }
        setStatus("error");
      }
    };
    load();
  }, [id]);

  // Join button capacity check + Update UI after join
  const onJoin = async () => {
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to join");
      return;
    }
    if (!meetup) return;

    // Capacity guard
    if (
      typeof meetup.maxCapacity === "number" &&
      meetup.participants.length >= meetup.maxCapacity
    ) {
      Alert.alert("Full", "This meetup is already full.");
      return;
    }

    // Already joined guard
    if (meetup.participants.includes(auth.currentUser.uid)) {
      Alert.alert("Joined", "You are already in this meetup.");
      return;
    }

    try {
      const ref = doc(db, "meetups", meetup.id);
      await updateDoc(ref, { participants: arrayUnion(auth.currentUser.uid) });
      setMeetup((prev) =>
        prev
          ? { ...prev, participants: [...prev.participants, auth.currentUser!.uid] }
          : prev
      );
      Alert.alert("Success", "You have joined this meetup");
    } catch (e) {
      Alert.alert("Error", "Failed to join meetup");
      if (__DEV__) {
        console.error("Join error:", e);
      }
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

          {/* Bigger CTA + Retry option */}
          <Pressable
            onPress={() => {
              if (router.canGoBack()) router.back();
            }}
            style={styles.backBtnBig}
          >
            <Text style={{ color: "#345BCE", fontWeight: "800" }}>Go back</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              // Retry by reloading the screen
              router.replace({
                pathname: "/(tabs)/Interest/meetupDetail1",
                params: { id },
              });
            }}
            style={[styles.backBtnBig, { marginTop: 12 }]}
          >
            <Text style={{ color: "#345BCE", fontWeight: "800" }}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Derive button state
  const isFull =
    typeof meetup.maxCapacity === "number" &&
    meetup.participants.length >= meetup.maxCapacity;
  const isJoined = currentUserId
    ? meetup.participants.includes(currentUserId)
    : false;

  let joinLabel = "Join Now";
  if (isFull) joinLabel = "Full";
  else if (isJoined) joinLabel = "Joined";

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
            {/* Use expo-image for caching + placeholder */}
            <ExpoImage
              source={meetup.imageUrl}
              style={styles.thumb}
              placeholder={require("../../../assets/images/placeholder.png")}
              contentFit="cover"
              cachePolicy="disk"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.meetupTitle} numberOfLines={1}>
                {meetup.title}
              </Text>
              <Text style={styles.meta}>Location: {meetup.location ?? "Unknown"}</Text>
              <Text style={styles.meta}>Meetup Time: {meetup.date}</Text>
              <Text style={styles.meta}>
                Sponsor: {meetup.sponsorName ?? meetup.creatorId ?? "Unknown"}
              </Text>
            </View>
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

          <Text style={styles.participants}>
            Participants: {meetup.participants.length}
            {typeof meetup.maxCapacity === "number"
              ? ` / ${meetup.maxCapacity}`
              : ""}
          </Text>

          {/* ✅ Fix 1 + Fix 2: Disable join button if full or already joined */}
          <Pressable
            style={[
              styles.joinBtn,
              (isFull || isJoined) && { backgroundColor: "#ccc" },
            ]}
            onPress={onJoin}
            disabled={isFull || isJoined}
          >
            <Text style={styles.joinText}>{joinLabel}</Text>
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
    paddingTop: 6,
    paddingBottom: 6,
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
    height: 44,
    width: 200,
    borderRadius: 10,
    backgroundColor: "#e9f0ff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
    letterSpacing: 0.3,
  },
  card: {
    marginTop: 0,
    marginHorizontal: 16,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 12,
  },
  topRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  thumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: WHITE },
  meetupTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 4 },
  meta: { color: GREY, fontSize: 12, marginTop: 2 },

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
