import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Firestore
import { collection, onSnapshot, query, where, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../../../firebase";

const { width } = Dimensions.get("window");
const PANEL_W = Math.min(640, width - 28);

type Item = { id: string; title: string; date: string };

export default function MeetupManageMyMeetup() {
  const router = useRouter();
  const [queryText, setQueryText] = useState("");
  const [items, setItems] = useState<Item[]>([]);

  // 从后端读取当前用户创建的 meetups
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setItems([]);
      return;
    }
    const qRef = query(collection(db, "meetups"), where("creatorId", "==", uid));
    const unsub = onSnapshot(qRef, (snap) => {
      const rows: Item[] = snap.docs.map((d) => {
        const data = d.data() as any;
        const jsDate: Date | null =
          data?.date?.toDate?.() ? data.date.toDate() : null;
        return {
          id: d.id,
          title: data?.title ?? "",
          date: jsDate ? toDisplayDate(jsDate) : "",
        };
      });
      // sort by date desc on client to avoid composite index
      rows.sort((a, b) => fromDisplayDate(b.date) - fromDisplayDate(a.date));
      setItems(rows);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => x.title.toLowerCase().includes(q));
  }, [items, queryText]);

  const confirmDelete = (id: string, title: string) => {
    Alert.alert(
      "Delete meetup",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "meetups", id));
              // onSnapshot will automatically refresh the interface
            } catch (e: any) {
              Alert.alert("Delete failed", e?.message ?? "Unknown error");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View className="header" style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/Interest/myMeetups")}
          style={styles.backBtn}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Meetups</Text>
        <TouchableOpacity
          style={styles.plusBtn}
          onPress={() => router.push("/(tabs)/Interest/newMeetup")}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
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
            value={queryText}
            onChangeText={setQueryText}
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
                  router.push({
                    pathname: "/Interest/manageMyMeetupEdit",
                    params: { id: it.id },
                  })
                }
              >
                <Text style={styles.pillText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pillBtn, { backgroundColor: "#ff7a6a" }]}
                onPress={() => confirmDelete(it.id, it.title)}
              >
                <Text style={styles.pillText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pillBtn, { backgroundColor: "#7bd39a" }]}
                onPress={() =>
                  router.push({
                    pathname: "/Interest/manageMyMeetupView",
                    params: { id: it.id },
                  })
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

function toDisplayDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}/${mm}/${yy}`;
}

// Only used for local sorting
function fromDisplayDate(s: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{2})$/.exec(s);
  if (!m) return 0;
  const d = new Date(2000 + Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return d.getTime();
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#dfeaff" },
  header: {
    paddingTop: 68,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "700", color: "#2c3e50" },
  plusBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#cfe0ff",
    borderRadius: 10,
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
    marginTop: 0,
  },
  searchInput: { marginLeft: 8, flex: 1 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  rowTitle: { fontWeight: "700", color: "#2c2c2c", marginBottom: 2 },
  rowDate: { color: "#7a8aaa" },
  pillBtn: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pillText: { color: "white", fontWeight: "700" },
});
