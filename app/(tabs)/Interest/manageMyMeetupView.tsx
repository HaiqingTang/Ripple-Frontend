import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const PANEL_W = Math.min(640, width - 28);

type Meetup = {
  title?: string;
  description?: string;
  date?: any; // Firestore Timestamp | string | Date
  maxCapacity?: number | null;
  participants?: string[];
  category?: string;
  tags?: string[];
  location?: string;
  locationGeo?: { latitude?: number; longitude?: number };
  imageUrl?: string;
  sponsorName?: string;
};

type Profile = {
  id: string;
  name: string;
  avatarUrl?: string;
};

// format date as "YYYY-MM-DD HH:mm"
function formatDate(val: any): string {
  try {
    let d: Date | null = null;
    if (val?.seconds) d = new Date(val.seconds * 1000);
    else if (val instanceof Date) d = val;
    else if (typeof val === "string") d = new Date(val);
    if (!d || Number.isNaN(d.getTime())) return "-";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${hh}:${mm}`;
  } catch {
    return "-";
  }
}

function initialFromId(id: string) {
  const c = id.replace(/[^A-Za-z0-9]/g, "").charAt(0).toUpperCase();
  return c || "U";
}

export default function ManageMyMeetupView() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [meetup, setMeetup] = useState<Meetup | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // load meetup
  useEffect(() => {
    (async () => {
      if (!id) {
        Alert.alert("Missing params", "No meetup id provided.");
        router.back();
        return;
      }
      try {
        const ref = doc(db, "meetups", String(id));
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          Alert.alert("Not found", "Meetup not found.");
          router.back();
          return;
        }
        setMeetup(snap.data() as Meetup);
      } catch (e: any) {
        Alert.alert("Load failed", e?.message ?? "Unknown error");
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // load participant profiles (best-effort)
  useEffect(() => {
    (async () => {
      if (!meetup?.participants || meetup.participants.length === 0) {
        setProfiles([]);
        return;
      }
      setLoadingProfiles(true);
      try {
        const uids = meetup.participants.slice(0, 12);
        const results = await Promise.all(
          uids.map(async (uid) => {
            try {
              const s = await getDoc(doc(db, "users", uid));
              if (s.exists()) {
                const d = s.data() as any;
                return {
                  id: uid,
                  name: String(d.displayName ?? uid),
                  avatarUrl: d.avatarUrl,
                } as Profile;
              }
            } catch {}
            return { id: uid, name: uid } as Profile;
          })
        );
        setProfiles(results);
      } catch {
        setProfiles([]);
      } finally {
        setLoadingProfiles(false);
      }
    })();
  }, [meetup?.participants]);

  const tags = useMemo(() => meetup?.tags ?? [], [meetup?.tags]);
  const category = meetup?.category || "-";

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.screen, { alignItems: "center", justifyContent: "center" }]}
      >
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: "#3b5aa9" }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Meetups</Text>
        <TouchableOpacity
          style={styles.plusBtn}
          onPress={() => router.push("/(tabs)/Interest/newMeetup")}
        >
          <Ionicons name="add" size={20} color="#3b5aa9" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 28 }}>
        {/* First card */}
        <View style={[styles.card, { width: PANEL_W }]}>
          <RowDisplay label="Name" value={meetup?.title || "-"} />
          <RowDisplay label="Time" value={formatDate(meetup?.date)} />
          <RowDisplay
            label="Participants"
            value={
              `${Array.isArray(meetup?.participants) ? meetup!.participants!.length : 0}` +
              (meetup?.maxCapacity ? ` / ${meetup.maxCapacity}` : "")
            }
          />

          <Text style={styles.subLabel}>Category</Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <View style={styles.singleTag}>
              <Ionicons name="bookmark" size={12} color="white" style={{ marginRight: 6 }} />
              <Text style={{ color: "white", fontWeight: "700" }}>{category}</Text>
            </View>
          </View>

          <Text style={styles.subLabel}>Description</Text>
          <View style={styles.textAreaReadonly}>
            <Text style={styles.descText}>{meetup?.description || "No description"}</Text>
          </View>

          <Text style={styles.subLabel}>Tags</Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            {tags.length > 0 ? (
              tags.map((t) => (
                <View key={t} style={styles.singleTag}>
                  <Ionicons name="checkmark" size={12} color="white" style={{ marginRight: 6 }} />
                  <Text style={{ color: "white", fontWeight: "700" }}>{t}</Text>
                </View>
              ))
            ) : (
              <View style={styles.singleTag}>
                <Text style={{ color: "white", fontWeight: "700" }}>General</Text>
              </View>
            )}
          </View>

          <Text style={styles.subLabel}>Location</Text>
          <Text style={{ color: "#8fa7e6", marginBottom: 8 }}>
            {(meetup?.location || "Unknown") +
              (meetup?.locationGeo?.latitude != null &&
              meetup?.locationGeo?.longitude != null
                ? ` (${meetup.locationGeo.latitude.toFixed(5)}, ${meetup.locationGeo.longitude.toFixed(5)})`
                : "")}
          </Text>
        </View>

        {/* Participant list */}
        <View style={[styles.card, { width: PANEL_W }]}>
          <Text style={[styles.subLabel, { marginBottom: 8 }]}>Participant List:</Text>
          {loadingProfiles ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <ActivityIndicator size="small" />
              <Text style={{ color: "#3b5aa9" }}>Loading participants…</Text>
            </View>
          ) : profiles.length > 0 ? (
            <View style={{ flexDirection: "row", gap: 18, flexWrap: "wrap" }}>
              {profiles.map((p) => (
                <View key={p.id} style={{ alignItems: "center", width: 72 }}>
                  {p.avatarUrl ? (
                    <Image
                      source={{ uri: p.avatarUrl }}
                      style={{ width: 44, height: 44, borderRadius: 22, marginBottom: 6 }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        marginBottom: 6,
                        backgroundColor: "#b9c9ff",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "800" }}>
                        {initialFromId(p.name || p.id)}
                      </Text>
                    </View>
                  )}
                  <Text numberOfLines={1} style={{ color: "#3b5aa9", fontWeight: "600" }}>
                    {p.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ color: "#3b5aa9" }}>No participants yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RowDisplay({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.subLabel}>{label}</Text>
      <View style={styles.underlinedDisplay}>
        <Text style={{ color: "#314c9b" }}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#dfeaff" },
  header: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
  },

  plusBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#cfe0ff",
    borderRadius: 10,
  },

  card: {
    backgroundColor: "#cfe0ff",
    borderRadius: 16,
    padding: 14,
    marginTop: 0,
  },
  subLabel: { color: "#3b5aa9", marginBottom: 6, fontWeight: "600" },

  underlinedDisplay: {
    borderBottomWidth: 1,
    borderBottomColor: "#afc6ff",
    paddingVertical: 6,
  },
  textAreaReadonly: {
    minHeight: 80,
    borderRadius: 10,
    backgroundColor: "white",
    padding: 10,
    justifyContent: "center",
    marginBottom: 8,
  },
  descText: { color: "#314c9b" },
  singleTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
});
