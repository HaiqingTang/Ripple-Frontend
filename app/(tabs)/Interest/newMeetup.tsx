import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { useRouter, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Firestore and Auth
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../../../firebase";

const { width } = Dimensions.get("window");
const PANEL_W = Math.min(640, width - 28);

// tags
const TAGS = ["Sports", "Music", "Lifestyle", "Study"];

// defaults
const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1556816723-1ce827b9cfbb?q=80&w=1584&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const DEFAULT_SPONSOR_NAME = "sponsor name";

export default function NewMeetup() {
  const router = useRouter();
  const navigation = useNavigation();

  const backOrHome = () => {
    if (navigation && typeof (navigation as any).canGoBack === "function" && (navigation as any).canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/Interest/meetupMainPage");
    }
  };

  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [maxCapInput, setMaxCapInput] = useState("");
  const [desc, setDesc] = useState("activity content");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Lifestyle"]);
  const [query, setQuery] = useState("");

  const [locationName, setLocationName] = useState("");
  const [region, setRegion] = useState<Region>({
    latitude: -37.8,
    longitude: 144.966,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [isGeocoding, setIsGeocoding] = useState(false);

  const toggleTag = (t: string) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  // geocode by dynamic import to avoid native module crash if not built in
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
    } catch (err: any) {
      Alert.alert(
        "Geocoding unavailable",
        "expo-location is not available in this client. You can still drag the map to pick a point."
      );
    } finally {
      setIsGeocoding(false);
    }
  };

  const onPublish = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Not signed in", "Please sign in first.");
      return;
    }
    const title = name.trim();
    if (!title) {
      Alert.alert("Missing title", "Please enter a meetup name.");
      return;
    }

    // parse time to Firestore Timestamp
    let dateVal: any = serverTimestamp();
    const t = time.trim();
    if (t) {
      const parsed = new Date(t);
      if (!isNaN(parsed.getTime())) {
        dateVal = Timestamp.fromDate(parsed);
      }
    }

    const category = selectedTags[0] ?? "Lifestyle";
    const maxCapacity = parseInt(maxCapInput, 10);

    const docBody = {
      title,
      description: desc,
      date: dateVal,
      creatorId: uid,
      participants: [uid], // creator joins by default
      maxCapacity: isNaN(maxCapacity) ? null : maxCapacity,
      category,
      tags: selectedTags.length ? selectedTags : ["Lifestyle"],
      location: locationName.trim() || "Unknown",
      locationGeo: {
        latitude: region.latitude,
        longitude: region.longitude,
      },
      imageUrl: DEFAULT_IMAGE_URL,
      sponsorName: DEFAULT_SPONSOR_NAME,
      // createdAt removed per your request
    };

    try {
      await addDoc(collection(db, "meetups"), docBody);
      router.push("/(tabs)/Interest/meetupManageMyMeetup");
    } catch (e: any) {
      Alert.alert("Publish failed", e?.message ?? "Unknown error");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={backOrHome} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} />
          </TouchableOpacity>
          <Text style={styles.title}>Meetups</Text>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => router.push("/(tabs)/Interest/meetupManageMyMeetup")}
          >
            <Text style={styles.viewBtnText}>View</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 28 }}>
          {/* Search bar */}
          <View style={[styles.searchBox, { width: PANEL_W }]}>
            <Ionicons name="search" size={18} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search meetups..."
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {/* Form card */}
          <View style={[styles.card, { width: PANEL_W }]}>
            <LinedRow label="Title" value={name} onChange={setName} placeholder="Value" />
            <LinedRow
              label="Time"
              value={time}
              onChange={setTime}
              placeholder="YYYY-MM-DD HH:mm eg 2025-09-20 20:00"
            />

            {/* Max capacity */}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.subLabel}>Max capacity</Text>
              <TextInput
                style={styles.underlinedInput}
                value={maxCapInput}
                onChangeText={setMaxCapInput}
                placeholder="eg 20"
                keyboardType="number-pad"
              />
            </View>

            <Text style={styles.subLabel}>Description</Text>
            <TextInput
              style={styles.textArea}
              multiline
              value={desc}
              onChangeText={setDesc}
            />

            <Text style={styles.subLabel}>Tags</Text>
            <View style={styles.tagRow}>
              {TAGS.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => toggleTag(t)}
                  style={[styles.tag, selectedTags.includes(t) && styles.tagActive]}
                >
                  {selectedTags.includes(t) && (
                    <Ionicons name="checkmark" size={12} style={{ marginRight: 6 }} />
                  )}
                  <Text
                    style={[
                      styles.tagText,
                      selectedTags.includes(t) && styles.tagTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location card */}
          <View style={[styles.card, { width: PANEL_W }]}>
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
                <Marker
                  coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                />
              </MapView>
            </View>
          </View>

          {/* Publish */}
          <TouchableOpacity style={styles.publishBtn} onPress={onPublish}>
            <Text style={styles.publishText}>Publish</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function LinedRow({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.subLabel}>{label}</Text>
      <TextInput
        style={styles.underlinedInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#dfeaff" }, // new: safe area wrapper
  screen: { flex: 1, backgroundColor: "#dfeaff" },
  header: {
    paddingTop: 24, // moved further down
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 32, height: 32, alignItems: "center", justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 26,
    fontWeight: "700",
    color: "#3b5aa9",
  },
  viewBtn: {
    backgroundColor: "#cfe0ff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  viewBtnText: { fontWeight: "600", color: "#3b5aa9" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 22,
    paddingHorizontal: 12,
    height: 40,
    elevation: 1,
    shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
    marginTop: 6,
  },
  searchInput: { marginLeft: 8, flex: 1 },

  card: {
    backgroundColor: "#cfe0ff",
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  subLabel: {
    color: "#3b5aa9",
    marginBottom: 6,
    fontWeight: "600",
  },
  underlinedInput: {
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "#afc6ff",
    paddingVertical: 6,
  },
  textArea: {
    minHeight: 80,
    borderRadius: 10,
    backgroundColor: "white",
    padding: 10,
    textAlignVertical: "top",
    marginBottom: 8,
  },
  tagRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 4 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef3ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagActive: {
    backgroundColor: "#222",
  },
  tagText: { color: "#3b5aa9", fontWeight: "600" },
  tagTextActive: { color: "white" },

  mapWrap: {
    borderRadius: 12, overflow: "hidden", height: 140, marginBottom: 8,
  },
  map: { flex: 1 },

  publishBtn: {
    marginTop: 18,
    backgroundColor: "#d84535",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },
  publishText: { color: "white", fontWeight: "700", fontSize: 16 },
});
