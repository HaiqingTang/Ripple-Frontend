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
import MapView, { Marker } from "../../../components/MapViewCompat";
import {
  doc,
  onSnapshot,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../../firebase";

type MeetupDoc = {
  title?: string;
  description?: string;
  location?: string;
  locationGeo?: { latitude: number; longitude: number };
  participants?: string[];
  maxCapacity?: number | null;
};

type LoadStatus = "idle" | "loading" | "error" | "ready";

export default function MeetupLocation1Page() {
  const params = useLocalSearchParams();
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : undefined;

  const router = useRouter();

  const [isAuthed, setIsAuthed] = useState<boolean>(false);

  const [title, setTitle] = useState<string | null>(null);
  const [desc, setDesc] = useState<string | null>(null);
  const [participantsCount, setParticipantsCount] = useState<number | null>(null);
  const [maxCapacity, setMaxCapacity] = useState<number | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [status, setStatus] = useState<LoadStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [retryTick, setRetryTick] = useState<number>(0);

  const logError = async (tag: string, details: any) => {
    try {
      await addDoc(collection(db, "telemetry_meetups"), {
        tag,
        details: JSON.stringify(details ?? {}),
        meetupId: id ?? null,
        at: serverTimestamp(),
      });
    } catch (e) {
      console.warn("telemetry log failed:", e);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setIsAuthed(!!u);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!id) {
      setStatus("error");
      setErrorMsg("Invalid meetup id.");
      logError("meetup_invalid_id", { params });
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const ref = doc(db, "meetups", String(id));
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setStatus("error");
          setErrorMsg("Meetup not found.");
          logError("meetup_not_found", { id });
          return;
        }

        const data = snap.data() as MeetupDoc;

        const nextTitle = data.title ?? "";
        const nextDesc = data.description ?? data.location ?? "";

        const p = Array.isArray(data.participants) ? data.participants : [];
        const cap =
          typeof data.maxCapacity === "number" ? data.maxCapacity : null;

        const g = data.locationGeo;

        if (
          !g ||
          typeof g.latitude !== "number" ||
          typeof g.longitude !== "number"
        ) {
          setTitle(nextTitle);
          setDesc(nextDesc);
          setParticipantsCount(p.length);
          setMaxCapacity(cap);
          setLat(null);
          setLng(null);
          setStatus("error");
          setErrorMsg("Missing or invalid meetup coordinates.");
          logError("meetup_missing_locationGeo", { id, data });
          return;
        }

        setTitle(nextTitle);
        setDesc(nextDesc);
        setParticipantsCount(p.length);
        setMaxCapacity(cap);
        setLat(g.latitude);
        setLng(g.longitude);
        setStatus("ready");
        setErrorMsg("");
      },
      (err) => {
        setStatus("error");
        setErrorMsg(err?.message || "Failed to subscribe meetup.");
        logError("meetup_onSnapshot_error", { id, message: err?.message });
      }
    );

    return () => unsub();
  }, [id, retryTick]);

  const onBack = () => {
    if (router.canGoBack()) router.back();
  };

  const onRetry = () => {
    setRetryTick((t) => t + 1);
  };

  const onCreate = () => {
    if (!isAuthed) {
      Alert.alert("Login required", "Please sign in to create a meetup.");
      return;
    }
    router.push("/(tabs)/Interest/newMeetup");
  };

  if (status === "loading" || status === "idle") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={onBack} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color="#2c3e50" />
          </Pressable>
          <Text style={styles.title}>Meetups</Text>
          {isAuthed ? (
            <Pressable hitSlop={8} onPress={onCreate} style={styles.iconBtn}>
              <Ionicons name="add" size={22} color="#3b82f6" />
            </Pressable>
          ) : (
            <View style={styles.iconBtn} />
          )}
        </View>
        <Text style={{ margin: 20 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (
    status === "error" ||
    title == null ||
    desc == null ||
    participantsCount == null
  ) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={onBack} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color="#2c3e50" />
          </Pressable>
          <Text style={styles.title}>Meetups</Text>
          {isAuthed ? (
            <Pressable hitSlop={8} onPress={onCreate} style={styles.iconBtn}>
              <Ionicons name="add" size={22} color="#3b82f6" />
            </Pressable>
          ) : (
            <View style={styles.iconBtn} />
          )}
        </View>

        <View style={styles.errorWrap}>
          <Ionicons name="warning-outline" size={22} color="#b91c1c" />
          <Text style={styles.errorTitle}>Failed to load meetup location</Text>
          {!!errorMsg && <Text style={styles.errorMsg}>{errorMsg}</Text>}

          <View style={styles.errorBtns}>
            <Pressable onPress={onBack} style={[styles.cta, styles.ctaGhost]}>
              <Ionicons name="chevron-back" size={16} color="#345BCE" />
              <Text style={styles.ctaGhostText}>Back</Text>
            </Pressable>

            <Pressable onPress={onRetry} style={styles.cta}>
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.ctaText}>Retry</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const hasCoords = lat != null && lng != null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={onBack} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color="#2c3e50" />
          </Pressable>
          <Text style={styles.title}>Meetups</Text>
          {isAuthed ? (
            <Pressable hitSlop={8} onPress={onCreate} style={styles.iconBtn}>
              <Ionicons name="add" size={22} color="#3b82f6" />
            </Pressable>
          ) : (
            <View style={styles.iconBtn} />
          )}
        </View>

        <View style={styles.mapWrap}>
          {hasCoords ? (
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
          ) : (
            <View style={styles.mapFallback}>
              <Ionicons name="map-outline" size={22} color="#6b7280" />
              <Text style={{ color: "#6b7280" }}>Map coordinates not available</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <View style={styles.introCard}>
            <Text style={styles.introText}>{desc}</Text>
          </View>
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
const BLUE_TEXT = "#345BCE";

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
    backgroundColor: "#eef4ff",
  },
  map: { width: "100%", height: "100%" },
  mapFallback: {
    flex: 1,
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    rowGap: 6,
  },

  section: {
    marginTop: 12,
    marginHorizontal: 16,
    backgroundColor: "transparent",
  },
  sectionTitle: { color: BLUE_TEXT, fontSize: 16, fontWeight: "800", marginBottom: 8 },
  introCard: { backgroundColor: CARD_BG, borderRadius: 12, padding: 12 },
  introText: { color: "#111827" },
  participants: { marginTop: 12, color: BLUE_TEXT, fontWeight: "700" },

  errorWrap: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: "#fff1f2",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ffe4e6",
    rowGap: 8,
  },
  errorTitle: { fontWeight: "800", color: "#991b1b", fontSize: 16 },
  errorMsg: { color: "#7f1d1d" },
  errorBtns: {
    marginTop: 8,
    flexDirection: "row",
    columnGap: 12,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
    backgroundColor: "#345BCE",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  ctaText: { color: "#fff", fontWeight: "700" },
  ctaGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: BLUE_TEXT,
  },
  ctaGhostText: { color: BLUE_TEXT, fontWeight: "700" },
});
