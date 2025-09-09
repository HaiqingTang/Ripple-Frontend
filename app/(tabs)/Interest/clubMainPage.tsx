import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

/** ========= 类型 ========= */
type Club = {
  id: string;
  name: string;
  coverImageUrl?: string;
  avatarUrl?: string;
  category?: string;
  isMember?: boolean;
};

type Post = {
  id: string;
  title: string;
  coverImageUrl?: string;
  clubId?: string;
  hot?: boolean;
};

/** ========= Mock 数据（无后端也可预览 UI） ========= */
const PLACEHOLDER =
  "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop";
const AVATAR_PH =
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400&auto=format&fit=crop";

const MOCK_HOT_POST: Post = {
  id: "p_hot",
  title: "Welcome to the Clubs!",
  coverImageUrl:
    "https://images.unsplash.com/photo-1542638267-23939a74b675?q=80&w=1200&auto=format&fit=crop",
  hot: true,
};

const MOCK_MY_CLUBS: Club[] = [
  {
    id: "c1",
    name: "Fitness",
    avatarUrl:
      "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?q=80&w=800&auto=format&fit=crop",
    isMember: true,
  },
  {
    id: "c2",
    name: "Art & Design",
    avatarUrl:
      "https://images.unsplash.com/photo-1526312426976-593c32eac4a0?q=80&w=800&auto=format&fit=crop",
    isMember: true,
  },
  {
    id: "c3",
    name: "Mindfulness",
    avatarUrl:
      "https://images.unsplash.com/photo-1517346665566-17bf9154868e?q=80&w=800&auto=format&fit=crop",
    isMember: true,
  },
];

const MOCK_ALL_CLUBS: Club[] = [
  {
    id: "c4",
    name: "Travel",
    coverImageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "c5",
    name: "Music",
    coverImageUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: "c6",
    name: "Swimming",
    coverImageUrl:
      "https://images.unsplash.com/photo-1519311965067-36d3e5f7b564?q=80&w=1000&auto=format&fit=crop",
  },
];

/** 模拟异步请求（只为展示 loading/下拉刷新效果） */
function mockFetch<T>(data: T, delay = 400): Promise<T> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay)
  );
}

/** ========= UI 常量 ========= */
const { width: SCREEN_W } = Dimensions.get("window");
const PANEL_W = Math.min(640, SCREEN_W - 28);
const HERO_H = Math.round((PANEL_W * 9) / 16);

/** ========= 页面 ========= */
export default function ClubMainPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [hotPost, setHotPost] = useState<Post | null>(null);
  const [myClubs, setMyClubs] = useState<Club[] | null>(null);
  const [allClubs, setAllClubs] = useState<Club[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (q = "") => {
    setLoading(true);
    const filtered =
      q.trim().length === 0
        ? MOCK_ALL_CLUBS
        : MOCK_ALL_CLUBS.filter((c) =>
            c.name.toLowerCase().includes(q.trim().toLowerCase())
          );
    const [hot, mine, all] = await Promise.all([
      mockFetch(MOCK_HOT_POST),
      mockFetch(MOCK_MY_CLUBS),
      mockFetch(filtered),
    ]);
    setHotPost(hot);
    setMyClubs(mine);
    setAllClubs(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(search);
    setRefreshing(false);
  }, [load, search]);

  const onSearchSubmit = useCallback(() => {
    load(search);
  }, [load, search]);

  /** 标题栏 */
  const Header = () => (
    <View style={styles.headerRow}>
      <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={22} color="#6B7AFF" />
      </Pressable>
      <Text style={styles.title}>Clubs ✨</Text>
      <View style={{ width: 32, height: 32 }} />{/* 占位，保持标题居中 */}
    </View>
  );

  /** 搜索栏 */
  const SearchBar = () => (
    <View style={styles.searchWrap}>
      <Ionicons name="search" size={18} color="#99A2C0" style={{ marginHorizontal: 10 }} />
      <TextInput
        placeholder="Search clubs..."
        placeholderTextColor="#99A2C0"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={onSearchSubmit}
        returnKeyType="search"
        style={styles.searchInput}
      />
      {search.length > 0 && (
        <Pressable onPress={() => setSearch("")} hitSlop={10} style={{ paddingHorizontal: 10 }}>
          <Ionicons name="close-circle" size={18} color="#B8C0E0" />
        </Pressable>
      )}
    </View>
  );

  /** 顶部海报 */
  const Hero = () => (
    <Pressable
      onPress={() => hotPost && Alert.alert("Open Post (Mock)", hotPost.title)}
      disabled={!hotPost}
      style={{ borderRadius: 18, overflow: "hidden" }}
    >
      <ImageBackground
        source={{ uri: hotPost?.coverImageUrl || PLACEHOLDER }}
        style={{ width: "100%", height: HERO_H, justifyContent: "flex-end" }}
      >
        <View style={styles.heroMask} />
        <View style={styles.heroBadgeRow}>
          <Text style={styles.heroBadge}><Text>🔥</Text> HOT</Text>
        </View>
        <View style={{ padding: 16 }}>
          <Text numberOfLines={1} style={styles.heroTitle}>
            {hotPost?.title || "Share your pet's story..."}
          </Text>
        </View>
      </ImageBackground>
    </Pressable>
  );

  /** 分区标题 */
  const SectionHeader = ({
    title,
    actionText,
    onAction,
  }: {
    title: string;
    actionText?: string;
    onAction?: () => void;
  }) => (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!actionText && (
        <Pressable onPress={onAction} hitSlop={10} style={styles.actionBtn}>
          <Text style={styles.actionText}>{actionText}</Text>
          <Ionicons name="chevron-forward" size={16} color="#8EA0FF" />
        </Pressable>
      )}
    </View>
  );

  /** 我的俱乐部卡片 */
  const MyClubItem = ({ item }: { item: Club }) => (
    <Pressable
      onPress={() => Alert.alert("Open Club (Mock)", item.name)}
      style={styles.myClubItem}
    >
      <Image source={{ uri: item.avatarUrl || AVATAR_PH }} style={styles.myClubAvatar} />
      <Text numberOfLines={1} style={styles.myClubName}>{item.name}</Text>
    </Pressable>
  );

  /** 全部俱乐部缩略图 */
  const AllClubThumb = ({ item }: { item: Club }) => (
    <Pressable
      onPress={() => Alert.alert("Open Club (Mock)", item.name)}
      style={styles.thumbItem}
    >
      <Image source={{ uri: item.coverImageUrl || PLACEHOLDER }} style={styles.thumbImage} />
    </Pressable>
  );

  /** 主体：ScrollView（外层纵向），内部两个横向 FlatList */
  const Content = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B7AFF" />
      }
    >
      <Header />
      <SearchBar />

      {/* Hero 卡片区 */}
      <View style={styles.cardSection}>
        <Hero />
      </View>

      {/* My Clubs 区 */}
      <View style={styles.cardSection}>
        <SectionHeader title="My Clubs" actionText="All Clubs" onAction={() => {}} />
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
          <View style={styles.emptyBox}><Text style={styles.emptyText}>You haven’t joined any clubs yet.</Text></View>
        )}
      </View>

      {/* All Clubs 区 */}
      <View style={styles.cardSection}>
        <SectionHeader title="All Clubs" actionText="View More" onAction={() => {}} />
        <FlatList
          data={allClubs ?? []}
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
          <Content />
          <BottomBar />
        </>
      )}
    </View>
  );
}

