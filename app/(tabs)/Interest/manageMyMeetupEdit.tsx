import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions,
  Alert, Platform, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

// Firestore
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../firebase";

const { width } = Dimensions.get("window");
const PANEL_W = Math.min(640, width - 28);

// Reusable defaults
const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1556816723-1ce827b9cfbb?q=80&w=1584&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const DEFAULT_SPONSOR_NAME = "sponsor name";
const TAGS = ["Sports", "Music", "Lifestyle", "Study"] as const;

/** Format Firestore Timestamp/string/Date into a simple input string */
function tsToInput(val: any): string {
  try {
    let d: Date | null = null;
    if (val?.seconds) d = new Date(val.seconds * 1000);
    else if (val instanceof Date) d = val;
    else if (typeof val === "string") d = new Date(val);
    if (!d || Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${hh}:${mm}`;
  } catch {
    return "";
  }
}

export default function ManageMyMeetupEdit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  // Safe-area + TabBar height to avoid footer buttons being covered
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const bottomPadding = tabBarHeight + insets.bottom + 20; // extra breathing space

  // Loading / saving state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state (aligned with NewMeetup schema)
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");                // input string -> Timestamp on submit
  const [maxCapInput, setMaxCapInput] = useState("");  // string -> number|null
  const [desc, setDesc] = useState("activity content");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Lifestyle"]);
  const [locationName, setLocationName] = useState("");

  // Map region
  const [region, setRegion] = useState<Region>({
    latitude: -37.8,
    longitude: 144.966,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Read-only derived info
  const [participantsCount, setParticipantsCount] = useState(0);

  /** Initial fetch of meetup data */
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
        const data = snap.data() as any;

        setTitle(String(data.title ?? ""));
        setTime(tsToInput(data.date));
        setMaxCapInput(
          typeof data.maxCapacity === "number" ? String(data.maxCapacity) : ""
        );
        setDesc(String(data.description ?? "activity content"));
        setSelectedTags(
          Array.isArray(data.tags) && data.tags.length ? data.tags.map(String) : ["Lifestyle"]
        );
        setLocationName(String(data.location ?? ""));
        setRegion((r) => ({
          ...r,
          latitude: data.locationGeo?.latitude ?? r.latitude,
          longitude: data.locationGeo?.longitude ?? r.longitude,
        }));
        setParticipantsCount(
          Array.isArray(data.participants) ? data.participants.length : 0
        );
      } catch (e: any) {
        Alert.alert("Load failed", e?.message ?? "Unknown error");
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /** Toggle tag selection (multi-select) */
  const toggleTag = (t: string) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  /** Geocode location name (dynamic import to avoid native crash if module absent) */
  const [isGeocoding, setIsGeocoding] = useState(false);
  const handleGeocodeSubmit = async () => {
    const q = locationName.trim();
    if (!q) return;
    try {
      setIsGeocoding(true);
      const Location = await import("expo-location");
      const results = await Location.geocodeAsync(q);
      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        setRegion((r) => ({ ...r, latitude, longitude }));
      } else {
        Alert.alert("Not found", "No coordinates found for this location.");
      }
    } catch {
      Alert.alert(
        "Geocoding unavailable",
        "expo-location is not available in this client. You can still drag the map."
      );
    } finally {
      setIsGeocoding(false);
    }
  };

  /** Submit updates to Firestore */
  const onSubmit = async () => {
    if (!id) return;
    const titleTrim = title.trim();
    if (!titleTrim) {
      Alert.alert("Missing title", "Please enter a meetup name.");
      return;
    }

    // Parse time; leave unchanged if empty
    const t = time.trim();
    let dateToSave: Timestamp | undefined = undefined;
    if (t) {
      const parsed = new Date(t);
      if (!Number.isNaN(parsed.getTime())) {
        dateToSave = Timestamp.fromDate(parsed);
      } else {
        Alert.alert("Invalid date", "Please use a valid format, e.g. 2025-09-20 20:00");
        return;
      }
    }

    // Parse max capacity
    const maxCap = parseInt(maxCapInput, 10);
    const updates: any = {
      title: titleTrim,
      description: desc,
      maxCapacity: Number.isNaN(maxCap) ? null : maxCap,
      category: selectedTags[0] ?? "Lifestyle",
      tags: selectedTags.length ? selectedTags : ["Lifestyle"],
      location: locationName.trim() || "Unknown",
      locationGeo: { latitude: region.latitude, longitude: region.longitude },
      imageUrl: DEFAULT_IMAGE_URL,
      sponsorName: DEFAULT_SPONSOR_NAME,
    };
    if (dateToSave) updates.date = dateToSave;

    setSaving(true);
    try {
      await updateDoc(doc(db, "meetups", String(id)), updates);
      router.replace("/(tabs)/Interest/meetupManageMyMeetup");
    } catch (e: any) {
      Alert.alert("Update failed", e?.message ?? "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, { alignItems: "center", justifyContent: "center" }]}>
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
        <View style={{ width: 32, height: 32 }} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ alignItems: "center", paddingBottom: bottomPadding }}
      >
        {/* Readonly search bar for visual consistency */}
        <View style={[styles.searchBox, { width: PANEL_W }]}>
          <Ionicons name="search" size={18} />
          <TextInput style={styles.searchInput} placeholder="Search meetups..." editable={false} />
        </View>

        {/* Form card */}
        <View style={[styles.card, { width: PANEL_W }]}>
          <LinedRow label="Title" value={title} onChange={setTitle} placeholder="Value" />
          <LinedRow
            label="Time"
            value={time}
            onChange={setTime}
            placeholder="YYYY-MM-DD HH:mm eg 2025-09-20 20:00"
          />
          <LinedRow
            label="Max capacity"
            value={maxCapInput}
            onChange={setMaxCapInput}
            placeholder="eg 20"
            keyboardType="number-pad"
          />

          <Text style={styles.subLabel}>Description</Text>
          <TextInput
            style={styles.textArea}
            multiline
            value={desc}
            onChangeText={setDesc}
          />

          <Text style={styles.subLabel}>Tags</Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            {TAGS.map((t) => {
              const active = selectedTags.includes(t);
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => toggleTag(t)}
                  style={[styles.tag, active && styles.tagActive]}
                >
                  {active && <Ionicons name="checkmark" size={12} color="white" style={{ marginRight: 6 }} />}
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.subLabel, { marginTop: 6 }]}>
            Participants ({participantsCount})
          </Text>
          <Text style={styles.hintText}>Participants are managed elsewhere. Here you can edit max capacity.</Text>

          <Text style={[styles.subLabel, { marginTop: 6 }]}>Location</Text>
          <View style={[styles.searchBox, { marginBottom: 12 }]}>
            <Ionicons name="search" size={18} />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter your location"
              value={locationName}
              onChangeText={setLocationName}
              returnKeyType="search"
              onSubmitEditing={handleGeocodeSubmit}
              editable={!isGeocoding}
            />
          </View>

          <View style={styles.mapWrap}>
            <MapView
              style={styles.map}
              {...(Platform.OS === "android" ? { provider: PROVIDER_GOOGLE } : {})}
              region={region}
              onRegionChangeComplete={setRegion}
            >
              <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
            </MapView>
          </View>
          <Text style={styles.locText}>
            Location: {locationName || "Unknown"} ({region.latitude.toFixed(5)}, {region.longitude.toFixed(5)})
          </Text>
        </View>

        {/* Footer buttons (now always visible above TabBar) */}
        <View style={[styles.footerRow, { width: PANEL_W }]}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} disabled={saving}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={saving}>
            <Text style={styles.submitText}>{saving ? "Saving..." : "Submit"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LinedRow({
  label, value, onChange, placeholder, keyboardType,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; keyboardType?: "default" | "number-pad";
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.subLabel}>{label}</Text>
      <TextInput
        style={styles.underlinedInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={keyboardType ?? "default"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#dfeaff" },
  header: {
    paddingTop: 0, // SafeAreaView already handles notch; keep header compact
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center", fontSize: 26, fontWeight: "700", color: "#3b5aa9" },

  searchBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "white", borderRadius: 22, paddingHorizontal: 12, height: 40,
    elevation: 1, shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
    marginTop: 6,
  },
  searchInput: { marginLeft: 8, flex: 1 },

  card: {
    backgroundColor: "#cfe0ff",
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  subLabel: { color: "#3b5aa9", marginBottom: 6, fontWeight: "600" },
  hintText: { color: "#6b7bb5", marginBottom: 8 },

  underlinedInput: {
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "#afc6ff",
    paddingVertical: 6,
  },
  textArea: {
    minHeight: 80, borderRadius: 10, backgroundColor: "white",
    padding: 10, textAlignVertical: "top", marginBottom: 8,
  },

  tag: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#eef3ff",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
  },
  tagActive: { backgroundColor: "#222" },
  tagText: { color: "#3b5aa9", fontWeight: "600" },
  tagTextActive: { color: "white" },

  mapWrap: { borderRadius: 12, overflow: "hidden", height: 140, marginBottom: 8 },
  map: { flex: 1 },
  locText: { textAlign: "center", color: "#3b5aa9", marginTop: 4 },

  footerRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  cancelBtn: { backgroundColor: "#d8d0cb", paddingVertical: 12, paddingHorizontal: 22, borderRadius: 10 },
  cancelText: { color: "#5e5651", fontWeight: "700" },
  submitBtn: { backgroundColor: "#d84535", paddingVertical: 12, paddingHorizontal: 22, borderRadius: 10 },
  submitText: { color: "white", fontWeight: "700" },
});
