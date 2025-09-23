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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot, orderBy, query, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";

type Club = {
  id: string;
  name: string;
  coverImageUrl?: string;
  categories?: string[];
};

type Placeholder = { id: string; __placeholder: true };
type GridItem = Club | Placeholder;

const TAGS = ["All", "Arts", "Food", "Lifestyle", "Music", "Sports", "Study", "Travel"] as const;
type Tag = (typeof TAGS)[number];

// 你的库里写的是 "Sport"（单数），这里做个映射避免筛不到
const TAG_TO_CATEGORY: Record<Tag, string | null> = {
  All: null,
  Arts: "Arts",
  Food: "Food",
  Lifestyle: "Lifestyle",
  Music: "Music",
  Sports: "Sport",
  Study: "Study",
  Travel: "Travel",
};

const { width: SCREEN_W } = Dimensions.get("window");
const H_PADDING = 24;
const GAP = 24;
const CARD_W = Math.floor((SCREEN_W - H_PADDING * 2 - GAP * 2) / 3);
const IMAGE_H = 92;
const PLACEHOLDER =
  "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800&auto=format&fit=crop";

export default function AllClubs() {
  const router = useRouter();

  const [queryText, setQueryText] = useState("");
  const [tag, setTag] = useState<Tag>("All");
  const [data, setData] = useState<Club[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const qClubs = query(collection(db, "clubs"), orderBy("name", "asc"));
    const unsub = onSnapshot(qClubs, (snap) => {
      const list: Club[] = snap.docs.map((d) => {
        const raw = d.data() as any;
        return {
          id: d.id,
          name: String(raw.name ?? ""),
          coverImageUrl: raw.coverImageUrl || PLACEHOLDER,
          categories: Array.isArray(raw.categories) ? raw.categories.map(String) : [],
        };
      });
      setData(list);
    });
    return () => unsub();
  }, []);

  const filtered: Club[] = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    const wanted = TAG_TO_CATEGORY[tag];
    return data.filter((c) => {
      const matchText = q ? (c.name || "").toLowerCase().includes(q) : true;
      const matchTag = wanted ? (c.categories || []).includes(wanted) : true;
      return matchText && matchTag;
    });
  }, [queryText, tag, data]);

  // 填充占位，保证最后一行也能 space-between 对齐
  const filled: GridItem[] = useMemo(() => {
    const arr: GridItem[] = [...filtered];
    const mod = arr.length % 3;
    if (mod !== 0) {
      const add = 3 - mod;
      for (let i = 0; i < add; i++) arr.push({ id: `__ph_${i}`, __placeholder: true });
    }
    return arr;
  }, [filtered]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const qClubs = query(collection(db, "clubs"), orderBy("name", "asc"));
      const snap = await getDocs(qClubs);
      const list: Club[] = snap.docs.map((d) => {
        const raw = d.data() as any;
        return {
          id: d.id,
          name: String(raw.name ?? ""),
          coverImageUrl: raw.coverImageUrl || PLACEHOLDER,
          categories: Array.isArray(raw.categories) ? raw.categories.map(String) : [],
        };
      });
      setData(list);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // 点击卡片 -> 带 name 跳转到 clubTopic
  const openClub = (club: Club) => {
    router.push({
      pathname: "/(tabs)/Interest/clubTopic",
      params: { name: club.name },
    });
  };

  const Header = () => (
    <View style={styles.headerRow}>
      <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
        <Ionicons name="chevron-back" size={24} color="#6B7AFF" />
      </Pressable>
      <Text style={styles.title}>All Clubs</Text>
      <View style={{ width: 24 }} />
    </View>
  );

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
      <Pressable onPress={() => setQueryText("")} hitSlop={10} style={{ paddingHorizontal: 10 }}>
        <Ionicons name="close" size={18} color="#99A2C0" />
      </Pressable>
    </View>
  );

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
            <Text style={[styles.tagText, selected ? styles.tagTextActive : styles.tagTextIdle]}>{t}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderItem = ({ item }: { item: GridItem }) => {
    if ((item as Placeholder).__placeholder) {
      return <View style={[styles.card, styles.placeholder]} pointerEvents="none" />;
    }
    const club = item as Club;
    return (
      <Pressable style={styles.card} onPress={() => openClub(club)}>
        <Image source={{ uri: club.coverImageUrl || PLACEHOLDER }} style={styles.cardImage} />
        <Text style={styles.cardLabel} numberOfLines={1}>
          {club.name}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      <SearchBar />
      <TagChips />

      <FlatList
        data={filled}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: H_PADDING }}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B7AFF" />}
        ListEmptyComponent={<Text style={{ textAlign: "center", color: "#6b7280", marginTop: 16 }}>No clubs</Text>}
        ListFooterComponent={<View style={{ height: 24 }} />}
        showsVerticalScrollIndicator={false}
      />

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
    color: "#223"
  },

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
    backgroundColor: "#2B2B2B"
  },

  tagChipIdle: {
    backgroundColor: "#E5E8F3"
  },

  tagText: {
    fontWeight: "700"
  },

  tagTextActive: {
    color: "#FFFFFF"
  },

  tagTextIdle: {
    color: "#5C637C"
  },

  card: {
    width: CARD_W,
    alignItems: "center",
    marginTop: 22
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
    color: "#111826"
  },

  placeholder: {
    opacity: 0
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
