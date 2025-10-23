import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions,
  Alert, Platform, ActivityIndicator, Modal, Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "../../../components/MapViewCompat";

import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

// Firestore
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "../../../firebase";

import { uploadToCloudinary } from "../../../utils/upload";

const { width } = Dimensions.get("window");
const PANEL_W = Math.min(640, width - 28);

// Defaults
const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1556816723-1ce827b9cfbb?q=80&w=1584&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const DEFAULT_SPONSOR_NAME = "sponsor name";

// Fixed categories (single-select)
const CATEGORIES = ["Sports", "Music", "Lifestyle", "Study", "Travel", "Food", "Arts"] as const;

// Base tags (multi-select)
const BASE_TAGS = ["Sports", "Music", "Lifestyle", "Study"] as const;

// ---- helpers (geo + date) ----

// Accepts GeoPoint / {latitude, longitude} / {lat, lng} / [lat, lng] / "lat,lng"
function normalizeCoords(val: any): { lat: number; lng: number } | null {
  if (!val) return null;

  // Firestore GeoPoint (class or plain object) and {lat,lng}
  if (
    (typeof val.latitude === "number" && typeof val.longitude === "number") ||
    (typeof val.lat === "number" && typeof val.lng === "number")
  ) {
    const lat = typeof val.latitude === "number" ? val.latitude : val.lat;
    const lng = typeof val.longitude === "number" ? val.longitude : val.lng;
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    return null;
  }

  // Array [lat, lng]
  if (Array.isArray(val) && val.length >= 2) {
    const [lat, lng] = val;
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    return null;
  }

  // String "lat,lng"
  if (typeof val === "string") {
    const parts = val.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length >= 2 && parts.every((n) => Number.isFinite(n))) {
      return { lat: parts[0], lng: parts[1] };
    }
    return null;
  }

  return null;
}

