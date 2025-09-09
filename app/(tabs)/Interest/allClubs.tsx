// app/(tabs)/Interest/allClubs.tsx
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
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

/** ============ 类型 ============ */
type Club = {
  id: string;
  name: string;
  coverImageUrl: string;
  categories: string[]; // 用于筛选的标签
};

/** ============ 后端占位 ============ */
// 将来接后端时启用这段，并把 BASE_URL 改成你的服务地址
// const API_BASE_URL = "https://api.example.com";
// async function fetchAllClubsFromAPI(q: string, tag?: string): Promise<Club[]> {
//   const qs = new URLSearchParams();
//   if (q) qs.set("q", q);
//   if (tag && tag !== "All") qs.set("category", tag);
//   const res = await fetch(`${API_BASE_URL}/clubs?${qs.toString()}`);
//   if (!res.ok) throw new Error(await res.text());
//   return res.json();
// }

/** ============ 本地 Mock 数据（演示 UI） ============ */
const MOCK_CLUBS: Club[] = [
  {
    id: "travel",
    name: "Travel",
    coverImageUrl:
      "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=800&auto=format&fit=crop",
    categories: ["Travel", "Lifestyle"],
  },
  {
    id: "music",
    name: "Music",
    coverImageUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
    categories: ["Music", "Arts"],
  },
  {
    id: "swimming",
    name: "Swimming",
    coverImageUrl:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop",
    categories: ["Sports"],
  },
  {
    id: "book",
    name: "Book",
    coverImageUrl:
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?q=80&w=800&auto=format&fit=crop",
    categories: ["Study", "Lifestyle"],
  },
  {
    id: "guitar",
    name: "Guitar",
    coverImageUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800&auto=format&fit=crop",
    categories: ["Music", "Arts"],
  },
  {
    id: "baking",
    name: "Baking",
    coverImageUrl:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop",
    categories: ["Food", "Lifestyle"],
  },
  {
    id: "yoga",
    name: "Yoga",
    coverImageUrl:
      "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=800&auto=format&fit=crop",
    categories: ["Lifestyle", "Sports"],
  },
  {
    id: "football",
    name: "Football",
    coverImageUrl:
      "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?q=80&w=800&auto=format&fit=crop",
    categories: ["Sports"],
  },
];

function mockFetch<T>(data: T, delay = 300): Promise<T> {
  return new Promise((r) => setTimeout(() => r(JSON.parse(JSON.stringify(data))), delay));
}

/** ============ 筛选标签 ============ */
const TAGS = ["All", "Arts", "Food", "Lifestyle", "Music", "Sports", "Study", "Travel"];

/** ============ 尺寸 ============ */
const { width: SCREEN_W } = Dimensions.get("window");
const H_PADDING = 24;
const GAP = 24;
const CARD_W = Math.floor((SCREEN_W - H_PADDING * 2 - GAP * 2) / 3);
const IMAGE_H = 92;

export default function AllClubs() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string>("All");
  const [data, setData] = useState<Club[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((c) => {
      const matchText = q ? c.name.toLowerCase().includes(q) : true;
      const matchTag = tag === "All" ? true : c.categories.includes(tag);
      return matchText && matchTag;
    });
  }, [query, tag, data]);

  const load = useCallback(async () => {
    // 将来接后端时切换为：const list = await fetchAllClubsFromAPI(query, tag);
    const list = await mockFetch(MOCK_CLUBS);
    setData(list);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const openClub = (club: Club) => {
    // 将来接路由：router.push(`/clubs/${club.id}`)
    Alert.alert("Open Club (Mock)", club.name);
  };

  /** Header */
  const Header = () => (
    <View style={styles.headerRow}>
      <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
        <Ionicons name="chevron-back" size={24} color="#6B7AFF" />
      </Pressable>
      <Text style={styles.title}>All Clubs</Text>
      <View style={{ width: 24 }} />
    </View>
  );

  /** Search */
  const SearchBar = () => (
    <View style={styles.searchWrap}>
      <Ionicons name="search" size={18} color="#99A2C0" style={{ marginHorizontal: 10 }} />
      <TextInput
        placeholder="Search clubs..."
        placeholderTextColor="#99A2C0"
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        style={styles.searchInput}
      />
      <Pressable onPress={() => setQuery(query)} hitSlop={10} style={{ paddingHorizontal: 10 }}>
        <Ionicons name="search" size={18} color="#99A2C0" />
      </Pressable>
    </View>
  );

  /** 标签 Chips（两行自动换行） */
  const TagChips = () => (
    <View style={styles.tagsWrap}>
      {TAGS.map((t) => {
        const selected = t === tag;
        return (
          <Pressable
            key={t}
            onPress={() => setTag(t)}
            style={[styles.tagChip, selected ? styles.tagChipActive : styles.tagChipIdle]}
          >
            <Text style={[styles.tagText, selected ? styles.tagTextActive : styles.tagTextIdle]}>
              {t}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  /** 单个卡片 */
  const renderItem = ({ item }: { item: Club }) => (
    <Pressable style={styles.card} onPress={() => openClub(item)}>
      <Image source={{ uri: item.coverImageUrl }} style={styles.cardImage} />
      <Text style={styles.cardLabel} numberOfLines={1}>
        {item.name}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Header />
      <SearchBar />
      <TagChips />

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

/** ============ 样式 ============ */
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

  /* Tags */
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: H_PADDING,
    marginTop: 14,
  },
  tagChip: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 16,
    marginBottom: 12,
  },
  tagChipActive: {
    backgroundColor: "#2B2B2B",
  },
  tagChipIdle: {
    backgroundColor: "#E5E8F3",
  },
  tagText: {
    fontWeight: "700",
  },
  tagTextActive: {
    color: "#FFFFFF",
  },
  tagTextIdle: {
    color: "#5C637C",
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