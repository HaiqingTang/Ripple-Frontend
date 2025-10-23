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

// Default cover image fallback
const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1556816723-1ce827b9cfbb?q=80&w=1584&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

type Meetup = {
  title?: string;
  description?: string;
  date?: any; // Firestore Timestamp | string | Date
  maxCapacity?: number | null;
  participants?: string[]; // Keep for backward compatibility
  participantProfiles?: ParticipantProfile[]; // New enhanced structure
  category?: string;
  tags?: string[];
  location?: string | null;
  locationGeo?:
    | { latitude?: number; longitude?: number }
    | { lat?: number; lng?: number }
    | [number, number]
    | string
    | null;
  imageUrl?: string;
  sponsorName?: string;
};

type ParticipantProfile = {
  id: string;
  name: string;
  avatarUrl?: string;
  joinedAt?: any; // Firestore Timestamp
};

type Profile = {
  id: string;
  name: string;
  avatarUrl?: string;
};

// ---- Helpers ----
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


function normalizeCoords(val: any): { lat: number; lng: number } | null {
  if (!val) return null;

  if (
    (typeof val.latitude === "number" && typeof val.longitude === "number") ||
    (typeof val.lat === "number" && typeof val.lng === "number")
  ) {
    const lat = typeof val.latitude === "number" ? val.latitude : val.lat;
    const lng = typeof val.longitude === "number" ? val.longitude : val.lng;
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    return null;
  }

  if (Array.isArray(val) && val.length >= 2) {
    const [lat, lng] = val;
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    return null;
  }

  if (typeof val === "string") {
    const parts = val.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length >= 2 && parts.every((n) => Number.isFinite(n))) {
      return { lat: parts[0], lng: parts[1] };
    }
    return null;
  }

  return null;
}

function formatCoords(val: any): string {
  const c = normalizeCoords(val);
  return c ? ` (${c.lat.toFixed(5)}, ${c.lng.toFixed(5)})` : "";
}

export default function ManageMyMeetupView() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [meetup, setMeetup] = useState<Meetup | null>(null);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [profilesPartialFailed, setProfilesPartialFailed] = useState(false);

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

  // load participant profiles (enhanced with new structure)
  useEffect(() => {
    (async () => {
      if (!meetup) {
        setProfiles([]);
        setProfilesPartialFailed(false);
        return;
      }

      // Check if we have the new participantProfiles structure
      if (meetup.participantProfiles && meetup.participantProfiles.length > 0) {
        // Use the new structure - no additional queries needed!
        const profiles = meetup.participantProfiles.map(p => ({
          id: p.id,
          name: p.name,
          avatarUrl: p.avatarUrl,
        }));
        setProfiles(profiles);
        setProfilesPartialFailed(false);
        setLoadingProfiles(false);
        return;
      }

      // Fallback to old method for backward compatibility
      if (!meetup.participants || meetup.participants.length === 0) {
        setProfiles([]);
        setProfilesPartialFailed(false);
        setLoadingProfiles(false);
        return;
      }

      setLoadingProfiles(true);
      let partial = false;
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
              } else {
                partial = true;
              }
            } catch {
              partial = true;
            }
            return { id: uid, name: uid } as Profile;
          })
        );
        setProfiles(results);
      } catch {
        setProfiles([]);
        partial = true;
      } finally {
        setProfilesPartialFailed(partial);
        setLoadingProfiles(false);
      }
    })();
  }, [meetup?.participants, meetup?.participantProfiles]);

  const tags = useMemo(() => Array.isArray(meetup?.tags) ? meetup!.tags! : [], [meetup?.tags]);
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

  const locationLabel =
    (meetup?.location && typeof meetup.location === "string" ? meetup.location : "Unknown") +
    formatCoords(meetup?.locationGeo);

  const participantsCount = meetup?.participantProfiles?.length || 
    (Array.isArray(meetup?.participants) ? meetup!.participants!.length : 0);

  const imageSrc = meetup?.imageUrl || DEFAULT_IMAGE_URL;

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Meetups</Text>
        <View style={{ width: 32, height: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 100 }}>
        {/* First card */}
        <View style={[styles.card, { width: PANEL_W }]}>
          {/* Cover image */}
          <Text style={styles.subLabel}>Cover</Text>
          <View style={styles.imageBox}>
            <Image
              source={{ uri: imageSrc }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>

          <RowDisplay label="Name" value={meetup?.title || "-"} />
          <RowDisplay label="Time" value={formatDate(meetup?.date)} />
          <RowDisplay
            label="Participants"
            value={`${participantsCount}` + (meetup?.maxCapacity ? ` / ${meetup.maxCapacity}` : "")}
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
          <Text style={{ color: "#8fa7e6", marginBottom: 8 }}>{locationLabel}</Text>
        </View>

        {/* Participant list */}
        <View style={[styles.card, { width: PANEL_W }]}>
          <Text style={[styles.subLabel, { marginBottom: 8 }]}>Participant List:</Text>

          {profilesPartialFailed && (
            <View style={styles.warnRow}>
              <Ionicons name="alert-circle-outline" size={16} color="#d84535" />
              <Text style={styles.warnText}>Couldn't load some profiles.</Text>
            </View>
          )}

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

  imageBox: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: 12,
  },

  warnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffeceb",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  warnText: { color: "#d84535", fontWeight: "700" },
});
