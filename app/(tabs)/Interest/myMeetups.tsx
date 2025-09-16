import React, { useState, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Meetup = { id: string; title: string; date: string };

const MY_MEETUPS: Meetup[] = [
  { id: "1", title: "Morning Yoga", date: "17/9/25" },
  { id: "2", title: "Morning Yoga2", date: "18/9/25" },
  { id: "3", title: "Morning Yoga3", date: "19/9/25" },
  { id: "4", title: "Morning Yoga4", date: "20/9/25" },
  { id: "5", title: "Morning Yoga5", date: "21/9/25" },
];

export default function MyMeetupsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return MY_MEETUPS;
    const q = query.toLowerCase();
    return MY_MEETUPS.filter((m) => m.title.toLowerCase().includes(q));
  }, [query]);

  const onWithdraw = (m: Meetup) => {
    Alert.alert("Withdraw", `You withdrew from ${m.title}`);
  };

  const onManageCreated = () => {
    Alert.alert("Manage", "Go to manage my created meetups");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => console.log("Back")}>
            <Ionicons name="chevron-back" size={22} color="#2c3e50" />
          </Pressable>
          <Text style={styles.title}>My Meetups</Text>
          <Pressable hitSlop={8} onPress={() => console.log("Add new meetup")}>
            <Ionicons name="add" size={22} color="#3b82f6" />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            placeholder="Search meetups..."
            placeholderTextColor="#9aa3b2"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Meetups list */}
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          {filtered.map((item) => (
            <View key={item.id} style={styles.meetupRow}>
              <Text style={styles.meetupName}>{item.title}</Text>
              <View style={styles.rowRight}>
                <Text style={styles.meetupDate}>{item.date}</Text>
                <Pressable
                  style={styles.withdrawBtn}
                  onPress={() => onWithdraw(item)}
                >
                  <Text style={styles.withdrawText}>Withdraw</Text>
                </Pressable>
              </View>
            </View>
          ))}

          {filtered.length === 0 && (
            <Text style={styles.empty}>No meetups found.</Text>
          )}
        </View>

        {/* Manage created */}
        <Pressable style={styles.manageBtn} onPress={onManageCreated}>
          <Text style={styles.manageText}>Manage My Created Meetups</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const BG = "#D6E6FD";
const CARD_BG = "#ffffff";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
  },
  searchBox: {
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  meetupRow: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  meetupName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  meetupDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  withdrawBtn: {
    backgroundColor: "#e9f0ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  withdrawText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#345BCE",
  },
  manageBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#C6DBFA",
    alignItems: "center",
    justifyContent: "center",
  },
  manageText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#345BCE",
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#6b7280",
  },
});
