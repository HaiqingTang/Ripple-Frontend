import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  FlatList,
  Dimensions,
  Platform,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  getDocs,
  Query,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../../firebase";

/** ============ Types ============ */
type Club = {
  id: string;
  name: string;
  coverImageUrl?: string;
  members?: string[];
};

/** ============ Constants ============ */
const { width: SCREEN_W } = Dimensions.get("window");
const H_PADDING = 24;
const GAP = 24;
const CARD_W = Math.floor((SCREEN_W - H_PADDING * 2 - GAP * 2) / 3);
const IMAGE_H = 92;
const PLACEHOLDER =
  "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800&auto=format&fit=crop";

export default function MyClubs() {
  const router = useRouter();
  const [queryText, setQueryText] = useState("");
  const [data, setData] = useState<Club[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  // Listen to auth state changes (set uid or clear when signed out)
  useEffect(() => {
    const stop = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });
    return () => stop();
  }, []);

  // Subscribe to "my clubs". If the composite index is missing, fall back to an unordered query.
  useEffect(() => {
    if (!uid) {
      setData([]);
      return;
    }

    const base = query(
      collection(db, "clubs"),
      where("members", "array-contains", uid)
    );
    const qOrdered = query(base, orderBy("name", "asc"));
    const qPlain = base;

    let unsub: (() => void) | null = null;

    function listen(q: Query, isFallback = false) {
      if (unsub) unsub();
      unsub = onSnapshot(
        q,
        (snap) => {
          // console.log(isFallback ? "myClubs (fallback) size:" : "myClubs size:", snap.size);
          const list: Club[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));
          setData(list);
        },
        (err) => {
          // When a composite index is missing, Firestore throws "failed-precondition".
          if (!isFallback && err.code === "failed-precondition") {
            // Switch to the unordered query automatically so the page still works.
            listen(qPlain, true);
          } else {
            console.log("myClubs onSnapshot error:", err.code, err.message);
          }
        }
      );
    }

    listen(qOrdered);

    return () => {
      if (unsub) unsub();
    };
  }, [uid]);

  // Local text filter
  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) return data;
    return data.filter((c) => (c.name ?? "").toLowerCase().includes(q));
  }, [queryText, data]);

  // Pull-to-refresh: subscription already keeps things live; this only triggers a read for the UI effect.
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (uid) {
        await getDocs(
          query(
            collection(db, "clubs"),
            where("members", "array-contains", uid),
            orderBy("name", "asc")
          )
        ).catch(() => {
          // If the index is missing here too, ignore; the live subscription will already have fallen back.
        });
      }
    } finally {
      setRefreshing(false);
    }
  }, [uid]);

  const openClub = (club: Club) => {
    router.push({
      pathname: "/(tabs)/Interest/clubTopic",
      params: { name: club.name },
    });
  };

  /** Header */
  const Header = () => (
    <View style={styles.headerRow}>
      <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
        <Ionicons name="chevron-back" size={24} color="#6B7AFF" />
      </Pressable>
      <Text style={styles.title}>My Clubs</Text>
      <View style={{ width: 24 }} />
    </View>
  );

  /** SearchBar */
  const SearchBarEl = useMemo(() => (
    <View style={styles.searchWrap} pointerEvents="box-none">
      <Ionicons name="search" size={18} color="#99A2C0" style={{ marginHorizontal: 10 }} />
      <TextInput
        placeholder="Search clubs..."
        placeholderTextColor="#99A2C0"
        value={queryText}
        onChangeText={setQueryText}
        returnKeyType="search"
        style={styles.searchInput}
        autoCorrect={false}
        autoCapitalize="none"
        blurOnSubmit={false}
        underlineColorAndroid="transparent"
      />
      {queryText.length > 0 ? (
        <Pressable onPress={() => setQueryText("")} hitSlop={10} style={{ paddingHorizontal: 10 }}>
          <Ionicons name="close-circle" size={18} color="#99A2C0" />
        </Pressable>
      ) : (
        <View style={{ width: 38 }} />
      )}
    </View>
  ), [queryText]);

  /** Single card */
  const renderItem = ({ item }: { item: Club }) => (
    <Pressable style={styles.card} onPress={() => openClub(item)}>
      <Image
        source={{ uri: item.coverImageUrl || PLACEHOLDER }}
        style={styles.cardImage}
      />
      <Text style={styles.cardLabel} numberOfLines={1}>
        {item.name}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Header />
      {SearchBarEl}

      <FlatList
        data={filtered}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: H_PADDING }}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B7AFF" />}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: H_PADDING, marginTop: 16 }}>
            <Text style={{ color: "#5C637C", textAlign: "center" }}>
              {uid ? "You haven’t joined any clubs yet." : "Please sign in to see your clubs."}
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 24 }} />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />

      {/* Static bottom icons (visual only) */}
      <View style={styles.bottomBar}>
        <Ionicons name="happy-outline" size={26} color="#222" />
        <Ionicons name="document-text-outline" size={26} color="#222" />
        <Ionicons name="chatbubble-ellipses-outline" size={26} color="#222" />
        <Ionicons name="time-outline" size={26} color="#222" />
        <Ionicons name="person-outline" size={26} color="#222" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dbe7ff",
    paddingTop: Platform.select({ ios: 70, android: 20 }),
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: H_PADDING,
    marginBottom: 12,
  },

  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2937",
  },

  searchWrap: {
    marginHorizontal: H_PADDING,
    height: 48,
    borderRadius: 16,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#223",
  },

  card: {
    width: CARD_W,
    alignItems: "center",
    marginTop: 20,
  },

  cardImage: {
    width: CARD_W,
    height: IMAGE_H,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: "#EAF0FF",
  },

  cardLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111826",
  },

  bottomBar: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#cfd8ff",
    backgroundColor: "#DDE7FF",
  },
});