// Safely coerce to number with fallback
function safeNumber(v: any, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// Format Date -> "YYYY-MM-DD HH:mm"
function formatDateTime(d?: Date | null): string {
  if (!d || Number.isNaN(d.getTime())) return "-";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

export default function ManageMyMeetupEdit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const bottomPadding = tabBarHeight + insets.bottom + 20;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [dateVal, setDateVal] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const [maxCapInput, setMaxCapInput] = useState("");
  const [desc, setDesc] = useState("activity content");

  const [selectedTags, setSelectedTags] = useState<string[]>(["Lifestyle"]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTagText, setNewTagText] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<string>("Lifestyle");
  const [locationName, setLocationName] = useState("");

  // Region is always numeric so UI can safely call toFixed
  const [region, setRegion] = useState<Region>({
    latitude: -37.8,
    longitude: 144.966,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [participantsCount, setParticipantsCount] = useState(0);

  const [dateError, setDateError] = useState<string | null>(null);
  const [capError, setCapError] = useState<string | null>(null);

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [lastGeocodeAt, setLastGeocodeAt] = useState(0);

  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [webFile, setWebFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

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
          Alert.alert(
            "Not found",
            "Meetup not found",
            [
              { text: "Back", style: "cancel", onPress: () => router.back() },
              { text: "Retry", onPress: () => reloadDoc() },
              { text: "Stay", onPress: () => {} }
            ]
          );
          return;
        }
        const data = snap.data() as any;

        // Image
        setExistingImageUrl(typeof data.imageUrl === "string" ? data.imageUrl : null);

        // Title
        setTitle(String(data.title ?? ""));

        // Date
        let initDate: Date | null = null;
        if (data.date?.seconds) initDate = new Date(data.date.seconds * 1000);
        else if (typeof data.date === "string") {
          const d = new Date(data.date);
          initDate = Number.isNaN(d.getTime()) ? null : d;
        } else if (data.date instanceof Date) {
          initDate = data.date;
        }
        setDateVal(initDate);

        // Capacity
        setMaxCapInput(
          typeof data.maxCapacity === "number" ? String(data.maxCapacity) : ""
        );

        // Description
        setDesc(String(data.description ?? "activity content"));

        // Tags
        const initialTags =
          Array.isArray(data.tags) && data.tags.length
            ? data.tags.map(String)
            : ["Lifestyle"];
        setSelectedTags(initialTags);

        // Category
        setSelectedCategory(
          typeof data.category === "string" && data.category ? data.category : "Lifestyle"
        );

        // Location name (may be "Unknown" by design)
        setLocationName(String(data.location ?? ""));

        // Location region (robust multi-shape support)
        const coords = normalizeCoords(data.locationGeo);
        setRegion((r: Region) => ({
          ...r,
          latitude: safeNumber(coords?.lat, r.latitude),
          longitude: safeNumber(coords?.lng, r.longitude),
        }));

        // Participants
        setParticipantsCount(
          Array.isArray(data.participants) ? data.participants.length : 0
        );
      } catch (e: any) {
        Alert.alert(
          "Load failed",
          e?.message ?? "Unknown error",
          [
            { text: "Back", style: "cancel", onPress: () => router.back() },
            { text: "Retry", onPress: () => reloadDoc() },
            { text: "Stay", onPress: () => {} }
          ]
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const reloadDoc = async () => {
    if (!id) return;
    try {
      const ref = doc(db, "meetups", String(id));
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        Alert.alert("Not found", "Meetup not found");
        return;
      }
      const data = snap.data() as any;

      setExistingImageUrl(typeof data.imageUrl === "string" ? data.imageUrl : null);
      setTitle(String(data.title ?? ""));

      let initDate: Date | null = null;
      if (data.date?.seconds) initDate = new Date(data.date.seconds * 1000);
      else if (typeof data.date === "string") {
        const d = new Date(data.date);
        initDate = Number.isNaN(d.getTime()) ? null : d;
      } else if (data.date instanceof Date) {
        initDate = data.date;
      }
      setDateVal(initDate);

      setMaxCapInput(typeof data.maxCapacity === "number" ? String(data.maxCapacity) : "");
      setDesc(String(data.description ?? "activity content"));

      const initialTags =
        Array.isArray(data.tags) && data.tags.length ? data.tags.map(String) : ["Lifestyle"];
      setSelectedTags(initialTags);

      setSelectedCategory(
        typeof data.category === "string" && data.category ? data.category : "Lifestyle"
      );

      setLocationName(String(data.location ?? ""));

      const coords = normalizeCoords(data.locationGeo);
      setRegion((r: Region) => ({
        ...r,
        latitude: safeNumber(coords?.lat, r.latitude),
        longitude: safeNumber(coords?.lng, r.longitude),
      }));

      setParticipantsCount(Array.isArray(data.participants) ? data.participants.length : 0);
    } catch (e: any) {
      Alert.alert("Load failed", e?.message ?? "Unknown error");
    }
  };

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
    if (Date.now() - lastGeocodeAt < 1200) return; // simple debounce
    setLastGeocodeAt(Date.now());
    try {
      setIsGeocoding(true);
      const Location = await import("expo-location");
      const results = await Location.geocodeAsync(q);
      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        setRegion((r: Region) => ({ ...r, latitude, longitude }));
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Media library access is needed to select an image");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
      base64: false,
    });
    if ((result as any).canceled) return;
    const asset = (result as any).assets?.[0];
    if (!asset?.uri) return;
    setImageUri(asset.uri);
    setImageMime((asset as any)?.mimeType || "image/jpeg");
    setWebFile(Platform.OS === "web" ? (asset as any)?.file ?? null : null);
    setUploadedUrl(null);
  };

  const uploadImageAndGetUrl = async (): Promise<string> => {
    if (!imageUri) return uploadedUrl || existingImageUrl || DEFAULT_IMAGE_URL;

    if (!auth.currentUser?.uid) {
      Alert.alert("Login required", "Please sign in before uploading an image.");
      return uploadedUrl || existingImageUrl || DEFAULT_IMAGE_URL;
    }

    try {
      const url = await uploadToCloudinary(
        imageUri,
        imageMime,
        webFile,
        "meetup_images",
        setUploading
      );
      setUploadedUrl(url);
      return url;
    } catch (e: any) {
      Alert.alert("Upload failed", e?.message ?? "Unknown error");
      return uploadedUrl || existingImageUrl || DEFAULT_IMAGE_URL;
    }
  };

  const onSubmit = async () => {
    if (!id) return;
    const titleTrim = title.trim();
    if (!titleTrim) {
      Alert.alert("Missing title", "Please enter a meetup name.");
      return;
    }

    // Date validation
    setDateError(null);
    if (!dateVal || Number.isNaN(dateVal.getTime())) {
      setDateError("Please choose a date and time");
      return;
    }
    if (dateVal.getTime() <= Date.now()) {
      setDateError("Time must be in the future");
      return;
    }
    const dateToSave = Timestamp.fromDate(dateVal);

    // Capacity validation
    setCapError(null);
    const maxCap = parseInt(maxCapInput, 10);
    if (!maxCapInput.trim() || Number.isNaN(maxCap) || maxCap <= 0) {
      setCapError("Enter a positive integer");
      return;
    }

    const finalImageUrl = await uploadImageAndGetUrl();

    const updates: any = {
      title: titleTrim,
      description: desc,
      maxCapacity: maxCap,
      category: selectedCategory || "Lifestyle",
      tags: selectedTags.length ? selectedTags : ["Lifestyle"],
      // Keep "Unknown" if user leaves it blank to match existing behavior
      location: locationName.trim() || "Unknown",
      // Persist a consistent shape going forward
      locationGeo: { latitude: region.latitude, longitude: region.longitude },
      imageUrl: finalImageUrl,
      sponsorName: DEFAULT_SPONSOR_NAME,
      date: dateToSave,
    };

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

  const allTags = [...BASE_TAGS, ...customTags];

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
        showsVerticalScrollIndicator={false}
      >
        {/* Card */}
        <View style={[styles.card, { width: PANEL_W }]}>

          {/* Cover image */}
          <Text style={styles.subLabel}>Cover</Text>
          <View style={styles.imageBox}>
            <Image
              source={{ uri: imageUri || uploadedUrl || existingImageUrl || DEFAULT_IMAGE_URL }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 8 }}>
            <TouchableOpacity onPress={pickImage} style={styles.tag}>
              <View style={styles.iconBox}>
                <Ionicons name="image" size={12} color="white" />
              </View>
              <Text style={[styles.tagText, styles.tagTextActive]}>
                {imageUri ? "Change Image" : "Select Image"}
              </Text>
            </TouchableOpacity>
            {uploading && (
              <View style={styles.singleTagRow}>
                <ActivityIndicator size="small" />
                <Text style={{ color: "#3b5aa9", fontWeight: "700", marginLeft: 6 }}>Uploading</Text>
              </View>
            )}
          </View>

          <LinedRow label="Title" value={title} onChange={setTitle} placeholder="Value" />

          {/* Time */}
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
          {!!dateError && <Text style={styles.errorText}>{dateError}</Text>}
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

          <LinedRow
            label="Max capacity"
            value={maxCapInput}
            onChange={setMaxCapInput}
            placeholder="eg 20"
            keyboardType="number-pad"
          />
          {!!capError && <Text style={styles.errorText}>{capError}</Text>}

          {/* Category */}
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

          {/* Tags */}
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
              <Text style={[styles.tagText]}>Add New Tag</Text>
            </TouchableOpacity>
          </View>

          {/* Participants hint */}
          <Text style={[styles.subLabel, { marginTop: 6 }]}>
            Participants ({participantsCount})
          </Text>
          <Text style={styles.hintText}>Participants are managed elsewhere. Here you can edit max capacity.</Text>

          {/* Location */}
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
            {isGeocoding ? <ActivityIndicator size="small" style={{ marginLeft: 8 }} /> : null}
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

        {/* Footer buttons */}
        <View style={[styles.footerRow, { width: PANEL_W }]}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} disabled={saving}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={saving}>
            <Text style={styles.submitText}>{saving ? "Saving..." : "Submit"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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

function LinedRow({
  label, value, onChange, placeholder, keyboardType,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; keyboardType?: "default" | "number-pad";
}) {
  return (
    <View style={{ marginBottom: 12}}>
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
  screen: {
    flex: 1,
    backgroundColor: "#dbe7ff",
  },

  header: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 22,
    paddingHorizontal: 12,
    height: 40,
    elevation: 1,
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    marginTop: 6,
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
  },

  card: {
    backgroundColor: "#cfe0ff",
    borderRadius: 16,
    padding: 14,
    marginTop: 0,
  },

  subLabel: {
    color: "#3b5aa9",
    marginBottom: 6,
    fontWeight: "600",
  },

  hintText: {
    color: "#6b7bb5",
    marginBottom: 8,
  },

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
    minHeight: 80,
    borderRadius: 10,
    backgroundColor: "white",
    padding: 10,
    textAlignVertical: "top",
    marginBottom: 8,
  },

  tagRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 6,
  },

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

  tagText: {
    color: "#3b5aa9",
    fontWeight: "600",
  },

  tagTextActive: {
    color: "white",
  },

  iconBox: {
    width: 12,
    marginRight: 6,
    alignItems: "center",
  },

  mapWrap: {
    borderRadius: 12,
    overflow: "hidden",
    height: 140,
    marginBottom: 8,
  },

  map: {
    flex: 1,
  },

  locText: {
    textAlign: "center",
    color: "#3b5aa9",
    marginTop: 4,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  cancelBtn: {
    backgroundColor: "#d8d0cb",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
  },

  cancelText: {
    color: "#5e5651",
    fontWeight: "700",
  },

  submitBtn: {
    backgroundColor: "#d84535",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
  },

  submitText: {
    color: "white",
    fontWeight: "700",
  },

  modalMask: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },

  errorText: { color: "#d84535", marginBottom: 8, fontWeight: "700" },

  imageBox: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "white",
    marginBottom: 8,
  },

  singleTagRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
