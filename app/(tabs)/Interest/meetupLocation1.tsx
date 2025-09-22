import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";

type MeetupDoc = {
  title?: string;
  description?: string;
  location?: string;
  locationGeo?: { latitude: number; longitude: number };
  participants?: string[];
  maxCapacity?: number | null;
};

export default function MeetupLocation1Page() {
  // read id from route params
  const params = useLocalSearchParams();
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : undefined;

  const router = useRouter();

  // ui states from backend only
  const [title, setTitle] = useState<string | null>(null);
  const [desc, setDesc] = useState<string | null>(null);
  const [participantsCount, setParticipantsCount] = useState<number | null>(null);
  const [maxCapacity, setMaxCapacity] = useState<number | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "ready">(
    "idle"
  );

  useEffect(() => {
    if (!id) {
      setStatus("error");
      return;
    }
    const run = async () => {
      try {
        setStatus("loading");
        const ref = doc(db, "meetups", String(id));
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setStatus("error");
          return;
        }
        const data = snap.data() as MeetupDoc;

        setTitle(data.title ?? "");
        setDesc(data.description ?? data.location ?? "");

        const p = Array.isArray((data as any).participants) ? (data as any).participants : [];
        setParticipantsCount(p.length);

        const cap =
          typeof (data as any).maxCapacity === "number" ? (data as any).maxCapacity : null;
        setMaxCapacity(cap);

        const g = (data as any).locationGeo;
        if (g && typeof g.latitude === "number" && typeof g.longitude === "number") {
          setLat(g.latitude);
          setLng(g.longitude);
        } else {
          setStatus("error");
          return;
        }

        setStatus("ready");
      } catch {
        setStatus("error");
      }
    };
    run();
  }, [id]);

  const onBack = () => {
    if (router.canGoBack()) router.back();
  };

  const onCreate = () => {
    router.push("/(tabs)/Interest/newMeetup");
  };

  if (status === "loading" || status === "idle") {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ margin: 20 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (status === "error" || title == null || desc == null || participantsCount == null || lat == null || lng == null) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ margin: 20 }}>Failed to load meetup location</Text>
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
          <Pressable hitSlop={8} onPress={onBack} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color="#2c3e50" />
          </Pressable>
          <Text style={styles.title}>Meetups</Text>
          <Pressable hitSlop={8} onPress={onCreate} style={styles.iconBtn}>
            <Ionicons name="add" size={22} color="#3b82f6" />
          </Pressable>
        </View>

        {/* Map section */}
        <View style={styles.mapWrap}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: lat!,
              longitude: lng!,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{ latitude: lat!, longitude: lng! }}
              title={title!}
              description={desc!}
            />
          </MapView>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <View style={styles.introCard}>
            <Text style={styles.introText}>{desc}</Text>
          </View>
          {/* Participants and capacity */}
          <Text style={styles.participants}>
            Participants: {participantsCount}
            {typeof maxCapacity === "number" ? ` / ${maxCapacity}` : ""}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const BG = "#D6E6FD";
const CARD_BG = "#e9f0ff";
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
  title: { fontSize: 20, fontWeight: "700", color: "#2c3e50" },

  mapWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: "hidden",
    height: 200,
  },
  map: { width: "100%", height: "100%" },

  section: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: "transparent",
  },
  sectionTitle: { color: BLUE_TEXT, fontSize: 16, fontWeight: "800", marginBottom: 8 },
  introCard: { backgroundColor: CARD_BG, borderRadius: 12, padding: 12 },
  introText: { color: "#111827" },
  participants: { marginTop: 12, color: BLUE_TEXT, fontWeight: "700" },
});
