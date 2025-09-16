import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { useLocalSearchParams, useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const PANEL_W = Math.min(640, width - 28);

export default function ManageMyMeetupEdit() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  // Mock prefilled values for the selected meetup
  const [name, setName] = useState("Morning Yoga");
  const [time, setTime] = useState("25/8 8:00 am");
  const [participants, setParticipants] = useState("15");
  const [desc, setDesc] = useState(
    "Start your day with an energising yoga session in the park. Bring your own mat, stay hydrated"
  );
  const [tag, setTag] = useState("Lifestyle");
  const [region, setRegion] = useState<Region>({
    latitude: -37.800,
    longitude: 144.966,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Meetups</Text>
        <TouchableOpacity style={styles.plusBtn} onPress={() => router.push("/newMeetup")}>
          <Ionicons name="add" size={20} color="#3b5aa9" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 28 }}>
        {/* Search */}
        <View style={[styles.searchBox, { width: PANEL_W }]}>
          <Ionicons name="search" size={18} />
          <TextInput style={styles.searchInput} placeholder="Search meetups..." />
        </View>

        {/* Form card (prefilled) */}
        <View style={[styles.card, { width: PANEL_W }]}>
          <LinedRow label="Name" value={name} onChange={setName} />
          <LinedRow label="Time" value={time} onChange={setTime} />
          <LinedRow label="Participants" value={participants} onChange={setParticipants} />

          <Text style={styles.subLabel}>Description</Text>
          <TextInput
            style={styles.textArea}
            multiline
            value={desc}
            onChangeText={setDesc}
          />

          <Text style={styles.subLabel}>Tags</Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 6 }}>
            <View style={styles.singleTag}>
              <Ionicons name="checkmark" size={12} color="white" style={{ marginRight: 6 }} />
              <Text style={{ color: "white", fontWeight: "700" }}>{tag}</Text>
            </View>
          </View>

          <Text style={[styles.subLabel, { marginTop: 6 }]}>Location</Text>
          <View pointerEvents="none">
            <Text style={[styles.disabledText]}>Carlton (0, 0)</Text>
          </View>
        </View>

        {/* Location card */}
        <View style={[styles.card, { width: PANEL_W }]}>
          <View style={[styles.searchBox, { marginBottom: 12 }]}>
            <Ionicons name="search" size={18} />
            <TextInput style={styles.searchInput} placeholder="search location" />
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

        {/* Footer buttons */}
        <View style={[styles.footerRow, { width: PANEL_W }]}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={() => router.push({ pathname: "/manageMyMeetupView", params: { id } })}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function LinedRow({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.subLabel}>{label}</Text>
      <TextInput
        style={styles.underlinedInput}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#dfeaff" },
  header: {
    paddingTop: 14, paddingHorizontal: 16, paddingBottom: 10,
    flexDirection: "row", alignItems: "center",
  },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center", fontSize: 26, fontWeight: "700", color: "#3b5aa9" },
  plusBtn: {
    width: 32, height: 32, alignItems: "center", justifyContent: "center",
    backgroundColor: "#cfe0ff", borderRadius: 10,
  },

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
  singleTag: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#222", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
  },
  disabledText: { color: "#8fa7e6" },

  mapWrap: { borderRadius: 12, overflow: "hidden", height: 140, marginBottom: 8 },
  map: { flex: 1 },
  locText: { textAlign: "center", color: "#3b5aa9", marginTop: 4 },

  footerRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  cancelBtn: {
    backgroundColor: "#d8d0cb", paddingVertical: 12, paddingHorizontal: 22, borderRadius: 10,
  },
  cancelText: { color: "#5e5651", fontWeight: "700" },
  submitBtn: {
    backgroundColor: "#d84535", paddingVertical: 12, paddingHorizontal: 22, borderRadius: 10,
  },
  submitText: { color: "white", fontWeight: "700" },
});