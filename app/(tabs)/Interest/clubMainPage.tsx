import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, StyleSheet, Image, ImageBackground, TextInput, Pressable,
  FlatList, ActivityIndicator, RefreshControl, Dimensions, Platform,
  ScrollView, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  collection, getDocs, limit, onSnapshot, orderBy, query, where,
  Query, Unsubscribe,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../../firebase";

type Club = {
  id: string;
  name: string;
  coverImageUrl?: string;
  category?: string;
  isMember?: boolean;
  members?: string[];
};

type Post = {
  id: string;
  title: string;
  coverImageUrl?: string;
  clubId?: string;
  hot?: boolean;
  createdAt?: any; // Timestamp
};

const { width: SCREEN_W } = Dimensions.get("window");
const PANEL_W = Math.min(640, SCREEN_W - 28);
const HERO_H = Math.round((PANEL_W * 9) / 16);
const PLACEHOLDER =
  "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop";
const AVATAR_PH =
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400&auto=format&fit=crop";
const debug      = __DEV__ ? (...a: any[]) => console.log(...a)   : (..._a: any[]) => {};
const debugWarn  = __DEV__ ? (...a: any[]) => console.warn(...a)  : (..._a: any[]) => {};
const debugError = __DEV__ ? (...a: any[]) => console.error(...a) : (..._a: any[]) => {};

export default function ClubMainPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [hotPost, setHotPost] = useState<Post | null>(null);
  const [myClubs, setMyClubs] = useState<Club[] | null>(null);
  const [allClubs, setAllClubs] = useState<Club[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const hotUnsubRef = useRef<Unsubscribe | null>(null);
  const myClubsUnsubRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    // where(hot) + orderBy(createdAt) + limit(1)
    const qWithOrder: Query = query(
      collection(db, "posts"),
      where("hot", "==", true),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    // where(hot) + limit(1)
    const qFallback: Query = query(
      collection(db, "posts"),
      where("hot", "==", true),
      limit(1)
    );

    function listen(q: Query, isFallback = false) {
      if (hotUnsubRef.current) hotUnsubRef.current();
      hotUnsubRef.current = onSnapshot(
        q,
        (snap) => {
          debug(isFallback ? "hot (fallback) size:" : "hot size:", snap.size);
          const d = snap.docs[0];
          setHotPost(d ? ({ id: d.id, ...(d.data() as any) } as Post) : null);
        },
        (err) => {
          debugError("qHot error:", err.code, err.message);
          // failed-precondition / requires an index
          if (!isFallback && err.code === "failed-precondition") {
            // Automatically switch to unsorted query
            listen(qFallback, true);
          }
        }
      );
    }

    listen(qWithOrder);

    return () => {
      if (hotUnsubRef.current) {
        hotUnsubRef.current();
        hotUnsubRef.current = null;
      }
    };
  }, []);

