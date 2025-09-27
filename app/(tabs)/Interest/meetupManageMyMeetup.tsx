import React, { useEffect, useMemo, useRef, useState } from "react";
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

const PATHS = {
  back: "/(tabs)/Interest/myMeetups",
  new: "/(tabs)/Interest/newMeetup",
  edit: "/(tabs)/Interest/manageMyMeetupEdit",
  view: "/(tabs)/Interest/manageMyMeetupView",
} as const;

// Use a platform-safe timer handle type for React Native
type TimerHandle = ReturnType<typeof setTimeout>;

export default function MeetupManageMyMeetup() {
  const router = useRouter();

  // Raw input value + debounced value for search
  const [queryInput, setQueryInput] = useState("");
  const [queryText, setQueryText] = useState("");

  const [items, setItems] = useState<Item[]>([]);

  // Undo bar state: store pending-deleted item and timer
  const [pendingDelete, setPendingDelete] = useState<Item | null>(null);
  const pendingTimerRef = useRef<TimerHandle | null>(null);

  // Read current user's meetups
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
        const jsDate: Date | null = data?.date?.toDate?.() ? data.date.toDate() : null;
        return {
          id: d.id,
          title: data?.title ?? "",
          date: jsDate ? toDisplayDate(jsDate) : "",
        };
      });
      // Sort by date desc on client to avoid composite index
      rows.sort((a, b) => fromDisplayDate(b.date) - fromDisplayDate(a.date));
      setItems(rows);
    });
    return () => unsub();
  }, []);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setQueryText(queryInput.trim()), 200);
    return () => clearTimeout(t);
  }, [queryInput]);

  const filtered = useMemo(() => {
    const q = queryText.toLowerCase();
    if (!q) return items;
    return items.filter((x) => x.title.toLowerCase().includes(q));
  }, [items, queryText]);

  // Optimistic delete + undo
  const confirmDelete = (id: string, title: string) => {
    Alert.alert("Delete meetup", `Are you sure you want to delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => optimisticDelete(id),
      },
    ]);
  };

  const optimisticDelete = (id: string) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;

    // 1) Optimistically update UI: remove item immediately
    setItems((prev) => prev.filter((x) => x.id !== id));
    setPendingDelete(it);

    // 2) Start a timer to perform the real delete (e.g., after 5s), allowing undo
    if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    pendingTimerRef.current = setTimeout(async () => {
      try {
        await deleteDoc(doc(db, "meetups", id));
        // onSnapshot will refresh the list; clear pending state
        setPendingDelete(null);
        pendingTimerRef.current = null;
      } catch (e: any) {
        // Rollback UI on failure
        setItems((prev) => {
          const next = [...prev, it];
          next.sort((a, b) => fromDisplayDate(b.date) - fromDisplayDate(a.date));
          return next;
        });
        setPendingDelete(null);
        pendingTimerRef.current = null;
        Alert.alert("Delete failed", e?.message ?? "Unknown error");
      }
    }, 5000);
  };

  const undoDelete = () => {
    if (!pendingDelete) return;
    // Cancel the real delete
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    // Restore UI
    setItems((prev) => {
      const next = [...prev, pendingDelete];
      next.sort((a, b) => fromDisplayDate(b.date) - fromDisplayDate(a.date));
      return next;
    });
    setPendingDelete(null);
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace(PATHS.back)}
          style={styles.backBtn}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Ionicons name="chevron-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Meetups</Text>
        <TouchableOpacity
          style={styles.plusBtn}
          onPress={() => router.push(PATHS.new)}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Ionicons name="add" size={20} color="#3b5aa9" />
        </TouchableOpacity>
      </View>

      {/* Undo bar (shown for 5s after optimistic delete) */}
      {pendingDelete && (
        <View style={styles.undoBar}>
          <Text style={styles.undoText} numberOfLines={1}>
            Deleted “{pendingDelete.title}”
          </Text>
          <TouchableOpacity onPress={undoDelete} style={styles.undoBtn}>
            <Text style={styles.undoBtnText}>Undo</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={{ alignItems: "center", paddingBottom: 28 }}>
        {/* Search */}
        <View style={[styles.searchBox, { width: PANEL_W }]}>
          <Ionicons name="search" size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search meetups..."
            value={queryInput}
            onChangeText={setQueryInput}
            returnKeyType="search"
          />
          {queryInput.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQueryInput("");
                setQueryText("");
              }}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="close-circle" size={18} />
            </TouchableOpacity>
          )}
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
                  router.push({ pathname: PATHS.edit, params: { id: it.id } })
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
                  router.push({ pathname: PATHS.view, params: { id: it.id } })
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

  undoBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "#2c3e50",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  undoText: { color: "white", flex: 1, marginRight: 12 },
  undoBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#6aa8ff",
    borderRadius: 8,
  },
  undoBtnText: { color: "white", fontWeight: "700" },

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
    columnGap: 6,
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
