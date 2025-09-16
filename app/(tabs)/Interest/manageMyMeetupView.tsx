import React from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const PANEL_W = Math.min(640, width - 28);

const AVATARS = [
  { id: "1", name: "Ethan", uri: "https://i.pravatar.cc/100?img=12" },
  { id: "2", name: "Olivia", uri: "https://i.pravatar.cc/100?img=25" },
  { id: "3", name: "Sophia", uri: "https://i.pravatar.cc/100?img=31" },
];

export default function ManageMyMeetupView() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Meetups</Text>
        <TouchableOpacity style={styles.plusBtn} onPress={() => router.push("/Interest/newMeetup")}>
          <Ionicons name="add" size={20} color="#3b5aa9" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 28 }}>
        {/* Search */}
        <View style={[styles.searchBox, { width: PANEL_W }]}>
          <Ionicons name="search" size={18} />
          <TextInput style={styles.searchInput} placeholder="Search meetups..." />
        </View>

        {/* Readonly card */}
        <View style={[styles.card, { width: PANEL_W }]}>
          <RowDisplay label="Name" value="Morning Yoga" />
          <RowDisplay label="Time" value="25/8 8:00 am" />
          <RowDisplay label="Participants" value="15" />

          <Text style={styles.subLabel}>Description</Text>
          <View style={styles.textAreaReadonly}>
            <Text style={styles.descText}>
              Start your day with an energising yoga session in the park. Bring your own mat, stay hydrated
            </Text>
          </View>

          <Text style={styles.subLabel}>Tags</Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
            <View style={styles.singleTag}>
              <Ionicons name="checkmark" size={12} color="white" style={{ marginRight: 6 }} />
              <Text style={{ color: "white", fontWeight: "700" }}>Lifestyle</Text>
            </View>
          </View>

          <Text style={styles.subLabel}>Location</Text>
          <Text style={{ color: "#8fa7e6", marginBottom: 8 }}>Carlton (0, 0)</Text>
        </View>

        {/* Participant list card */}
        <View style={[styles.card, { width: PANEL_W }]}>
          <Text style={[styles.subLabel, { marginBottom: 8 }]}>Participant List:</Text>
          <View style={{ flexDirection: "row", gap: 18 }}>
            {AVATARS.map((a) => (
              <View key={a.id} style={{ alignItems: "center" }}>
                <Image
                  source={{ uri: a.uri }}
                  style={{ width: 44, height: 44, borderRadius: 22, marginBottom: 6 }}
                />
                <Text style={{ color: "#3b5aa9", fontWeight: "600" }}>{a.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
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

  underlinedDisplay: {
    borderBottomWidth: 1, borderBottomColor: "#afc6ff", paddingVertical: 6,
  },
  textAreaReadonly: {
    minHeight: 80, borderRadius: 10, backgroundColor: "white",
    padding: 10, justifyContent: "center", marginBottom: 8,
  },
  descText: { color: "#314c9b" },
  singleTag: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#222", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
  },
});