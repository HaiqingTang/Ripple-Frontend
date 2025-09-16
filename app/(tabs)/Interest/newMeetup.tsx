import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const PANEL_W = Math.min(640, width - 28);

const TAGS = ["Arts", "Music", "Sports"];

export default function NewMeetup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [participants, setParticipants] = useState("");
  const [desc, setDesc] = useState("activity content");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Arts"]);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<Region>({
    latitude: -37.800,
    longitude: 144.966,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const toggleTag = (t: string) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Meetups</Text>
        <TouchableOpacity style={styles.viewBtn} onPress={() => router.push("/meetupManageMyMeetup")}>
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
          <LinedRow label="Name" value={name} onChange={setName} placeholder="Value" />
          <LinedRow label="Time" value={time} onChange={setTime} placeholder="Value" />
          <LinedRow label="Participants" value={participants} onChange={setParticipants} placeholder="Value" />

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
                <Text style={[styles.tagText, selectedTags.includes(t) && styles.tagTextActive]}>
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
              placeholder="search location"
            />
          </View>

          <View style={styles.mapWrap}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              region={region}
              onRegionChangeComplete={setRegion}
            >
              <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
            </MapView>
          </View>

          <Text style={styles.locText}>Location: Carlton (0, 0)</Text>
        </View>

        {/* Publish button */}
        <TouchableOpacity style={styles.publishBtn} onPress={() => router.push("/meetupManageMyMeetup")}>
          <Text style={styles.publishText}>Publish</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  screen: { flex: 1, backgroundColor: "#dfeaff" }, // very light blue
  header: {
    paddingTop: 14,
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
  locText: { textAlign: "center", color: "#3b5aa9", marginTop: 4 },

  publishBtn: {
    marginTop: 18,
    backgroundColor: "#d84535",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },
  publishText: { color: "white", fontWeight: "700", fontSize: 16 },
});