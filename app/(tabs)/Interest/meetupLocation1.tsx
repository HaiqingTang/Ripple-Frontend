// app/(tabs)/Interest/meetupLocation.tsx

import React, { useEffect, useState } from "react";
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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "../../../components/MapViewCompat";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Firestore
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

// Screen width for card sizing
const { width } = Dimensions.get("window");
const PANEL_W = Math.min(640, width - 28);

// ---------- Helpers: robust geo parsing & formatting ----------

// Accepts Firestore GeoPoint / {latitude, longitude} / {lat, lng} / [lat, lng] / "lat,lng"
function normalizeCoords(val: any): { lat: number; lng: number } | null {
  if (!val) return null;

  // Firestore GeoPoint (class or serialized object), or {lat, lng}
  if (
    (typeof val?.latitude === "number" && typeof val?.longitude === "number") ||
    (typeof val?.lat === "number" && typeof val?.lng === "number")
  ) {
    const lat = typeof val.latitude === "number" ? val.latitude : val.lat;
    const lng = typeof val.longitude === "number" ? val.longitude : val.lng;
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  }

  // Array [lat, lng]
  if (Array.isArray(val) && val.length >= 2) {
    const [lat, lng] = val;
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
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

// Safely format coordinates to a display string
function formatCoords(val: any): string {
  const c = normalizeCoords(val);
  return c ? `(${c.lat.toFixed(5)}, ${c.lng.toFixed(5)})` : "";
}

export default function MeetupLocation() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  // Page state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Location name (free text) and coordinates shown on map
  const [locationName, setLocationName] = useState<string>("");
  const [region, setRegion] = useState<Region>({
    // Default: Melbourne CBD-ish
    latitude: -37.8136,
    longitude: 144.9631,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // UI state for geocoding
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [lastGeocodeAt, setLastGeocodeAt] = useState(0);

  // Load current meetup doc and populate fields
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
          Alert.alert("Not found", "Meetup not found.", [{ text: "OK", onPress: () => router.back() }]);
          return;
        }
        const data = snap.data() as any;

        // Name: keep "Unknown" as-is if that's how it's stored
        setLocationName(typeof data.location === "string" ? data.location : "");

        // Coordinates: robust multi-shape parsing; keep numeric region for UI safety
        const coords = normalizeCoords(data.locationGeo);
        setRegion((r) => ({
          ...r,
          latitude: safeNumber(coords?.lat, r.latitude),
          longitude: safeNumber(coords?.lng, r.longitude),
        }));
      } catch (e: any) {
        Alert.alert("Load failed", e?.message ?? "Unknown error", [{ text: "OK", onPress: () => router.back() }]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Geocode text -> coordinates (optional helper)
  const handleGeocodeSubmit = async () => {
    const q = locationName.trim();
    if (!q) return;

    // simple debounce to avoid rapid multiple calls
    if (Date.now() - lastGeocodeAt < 1200) return;
    setLastGeocodeAt(Date.now());

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

  // Save location back to Firestore in a consistent shape
  const onSave = async () => {
    if (!id) return;
    const locName = locationName.trim() || "Unknown";
    const updates = {
      location: locName,
      // Persist a consistent canonical shape
      locationGeo: {
        latitude: region.latitude,
        longitude: region.longitude,
      },
    };
    setSaving(true);
    try {
      await updateDoc(doc(db, "meetups", String(id)), updates);
      Alert.alert("Saved", "Location has been updated.", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert("Save failed", e?.message ?? "Unknown error");
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
        <Text style={styles.title}>Meetup Location</Text>
        <View style={{ width: 32, height: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 24 }}>
        {/* Card */}
        <View style={[styles.card, { width: PANEL_W }]}>
          <Text style={styles.subLabel}>Search / Name</Text>
          <View style={[styles.searchBox, { marginBottom: 12 }]}>
            <Ionicons name="search" size={18} />
            <TextInput
              style={styles.searchInput}
              placeholder="Enter or edit the location name"
              value={locationName}
              onChangeText={setLocationName}
              returnKeyType="search"
              onSubmitEditing={handleGeocodeSubmit}
              editable={!isGeocoding}
            />
            <TouchableOpacity
              onPress={handleGeocodeSubmit}
              disabled={isGeocoding}
              style={{ paddingHorizontal: 8, paddingVertical: 4, opacity: isGeocoding ? 0.5 : 1 }}
            >
              <Text style={{ color: "#3b5aa9", fontWeight: "700" }}>{isGeocoding ? "..." : "Search"}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subLabel}>Pin on map</Text>
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

          <Text style={styles.coordText}>
            {locationName || "Unknown"} {formatCoords({ latitude: region.latitude, longitude: region.longitude })}
          </Text>

          {/* Save */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} disabled={saving}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={onSave} disabled={saving}>
              <Text style={styles.saveText}>{saving ? "Saving..." : "Save"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- Styles ----------
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

  mapWrap: {
    borderRadius: 12,
    overflow: "hidden",
    height: 200,
    marginBottom: 8,
  },

  map: {
    flex: 1,
  },

  coordText: {
    textAlign: "center",
    color: "#3b5aa9",
    marginTop: 6,
    fontWeight: "600",
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
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

  saveBtn: {
    backgroundColor: "#d84535",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  saveText: {
    color: "white",
    fontWeight: "700",
  },
});
