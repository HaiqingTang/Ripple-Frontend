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
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const PANEL_W = Math.min(640, width - 28);

type Item = { id: string; title: string; date: string };

const MOCK: Item[] = [
  { id: "1", title: "Morning Yoga", date: "18/9/25" },
  { id: "2", title: "Music Yoga", date: "17/6/25" },
  { id: "3", title: "Sports Meetup", date: "1/4/25" },
];

export default function MeetupManageMyMeetup() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = MOCK.filter(
    (x) => x.title.toLowerCase().includes(query.toLowerCase())
  );

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
          <TextInput
            style={styles.searchInput}
            placeholder="Search meetups..."
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* List */}
        <View style={{ width: PANEL_W, marginTop: 14 }}>
          {filtered.map((it) => (
            <View key={it.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{it.title}</Text>
                <Text style={styles.rowDate}>{it.date}</Text>
              </View>

              <TouchableOpacity
                style={[styles.pillBtn, { backgroundColor: "#6aa8ff" }]}
                onPress={() =>
                  router.push({ pathname: "/Interest/manageMyMeetupEdit", params: { id: it.id } })
                }
              >
                <Text style={styles.pillText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pillBtn, { backgroundColor: "#ff7a6a" }]}
                onPress={() => {}}
              >
                <Text style={styles.pillText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pillBtn, { backgroundColor: "#7bd39a" }]}
                onPress={() =>
                  router.push({ pathname: "/Interest/manageMyMeetupView", params: { id: it.id } })
                }
              >
                <Text style={styles.pillText}>View</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
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

  row: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "white", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12,
    marginBottom: 10,
  },
  rowTitle: { fontWeight: "700", color: "#2c2c2c", marginBottom: 2 },
  rowDate: { color: "#7a8aaa" },
  pillBtn: {
    marginLeft: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
  },
  pillText: { color: "white", fontWeight: "700" },
});