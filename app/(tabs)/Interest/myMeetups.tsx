import React, { useEffect, useMemo, useRef, useState } from "react";
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
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  doc,
  updateDoc,
  arrayRemove,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
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
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [items, setItems] = useState<Meetup[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const alertedRef = useRef(false);

  // debounce search text (250ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(queryText.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [queryText]);

  useEffect(() => {
    // Subscribe to meetups that the current user joined, newest first
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(
      collection(db, "meetups"),
      where("participants", "array-contains", uid),
      orderBy("date", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap: QuerySnapshot<DocumentData>) => {
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
        setLoadError(null);
      },
      (err) => {
        // surface permission/index/composite index errors to user
        setLoadError(err?.message || "Failed to load meetups.");
        if (!alertedRef.current) {
          alertedRef.current = true;
          Alert.alert(
            "Couldn't load your meetups",
            `${err?.message || "Unknown error"}`,
            [{ text: "OK" }]
          );
        }
      }
    );

    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    if (!debouncedQuery) return items;
    return items.filter((m) => m.title.toLowerCase().includes(debouncedQuery));
  }, [debouncedQuery, items]);

  const onOpenDetail = (m: Meetup) => {
    router.push({
      pathname: "/(tabs)/Interest/meetupDetail1",
      params: { id: m.id },
    });
  };

  const onWithdraw = (m: Meetup) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Not signed in", "Please sign in first.");
      return;
    }
    // block creator withdrawal to avoid orphaned meetups
    if (m.creatorId && m.creatorId === uid) {
      Alert.alert(
        "Owner cannot withdraw",
        "You are the creator of this meetup. Transfer ownership or delete it instead."
      );
      return;
    }

    Alert.alert(
      "Withdraw",
      `Leave this meetup: "${m.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              await updateDoc(doc(db, "meetups", m.id), {
                participants: arrayRemove(uid),
              });
            } catch (e: any) {
              Alert.alert("Withdraw failed", e?.message ?? "Unknown error");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const onManageCreated = () => {
    router.push("/(tabs)/Interest/meetupManageMyMeetup");
  };

  const ListHeader = (
    <View style={{ paddingTop: 0 }}>
      {/* header */}
      <View style={styles.header}>
        <Pressable hitSlop={8} onPress={() => router.replace("/(tabs)/Interest/meetupMainPage")}>
          <Ionicons name="chevron-back" size={22} color="#2c3e50" />
        </Pressable>
        <Text style={styles.title}>My Meetups</Text>
        <Pressable hitSlop={8} onPress={() => router.push("/(tabs)/Interest/newMeetup")}>
          <Ionicons name="add" size={22} color="#3b82f6" />
        </Pressable>
      </View>

      {/* error banner (when onSnapshot fails) */}
      {loadError ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color="#b91c1c" />
          <Text style={styles.errorText} numberOfLines={2}>
            {loadError}
          </Text>
        </View>
      ) : null}

      {/* search box */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#6b7280" />
        <TextInput
          placeholder="Search meetups..."
          placeholderTextColor="#9aa3b2"
          style={styles.searchInput}
          value={queryText}
          onChangeText={setQueryText}
          returnKeyType="search"
        />
        {/* clear button */}
        {queryText.length > 0 && (
          <Pressable
            accessibilityLabel="Clear search"
            hitSlop={8}
            onPress={() => setQueryText("")}
            style={styles.clearBtn}
          >
            <Ionicons name="close-circle" size={18} color="#9aa3b2" />
          </Pressable>
        )}
      </View>
    </View>
  );

  const ListFooter = (
    <Pressable style={styles.manageBtn} onPress={onManageCreated}>
      <Text style={styles.manageText}>Manage My Created Meetups</Text>
    </Pressable>
  );

  const currentUid = auth.currentUser?.uid;

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isOwner = !!currentUid && item.creatorId === currentUid;
          return (
            <Pressable onPress={() => onOpenDetail(item)} style={[styles.meetupRow, { marginHorizontal: 16 }]}>
              <Text style={styles.meetupName} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.rowRight}>
                <Text style={styles.meetupDate}>{item.date}</Text>
                {isOwner ? (
                  <View style={[styles.withdrawBtn, styles.ownerPill]}>
                    <Text style={[styles.withdrawText, styles.ownerText]}>Owner</Text>
                  </View>
                ) : (
                  <Pressable style={styles.withdrawBtn} onPress={() => onWithdraw(item)}>
                    <Text style={styles.withdrawText}>Withdraw</Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <Text style={styles.empty}>{loadError ? "Unable to load meetups." : "No meetups found."}</Text>
        }
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

  errorBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#fee2e2",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorText: { color: "#991b1b", flex: 1, fontSize: 12 },

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
  clearBtn: { paddingHorizontal: 6, paddingVertical: 6 },

  meetupRow: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meetupName: { fontSize: 15, fontWeight: "700", color: "#111827", maxWidth: "52%" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  meetupDate: { fontSize: 12, fontWeight: "600", color: "#6b7280" },
  withdrawBtn: {
    backgroundColor: "#e9f0ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  withdrawText: { fontSize: 12, fontWeight: "700", color: "#345BCE" },
  ownerPill: { backgroundColor: "#e5f9ed" },
  ownerText: { color: "#127c3b" },

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
