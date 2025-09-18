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
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../../firebase";

/** ============ 类型 ============ */
type Club = {
  id: string;
  name: string;
  coverImageUrl?: string;
  members?: string[];
};

/** ============ 常量 ============ */
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

// Listen for login status -> Subscribe to my club
  useEffect(() => {
    const stop = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Empty when not logged in; you can also jump to the login page here
        setData([]);
        return;
      }
      const qMine = query(
        collection(db, "clubs"),
        where("members", "array-contains", user.uid),
        orderBy("name", "asc")
      );
      const unsub = onSnapshot(
        qMine,
        (snap) => {
          const list: Club[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          }));
          setData(list);
        },
        (err) => console.log("myClubs onSnapshot error:", err.code, err.message)
      );
      // 登录态变化或页面卸载时取消订阅
      return () => unsub();
    });

    return () => stop();
  }, []);

  // Local search filtering
  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) return data;
    return data.filter((c) => (c.name ?? "").toLowerCase().includes(q));
  }, [queryText, data]);

  // Pull down to refresh (real-time subscriptions are automatically updated, this only triggers a read display refresh effect)
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await getDocs(
          query(
            collection(db, "clubs"),
            where("members", "array-contains", user.uid),
            orderBy("name", "asc")
          )
        );
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  const openClub = (club: Club) => {
    Alert.alert("Open Club", club.name);
  };

  /** Header） */
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
  const SearchBar = () => (
    <View style={styles.searchWrap}>
      <Ionicons name="search" size={18} color="#99A2C0" style={{ marginHorizontal: 10 }} />
      <TextInput
        placeholder="Search clubs..."
        placeholderTextColor="#99A2C0"
        value={queryText}
        onChangeText={setQueryText}
        returnKeyType="search"
        style={styles.searchInput}
      />
      <Pressable onPress={() => setQueryText(queryText)} hitSlop={10} style={{ paddingHorizontal: 10 }}>
        <Ionicons name="search" size={18} color="#99A2C0" />
      </Pressable>
    </View>
  );

/** Single club card */
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
      <SearchBar />

      <FlatList
        data={filtered}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: H_PADDING }}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B7AFF" />
        }
        ListEmptyComponent={
          <View style={{ paddingHorizontal: H_PADDING, marginTop: 16 }}>
            <Text style={{ color: "#5C637C", textAlign: "center" }}>
              You haven’t joined any clubs yet.
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 24 }} />}
      />

      {/* 底部图标（静态示意） */}
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
    backgroundColor: "#DDE7FF",
    paddingTop: Platform.select({ ios: 48, android: 20 }),
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: H_PADDING,
    marginBottom: 10,
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
    fontSize: 34,
    fontWeight: "800",
    color: "#6B7AFF",
    letterSpacing: 0.5,
  },

  /* Search */
  searchWrap: {
    marginHorizontal: H_PADDING,
    height: 48,
    borderRadius: 24,
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

  /* Card */
  card: {
    width: CARD_W,
    alignItems: "center",
    marginTop: 22,
  },
  cardImage: {
    width: CARD_W,
    height: IMAGE_H,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: "#EAF0FF",
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111826",
  },

  /* Bottom bar */
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