/** ========= 样式 ========= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9F0FF",
    paddingHorizontal: 14,
    paddingTop: Platform.select({ ios: 52, android: 24 }),
  },

  /** 顶部标题 */
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  title: {
    flex: 1, textAlign: "center",
    fontSize: 28, fontWeight: "800", color: "#6B7AFF", letterSpacing: 0.3,
  },

  /** 搜索框 */
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    height: 48, borderRadius: 16, backgroundColor: "white",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 14,
  },
  searchInput: { flex: 1, height: "100%", fontSize: 16, color: "#203160" },

  /** 分区外框（还原设计稿的卡片块） */
  cardSection: {
    backgroundColor: "#D7E2FF",
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
  },

  /** Hero */
  heroMask: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)" },
  heroBadgeRow: { position: "absolute", top: 10, right: 10, flexDirection: "row" },
  heroBadge: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.85)", color: "#1F254B", fontWeight: "800",
  },
  heroTitle: { color: "white", fontSize: 28, fontWeight: "900" },

  /** 标题行 */
  sectionHeaderRow: {
    paddingHorizontal: 6, marginBottom: 8,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 22, fontWeight: "800", color: "#6B7AFF" },
  actionBtn: { paddingHorizontal: 6, paddingVertical: 4, flexDirection: "row", alignItems: "center" },
  actionText: { color: "#8EA0FF", fontWeight: "700" },

  /** My Clubs 卡片尺寸（固定宽高，避免“飘”） */
  myClubItem: { width: 96, marginHorizontal: 6, alignItems: "center" },
  myClubAvatar: { width: 96, height: 76, borderRadius: 16, marginBottom: 8 },
  myClubName: { fontSize: 16, color: "#1D2A5B", fontWeight: "700" },

  /** All Clubs 缩略图（固定尺寸） */
  thumbItem: { width: 98, height: 88, borderRadius: 16, overflow: "hidden", marginHorizontal: 6 },
  thumbImage: { width: "100%", height: "100%" },

  /** 空态/加载/底部栏 */
  emptyBox: { marginHorizontal: 8, marginVertical: 8, padding: 14, backgroundColor: "white", borderRadius: 14 },
  emptyText: { color: "#6E7CA8" },
  loadingBox: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  bottomBar: {
    height: 64, flexDirection: "row", justifyContent: "space-around", alignItems: "center",
    backgroundColor: "#E9F0FF", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#CAD4FF",
  },
});