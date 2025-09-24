import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  DocumentData,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, auth } from "../../../firebase";

/* ========= Types ========= */
type Club = {
  id: string;
  name: string;
  coverImageUrl?: string;
  description?: string;
  members?: string[];
  membersCount?: number;
};

type Post = {
  name: string; // post is linked to club by club name in your schema
  authorName?: string;
  authorAvatarUrl?: string;
  title?: string;
  text?: string;
  imageUrl?: string;
  createdAt?: any; // Firestore Timestamp | ISO | Date
  creatAt?: any; // some of your docs use this field name
  supportCount?: number;
};

/* ========= Helpers ========= */
const AVATAR_FALLBACK =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop";

function toMillis(v: any): number {
  if (v && typeof v === "object" && typeof v.seconds === "number") {
    return v.seconds * 1000 + Math.floor((v.nanoseconds || 0) / 1e6);
  }
  if (v instanceof Date) return v.getTime();
  if (typeof v === "string") return new Date(v).getTime();
  return Date.now();
}
function timeAgo(input: any) {
  const diff = Math.max(1, Math.floor((Date.now() - toMillis(input)) / 1000));
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / 604800)}w`;
}

/* ========= UI sizes ========= */
const { width: SCREEN_W } = Dimensions.get("window");
const H_PADDING = 16;
const CARD_RADIUS = 16;

/* ========= Page ========= */
export default function ClubTopic() {
  const router = useRouter();
  const { name: routeName } = useLocalSearchParams<{ name?: string }>();

  // search keyword (local filter on loaded posts)
  const [q, setQ] = useState("");

  // club doc
  const [club, setClub] = useState<Club | null>(null);

  // posts + pagination state
  const PAGE_SIZE = 6;
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const orderFieldRef = useRef<"createdAt" | "creatAt" | null>("createdAt");
  const fallbackNoOrderRef = useRef(false); // if we can't order, we don't paginate

  /** 1) Subscribe to club by exact name */
  useEffect(() => {
    const name = (routeName || "").trim();
    if (!name) {
      Alert.alert("Missing params", "No club name provided.");
      return;
    }
    const qClub = query(collection(db, "clubs"), where("name", "==", name), limit(1));
    const unsub = onSnapshot(
      qClub,
      (snap) => {
        const d = snap.docs[0];
        if (!d) {
          setClub(null);
          return;
        }
        const raw = d.data() as any;
        setClub({
          id: d.id,
          name: String(raw.name ?? ""),
          coverImageUrl: raw.coverImageUrl,
          description: raw.description,
          members: Array.isArray(raw.members) ? raw.members.map(String) : [],
          membersCount:
            typeof raw.membersCount === "number"
              ? raw.membersCount
              : Array.isArray(raw.members)
              ? raw.members.length
              : 0,
        });
      },
      (err) => console.log("club query error:", err.code, err.message)
    );
    return () => unsub();
  }, [routeName]);

  /** 2) Load first page of posts for this club */
  const fetchFirstPage = useCallback(async () => {
    if (!club?.name) return;
    setRefreshing(true);
    fallbackNoOrderRef.current = false;
    lastDocRef.current = null;

    const base = query(collection(db, "posts"), where("name", "==", club.name));
    const tryOrderFields: Array<"createdAt" | "creatAt" | null> = ["createdAt", "creatAt", null];

    for (const field of tryOrderFields) {
      try {
        let qPosts;
        if (field) {
          orderFieldRef.current = field;
          qPosts = query(base, orderBy(field, "desc"), limit(PAGE_SIZE));
        } else {
          orderFieldRef.current = null;
          qPosts = query(base, limit(PAGE_SIZE));
        }
        const snap = await getDocs(qPosts);
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Post));
        setPosts(list);

        if (field) {
          lastDocRef.current = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
          setHasMore(snap.size === PAGE_SIZE);
        } else {
          // no ordering -> no pagination
          fallbackNoOrderRef.current = true;
          setHasMore(false);
        }
        setRefreshing(false);
        return;
      } catch {
        // try next ordering strategy
        continue;
      }
    }

    setRefreshing(false);
    Alert.alert("Error", "Failed to load posts.");
  }, [club?.name]);

  /** 3) Load next page if available */
  const fetchNextPage = useCallback(async () => {
    if (fallbackNoOrderRef.current) return;
    if (!club?.name || loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const base = query(collection(db, "posts"), where("name", "==", club.name));
      const field = orderFieldRef.current || "createdAt";
      const qNext = lastDocRef.current
        ? query(base, orderBy(field, "desc"), startAfter(lastDocRef.current), limit(PAGE_SIZE))
        : query(base, orderBy(field, "desc"), limit(PAGE_SIZE));
      const snap = await getDocs(qNext);
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Post));
      setPosts((prev) => prev.concat(list));
      lastDocRef.current = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : lastDocRef.current;
      setHasMore(snap.size === PAGE_SIZE);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [club?.name, loadingMore, hasMore]);

  // initial load + when club changes
  useEffect(() => {
    if (!club?.name) return;
    fetchFirstPage();
  }, [club?.name, fetchFirstPage]);

  // pull-to-refresh
  const onRefresh = useCallback(async () => {
    await fetchFirstPage();
  }, [fetchFirstPage]);

  /** Join / Unjoin the club */
  const toggleJoin = useCallback(async () => {
    if (!club) return;
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Sign in required", "Please sign in first.");
      return;
    }
    try {
      const ref = doc(db, "clubs", club.id);
      const isJoined = !!club.members?.includes(user.uid);
      await updateDoc(ref, {
        members: isJoined ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
    } catch {
      Alert.alert("Error", "Failed to update membership.");
    }
  }, [club]);

  /** Local filter for posts */
  const filteredPosts = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return posts;
    return posts.filter((p) => {
      return (
        (p.title || "").toLowerCase().includes(keyword) ||
        (p.text || "").toLowerCase().includes(keyword) ||
        (p.authorName || "").toLowerCase().includes(keyword)
      );
    });
  }, [q, posts]);

  /** Sticky header: back + search + club card */
  const StickyTop = () => (
    <View style={styles.stickyWrap}>
      {/* Back + search bar */}
      <View style={styles.searchRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color="#6B7AFF" />
        </Pressable>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#96A0C6" style={{ marginHorizontal: 10 }} />
          <TextInput
            placeholder="Search topics..."
            placeholderTextColor="#96A0C6"
            value={q}
            onChangeText={setQ}
            style={styles.searchInput}
            returnKeyType="search"
          />
          <Ionicons name="search" size={18} color="#96A0C6" style={{ marginHorizontal: 10 }} />
        </View>
      </View>

      {/* Club summary card */}
      <View style={styles.clubCard}>
        <Image source={{ uri: club?.coverImageUrl || AVATAR_FALLBACK }} style={styles.clubThumb} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.clubName}>{club?.name ?? "Club"}</Text>
          <Text style={styles.clubMembers}>
            {(club?.membersCount ?? (Array.isArray(club?.members) ? club!.members!.length : 0)) || 0} members
          </Text>
          <Text style={styles.clubDesc} numberOfLines={2}>
            {club?.description || "Welcome to the club!"}
          </Text>
        </View>
        <Pressable
          style={[
            styles.joinBtn,
            club && auth.currentUser && club.members?.includes(auth.currentUser.uid) && styles.joinedBtn,
          ]}
          onPress={toggleJoin}
        >
          <Text
            style={[
              styles.joinText,
              club && auth.currentUser && club.members?.includes(auth.currentUser.uid) && styles.joinedText,
            ]}
          >
            {club && auth.currentUser && club.members?.includes(auth.currentUser.uid) ? "Joined" : "Join"}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  /** Composer (placeholder UI) */
  const ComposerCard = () => (
    <View style={styles.composerCard}>
      <Image source={{ uri: AVATAR_FALLBACK }} style={styles.composerAvatar} />
      <Text style={styles.composerHint} numberOfLines={1}>
        Write your post now!
      </Text>
      <Pressable style={styles.writeBtn} onPress={() => Alert.alert("Compose (Mock)", "")}>
        <Text style={styles.writeBtnText}>Write</Text>
        <Ionicons name="pencil" size={14} color="#fff" />
      </Pressable>
    </View>
  );

  /** Post item (image above, caption below) */
  const PostItem = ({ item }: { item: Post }) => {
    const created = item.createdAt ?? item.creatAt ?? Date.now();
    return (
      <View style={styles.postCard}>
        {/* Author row */}
        <View style={styles.postHeader}>
          <Image source={{ uri: item.authorAvatarUrl || AVATAR_FALLBACK }} style={styles.authorAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.authorName}>{item.authorName || "Anonymous"}</Text>
            <Text style={styles.subMeta}>{timeAgo(created)} ago</Text>
          </View>
          <Pressable style={styles.roundIcon} onPress={() => Alert.alert("Share (Mock)")}>
            <Ionicons name="paper-plane-outline" size={16} color="#23304E" />
          </Pressable>
        </View>

        {/* Media + text */}
        {item.imageUrl ? (
          <>
            <View style={styles.postImageWrap}>
              <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
            </View>
            {item.text ? (
              <View style={styles.captionBox}>
                <Text style={styles.captionText}>{item.text}</Text>
              </View>
            ) : null}
          </>
        ) : item.text ? (
          <View style={styles.textOnly}>
            <Text style={{ color: "#1A2036" }}>{item.text}</Text>
          </View>
        ) : null}

        {/* Actions */}
        <View style={styles.postActions}>
          <Pressable style={styles.lightPill} onPress={() => Alert.alert("Open Post (Mock)")}>
            <Text style={styles.lightPillText}>View post</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Ionicons name="heart-outline" size={16} color="#5D678A" />
          <Text style={styles.supportText}>{item.supportCount ?? 0} Support</Text>
        </View>
      </View>
    );
  };

  const dataForList = useMemo(() => [{ id: "__composer__" } as any].concat(filteredPosts), [filteredPosts]);
  const renderItem = ({ item }: { item: any }) =>
    item.id === "__composer__" ? <ComposerCard /> : <PostItem item={item as Post} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={dataForList}
        keyExtractor={(it, idx) => it.id ?? `k${idx}` }
        renderItem={renderItem}
        ListHeaderComponent={<StickyTop />}
        stickyHeaderIndices={[0]}
        onEndReachedThreshold={0.2}
        onEndReached={fetchNextPage}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B7AFF" />}
        ListFooterComponent={
          <View style={{ paddingVertical: 18, alignItems: "center" }}>
            {hasMore ? (
              <Text style={{ color: "#6C78A3" }}>{loadingMore ? "Loading..." : "Pull for more"}</Text>
            ) : (
              <Text style={{ color: "#6C78A3" }}>— No more —</Text>
            )}
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
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

/* ========= Styles ========= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dbe7ff",
    paddingTop: Platform.select({ ios: 20, android: 0 }),
  },

  stickyWrap: {
    backgroundColor: "#DDE7FF",
    paddingTop: 60,
    paddingBottom: 10,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: H_PADDING,
    marginBottom: 10,
  },

  backBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  searchBox: {
    flex: 1,
    height: 44,
    borderRadius: 22,
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
    color: "#1F2A44"
  },

  clubCard: {
    marginTop: 6,
    marginHorizontal: H_PADDING,
    backgroundColor: "#CFE0FF",
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  clubThumb: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: "#EAF0FF",
  },

  clubName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1B243D",
  },

  clubMembers: {
    color: "#2B3B6E",
    marginTop: 2,
    fontWeight: "700",
  },

  clubDesc: {
    color: "#2B3B6E",
    marginTop: 4,
    lineHeight: 18,
  },

  joinBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#8EA0FF",
    backgroundColor: "white",
  },

  joinedBtn: {
    backgroundColor: "#8EA0FF",
    borderColor: "#8EA0FF",
  },

  joinText: {
    color: "#5C6FD6",
    fontWeight: "800",
  },

  joinedText: {
    color: "#fff",
  },

  composerCard: {
    marginTop: 10,
    marginHorizontal: H_PADDING,
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  composerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },

  composerHint: {
    flex: 1,
    color: "#7A86A8",
  },

  writeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#6B7AFF",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  writeBtnText: {
    color: "#fff",
    fontWeight: "800",
    marginRight: 4,
  },

  postCard: {
    marginTop: 14,
    marginHorizontal: H_PADDING,
  },

  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },

  authorName: {
    fontWeight: "800",
    fontSize: 16,
    color: "#1A2036",
  },

  subMeta: {
    color: "#707AA0",
    marginTop: 2,
  },

  roundIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7ECFF",
  },

  postImageWrap: {
    borderRadius: CARD_RADIUS,
    overflow: "hidden",
  },

  postImage: {
    width: "100%",
    height: SCREEN_W * 0.6,
  },

  captionBox: {
    marginTop: 8,
    backgroundColor: "white",
    padding: 12,
    borderRadius: CARD_RADIUS,
  },

  captionText: {
    color: "#1A2036",
  },

  textOnly: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: CARD_RADIUS,
  },

  postActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  lightPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#6275FF",
  },

  lightPillText: {
    color: "white",
    fontWeight: "800",
  },

  supportText: {
    color: "#5D678A",
    marginLeft: 6,
  },

  bottomBar: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#cfd8ff",
    backgroundColor: "#DDE7FF",
  },
});