/** All clubs: real-time subscription (local search and filtering) */
  useEffect(() => {
    const qAll = query(collection(db, "clubs"), orderBy("name", "asc"));
    const unsub = onSnapshot(
      qAll,
      (snap) => {
        debug("all clubs size:", snap.size);
        const list: Club[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        setAllClubs(list);
        setLoading(false);
      },
      (err) => debugError("qAll error:", err.code, err.message)
    );
    return () => unsub();
  }, []);

  /** My clubs: wait for login before subscribing (members array contains uid) */
  useEffect(() => {
    const stopAuth = onAuthStateChanged(auth, (user) => {
      if (myClubsUnsubRef.current) {
        myClubsUnsubRef.current();
        myClubsUnsubRef.current = null;
      }

      if (!user) {
        debug("auth: not signed in");
        setMyClubs([]);
        return;
      }

      const qMine = query(
        collection(db, "clubs"),
        where("members", "array-contains", user.uid)
      );

      myClubsUnsubRef.current = onSnapshot(
        qMine,
        (snap) => {
          debug("my clubs size:", snap.size);
          const list: Club[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
          setMyClubs(list);
        },
        (err) => debugError("qMine error:", err.code, err.message)
      );
    });

    return () => {
      stopAuth();
      if (myClubsUnsubRef.current) {
        myClubsUnsubRef.current();
        myClubsUnsubRef.current = null;
      }
    };
  }, []);


/** Pull down to refresh (real-time subscriptions are automatically updated; only one read is triggered here to present the loading animation) */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        getDocs(
          query(
            collection(db, "posts"),
            where("hot", "==", true),
            orderBy("createdAt", "desc"),
            limit(1)
          )
        ).catch(() => getDocs(query(collection(db, "posts"), where("hot", "==", true), limit(1)))),
        getDocs(query(collection(db, "clubs"), orderBy("name", "asc"))),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  /** Local search (only works on All Clubs; if you want to work on My Clubs, also filter myClubs) */
  const filteredAll = useMemo(() => {
    const q = search.trim().toLowerCase();
    const arr = allClubs ?? [];
    if (!q) return arr;
    return arr.filter((c) => (c.name ?? "").toLowerCase().includes(q));
  }, [search, allClubs]);

  /** UI */
  const Header = () => (
    <View style={styles.headerRow}>
      <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={22} color="#6B7AFF" />
      </Pressable>
      <Text style={styles.title}>Clubs ✨</Text>
      <View style={{ width: 32, height: 32 }} />
    </View>
  );

  const SearchBarEl = useMemo(() => (
    <View style={styles.searchWrap} pointerEvents="box-none">
      <Ionicons name="search" size={18} color="#99A2C0" style={{ marginHorizontal: 10 }} />
      <TextInput
        placeholder="Search clubs..."
        placeholderTextColor="#99A2C0"
        value={search}
        onChangeText={setSearch}
        returnKeyType="search"
        style={styles.searchInput}
        autoCorrect={false}
        autoCapitalize="none"
        blurOnSubmit={false}
        underlineColorAndroid="transparent"
      />
      {search.length > 0 && (
        <Pressable onPress={() => setSearch("")} hitSlop={10} style={{ paddingHorizontal: 10 }}>
          <Ionicons name="close-circle" size={18} color="#B8C0E0" />
        </Pressable>
      )}
    </View>
  ), [search]);

  const Hero = () => (
    <Pressable
      onPress={() => hotPost && Alert.alert("Open Post", hotPost.title)}
      disabled={!hotPost}
      style={{ borderRadius: 18, overflow: "hidden" }}
    >
      <ImageBackground
        source={{ uri: hotPost?.coverImageUrl || PLACEHOLDER }}
        style={{ width: "100%", height: HERO_H, justifyContent: "flex-end" }}
      >
        <View style={styles.heroMask} />
        <View style={styles.heroBadgeRow}>
          <Text style={styles.heroBadge}>
            <Text>🔥</Text> HOT
          </Text>
        </View>
        <View style={{ padding: 16 }}>
          <Text numberOfLines={1} style={styles.heroTitle}>
            {hotPost?.title || "Share your pet's story..."}
          </Text>
        </View>
      </ImageBackground>
    </Pressable>
  );

  const SectionHeader = ({
    title, actionText, onAction,
  }: { title: string; actionText?: string; onAction?: () => void }) => (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!actionText && (
        <Pressable hitSlop={10} style={styles.actionBtn} onPress={onAction}>
          <Text style={styles.actionText}>{actionText}</Text>
          <Ionicons name="chevron-forward" size={16} color="#6b7280" />
        </Pressable>
      )}
    </View>
  );

  const MyClubItem = ({ item }: { item: Club }) => (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/Interest/clubTopic",
          params: { name: item.name },
        })
      }
      style={styles.allClubItem}
    >
      <Image source={{ uri: item.coverImageUrl || AVATAR_PH }} style={styles.myClubAvatar} />
      <Text numberOfLines={1} style={styles.myClubName}>{item.name}</Text>
    </Pressable>
  );

  const AllClubThumb = ({ item }: { item: Club }) => (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/Interest/clubTopic",
          params: { name: item.name },
        })
      }
      style={styles.allClubItem}
    >
      <Image source={{ uri: item.coverImageUrl || PLACEHOLDER }} style={styles.allClubAvatar} />
      <Text numberOfLines={1} style={styles.allClubName}>{item.name}</Text>
    </Pressable>
  );

  const BottomBar = () => (
    <View style={styles.bottomBar}>
      <Ionicons name="happy-outline" size={26} color="#1D2A5B" />
      <Ionicons name="document-text-outline" size={26} color="#1D2A5B" />
      <Ionicons name="chatbubble-ellipses-outline" size={26} color="#1D2A5B" />
      <Ionicons name="time-outline" size={26} color="#1D2A5B" />
      <Ionicons name="person-outline" size={26} color="#1D2A5B" />
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" />
          <Text style={{ color: "#8390B5", marginTop: 8 }}>Loading…</Text>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B7AFF" />
            }
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <Header />
            {SearchBarEl}

            <View style={styles.cardSectionHero}>
              <Hero />
            </View>

            <View style={styles.cardSection}>
              <SectionHeader
                title="My Clubs"
                actionText="All Clubs"
                onAction={() => router.push("/Interest/myClubs")}
              />
              {myClubs && myClubs.length > 0 ? (
                <FlatList
                  data={myClubs}
                  keyExtractor={(c) => c.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 6 }}
                  renderItem={({ item }) => <MyClubItem item={item} />}
                />
              ) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>You haven’t joined any clubs yet.</Text>
                </View>
              )}
            </View>

            <View style={styles.cardSection}>
              <SectionHeader
                title="All Clubs"
                actionText="View More"
                onAction={() => router.push("/Interest/allClubs")}
              />
              <FlatList
                data={filteredAll}
                keyExtractor={(c) => c.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 6 }}
                renderItem={({ item }) => <AllClubThumb item={item} />}
                ListEmptyComponent={
                  <View style={[styles.emptyBox, { marginHorizontal: 8 }]}>
                    <Text style={styles.emptyText}>No clubs found.</Text>
                  </View>
                }
              />
            </View>
          </ScrollView>

          <BottomBar />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dbe7ff",
    paddingHorizontal: 14,
    paddingTop: Platform.select({ ios: 70, android: 24 }),
  },
  
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },

  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: "#1f2937"
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 16,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 14,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#223"
  },

  cardSection: {
    backgroundColor: "#C6DBFA",
    borderRadius: 16,
    padding: 12,
    marginTop: 12
  },

  cardSectionHero: {
    backgroundColor: "#C6DBFA",
    borderRadius: 16,
    padding: 0,
    marginTop: 12,
    overflow: "hidden",
  },
  
  heroMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)"
  },

  heroBadgeRow: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row"
  },

  heroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.85)",
    color: "#1F254B",
    fontWeight: "800",
  },

  heroTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "900"
  },

  sectionHeaderRow: {
    paddingHorizontal: 6,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#345BCE",
  },

  actionBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },

  actionText: {
    color: "#6b7280",
    fontWeight: "700",
  },

  myClubItem: {
    width: 96,
    marginHorizontal: 6,
    alignItems: "center",
  },

  myClubAvatar: {
    width: 96,
    height: 76,
    borderRadius: 16,
    marginBottom: 8,
  },

  myClubName: {
    fontSize: 12,
    color: "#1D2A5B",
    fontWeight: "700",
  },

  allClubItem: {
    width: 96,
    marginHorizontal: 6,
    alignItems: "center",
  },

  allClubAvatar: {
    width: 96,
    height: 76,
    borderRadius: 16,
    marginBottom: 8,
  },

  allClubName: {
    fontSize: 12,
    color: "#1D2A5B",
    fontWeight: "700",
  },

  thumbItem: {
    width: 98,
    height: 88,
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 6,
  },

  thumbImage: {
    width: "100%",
    height: "100%",
  },

  emptyBox: {
    marginHorizontal: 8,
    marginVertical: 8,
    padding: 14,
    backgroundColor: "white",
    borderRadius: 14,
  },

  emptyText: {
    color: "#6E7CA8",
  },

  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  bottomBar: {
    height: 64,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#E9F0FF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#CAD4FF",
  },
});
