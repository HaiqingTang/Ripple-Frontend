import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db, auth } from "../../../firebase";

type Meetup = {
  id: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
  creatorId?: string;
  participants: string[];
  category?: string;
};

export default function MyMeetupsPage() {
  const router = useRouter();
  const [queryText, setQueryText] = useState("");
  const [items, setItems] = useState<Meetup[]>([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(
      collection(db, "meetups"),
      where("participants", "array-contains", uid),
      orderBy("date", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const next: Meetup[] = snap.docs.map((d) => {
        const data = d.data() as any;
        const dateStr =
          typeof data.date?.toDate === "function"
            ? toDisplayDate(data.date.toDate())
            : String(data.date ?? "");
        return {
          id: d.id,
          title: data.title ?? "",
          date: dateStr,
          location: data.location,
          description: data.description,
          creatorId: data.creatorId,
          participants: Array.isArray(data.participants) ? data.participants : [],
          category: data.category,
        };
      });
      setItems(next);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) return items;
    return items.filter((m) => m.title.toLowerCase().includes(q));
  }, [queryText, items]);

  const onWithdraw = (m: Meetup) => {
    Alert.alert("Withdraw", `You withdrew from ${m.title}`);
  };

  const onManageCreated = () => {
    Alert.alert("Manage", "Go to manage my created meetups");
  };

  // header + search moved into FlatList header
  const ListHeader = (
    <View style={{ paddingTop: 0 }}>
      {/* header */}
      <View style={styles.header}>
        <Pressable
          hitSlop={8}
          onPress={() => router.replace("/(tabs)/Interest/meetupMainPage")}
        >
          <Ionicons name="chevron-back" size={22} color="#2c3e50" />
        </Pressable>
        <Text style={styles.title}>My Meetups</Text>
        <Pressable hitSlop={8} onPress={() => router.push("/(tabs)/Interest/newMeetup")}>
          <Ionicons name="add" size={22} color="#3b82f6" />
        </Pressable>
      </View>

      {/* search box */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#6b7280" />
        <TextInput
          placeholder="Search meetups..."
          placeholderTextColor="#9aa3b2"
          style={styles.searchInput}
          value={queryText}
          onChangeText={setQueryText}
        />
      </View>
    </View>
  );

  // footer button moved into FlatList footer
  const ListFooter = (
    <Pressable style={styles.manageBtn} onPress={onManageCreated}>
      <Text style={styles.manageText}>Manage My Created Meetups</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.meetupRow, { marginHorizontal: 16 }]}>
            <Text style={styles.meetupName}>{item.title}</Text>
            <View style={styles.rowRight}>
              <Text style={styles.meetupDate}>{item.date}</Text>
              <Pressable style={styles.withdrawBtn} onPress={() => onWithdraw(item)}>
                <Text style={styles.withdrawText}>Withdraw</Text>
              </Pressable>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={<Text style={styles.empty}>No meetups found.</Text>}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 0, gap: 0 }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={16}
        windowSize={8}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}

function toDisplayDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}/${mm}/${yy}`;
}

const BG = "#dbe7ff";
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
  title: { fontSize: 18, fontWeight: "700", color: "#2c3e50" },
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
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },
  meetupRow: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meetupName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  meetupDate: { fontSize: 12, fontWeight: "600", color: "#6b7280" },
  withdrawBtn: {
    backgroundColor: "#e9f0ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  withdrawText: { fontSize: 12, fontWeight: "700", color: "#345BCE" },
  manageBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#e9f0ff",
    alignItems: "center",
    justifyContent: "center",
  },
  manageText: { fontSize: 15, fontWeight: "700", color: "#345BCE" },
  empty: { textAlign: "center", marginTop: 20, color: "#6b7280" },
});
