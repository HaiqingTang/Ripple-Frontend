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
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { useRouter, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";

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

// Fixed categories (single-select)
const CATEGORIES = ["Sports", "Music", "Lifestyle", "Study", "Travel", "Food", "Arts"] as const;

// Base tags (multi-select). Users can add custom tags on top of these.
const BASE_TAGS = ["Sports", "Music", "Lifestyle", "Study"] as const;

// Defaults
const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1556816723-1ce827b9cfbb?q=80&w=1584&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const DEFAULT_SPONSOR_NAME = "sponsor name";

// Format a Date into "YYYY-MM-DD HH:mm"
function formatDateTime(d?: Date | null): string {
  if (!d || Number.isNaN(d.getTime())) return "-";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

export default function NewMeetup() {
  const router = useRouter();
  const navigation = useNavigation();

  const backOrHome = () => {
    if (
      navigation &&
      typeof (navigation as any).canGoBack === "function" &&
      (navigation as any).canGoBack()
    ) {
      router.back();
    } else {
      router.replace("/(tabs)/Interest/meetupMainPage");
    }
  };

  // Basic form
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("activity content");

  // Time picker state
  const [dateVal, setDateVal] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  // Capacity
  const [maxCapInput, setMaxCapInput] = useState("");

  // Category single-select
  const [selectedCategory, setSelectedCategory] = useState<string>("Lifestyle");

  // Tags multi-select with custom add
  const [selectedTags, setSelectedTags] = useState<string[]>(["Lifestyle"]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagText, setNewTagText] = useState("");

  // Location and map
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

  const confirmAddTag = () => {
    const t = newTagText.trim();
    if (!t) return;
    if (
      [...BASE_TAGS, ...customTags].some(
        (x) => x.toLowerCase() === t.toLowerCase()
      )
    ) {
      Alert.alert("Duplicate", "This tag already exists.");
      return;
    }
    setCustomTags((prev) => [...prev, t]);
    setSelectedTags((prev) => [...prev, t]);
    setNewTagText("");
    setShowAddTag(false);
  };

  const handleGeocodeSubmit = async () => {
    const q = locationName.trim();
    if (!q) return;

    try {
      setIsGeocoding(true);
      await Location.requestForegroundPermissionsAsync().catch(() => {});
      const results = await Location.geocodeAsync(q);
      if (!results?.length) {
        Alert.alert("Not found", "Try another keyword or check your network.");
        return;
      }
      const { latitude, longitude } = results[0];
      setRegion((r) => ({ ...r, latitude, longitude }));
    } catch (e: any) {
      const msg =
        typeof e?.message === "string"
          ? e.message
          : "Geocoding failed, please check your network or try later.";
      Alert.alert("Geocoding error", msg);
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

    // Time handling: convert to Firestore Timestamp or use serverTimestamp
    let dateToSave: any = serverTimestamp();
    if (dateVal && !Number.isNaN(dateVal.getTime())) {
      dateToSave = Timestamp.fromDate(dateVal);
    }

    // Parse max capacity
    const maxCapacity = parseInt(maxCapInput, 10);

    // Build doc body with explicit category and tags
    const docBody = {
      title,
      description: desc,
      date: dateToSave,
      creatorId: uid,
      participants: [uid],
      maxCapacity: Number.isNaN(maxCapacity) ? null : maxCapacity,
      category: selectedCategory || "Lifestyle",
      tags: selectedTags.length ? selectedTags : ["Lifestyle"],
      location: locationName.trim() || "Unknown",
      locationGeo: { latitude: region.latitude, longitude: region.longitude },
      imageUrl: DEFAULT_IMAGE_URL,
      sponsorName: DEFAULT_SPONSOR_NAME,
    };

    try {
      await addDoc(collection(db, "meetups"), docBody);
      router.push("/(tabs)/Interest/meetupManageMyMeetup");
    } catch (e: any) {
      Alert.alert("Publish failed", e?.message ?? "Unknown error");
    }
  };

  const allTags = [...BASE_TAGS, ...customTags];

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

        <ScrollView
          contentContainerStyle={{ alignItems: "center", paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Top decorative search bar removed */}
          {/* First content card starts here */}
          <View style={[styles.card, { width: PANEL_W }]}>
            {/* Title */}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.subLabel}>Title</Text>
              <TextInput
                style={styles.underlinedInput}
                value={name}
                onChangeText={setName}
                placeholder="Value"
              />
            </View>

            {/* Time (native picker) */}
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.subLabel}>Time</Text>
              <TouchableOpacity
                onPress={() => setShowPicker(true)}
                activeOpacity={0.7}
                style={styles.underlinedDisplay}
              >
                <Text style={{ color: "#314c9b" }}>
                  {dateVal ? formatDateTime(dateVal) : "Select date & time"}
                </Text>
              </TouchableOpacity>
            </View>

            {showPicker && (
              <DateTimePicker
                value={dateVal ?? new Date()}
                mode="datetime"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === "android") setShowPicker(false);
                  if (selectedDate) setDateVal(selectedDate);
                }}
              />
            )}

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

            {/* Category single-select */}
            <Text style={[styles.subLabel, { marginTop: 6 }]}>Category</Text>
            <View style={styles.tagRow}>
              {CATEGORIES.map((c) => {
                const active = selectedCategory === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setSelectedCategory(c)}
                    style={[styles.tag, active && styles.tagActive]}
                  >
                    <View style={styles.iconBox}>
                      {active && <Ionicons name="checkmark" size={12} color="white" />}
                    </View>
                    <Text style={[styles.tagText, active && styles.tagTextActive]}>{c}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Description */}
            <Text style={styles.subLabel}>Description</Text>
            <TextInput
              style={styles.textArea}
              multiline
              value={desc}
              onChangeText={setDesc}
            />

            {/* Tags multi-select */}
            <Text style={styles.subLabel}>Tags</Text>
            <View style={styles.tagRow}>
              {allTags.map((t) => {
                const active = selectedTags.includes(t);
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => toggleTag(t)}
                    style={[styles.tag, active && styles.tagActive]}
                  >
                    <View style={styles.iconBox}>
                      {active && <Ionicons name="checkmark" size={12} color="white" />}
                    </View>
                    <Text style={[styles.tagText, active && styles.tagTextActive]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                onPress={() => setShowAddTag(true)}
                style={[styles.tag, { borderWidth: 1, borderColor: "#afc6ff", backgroundColor: "#eef3ff" }]}
              >
                <View style={styles.iconBox}>
                  <Ionicons name="add" size={12} color="#3b5aa9" />
                </View>
                <Text style={styles.tagText}>Add New Tag</Text>
              </TouchableOpacity>
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
                <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
              </MapView>
            </View>
          </View>

          {/* Publish */}
          <TouchableOpacity style={styles.publishBtn} onPress={onPublish}>
            <Text style={styles.publishText}>Publish</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Add new tag modal */}
      <Modal visible={showAddTag} transparent animationType="fade" onRequestClose={() => setShowAddTag(false)}>
        <View style={styles.modalMask}>
          <View style={styles.modalCard}>
            <Text style={[styles.subLabel, { marginBottom: 8 }]}>Add a custom tag</Text>
            <TextInput
              style={[styles.underlinedInput, { marginBottom: 14 }]}
              placeholder="e.g. Hiking"
              value={newTagText}
              onChangeText={setNewTagText}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity onPress={() => setShowAddTag(false)}>
                <Text style={{ color: "#5e5651", fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmAddTag}>
                <Text style={{ color: "#d84535", fontWeight: "700" }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#dfeaff" },
  screen: { flex: 1, backgroundColor: "#dfeaff" },

  header: {
    paddingTop: 16, // unified header top padding
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center", fontSize: 26, fontWeight: "700", color: "#3b5aa9" },
  viewBtn: { backgroundColor: "#cfe0ff", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  viewBtnText: { fontWeight: "600", color: "#3b5aa9" },

  // kept for location input
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
    marginTop: 12, // unified first card offset
  },
  subLabel: { color: "#3b5aa9", marginBottom: 6, fontWeight: "600" },
  hintText: { color: "#6b7bb5", marginBottom: 8 },

  underlinedInput: {
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "#afc6ff",
    paddingVertical: 6,
  },
  underlinedDisplay: {
    borderBottomWidth: 1,
    borderBottomColor: "#afc6ff",
    paddingVertical: 6,
  },
  textArea: {
    minHeight: 80, borderRadius: 10, backgroundColor: "white",
    padding: 10, textAlignVertical: "top", marginBottom: 8,
  },

  tagRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 6 },
  tag: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#eef3ff",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
  },
  tagActive: { backgroundColor: "#222" },
  tagText: { color: "#3b5aa9", fontWeight: "600" },
  tagTextActive: { color: "white" },
  iconBox: { width: 12, marginRight: 6, alignItems: "center" },

  mapWrap: { borderRadius: 12, overflow: "hidden", height: 140, marginBottom: 8 },
  map: { flex: 1 },

  publishBtn: { marginTop: 18, backgroundColor: "#d84535", paddingHorizontal: 22, paddingVertical: 12, borderRadius: 10 },
  publishText: { color: "white", fontWeight: "700", fontSize: 16 },

  modalMask: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%", maxWidth: 420, backgroundColor: "#fff", borderRadius: 12, padding: 16,
  },
});
