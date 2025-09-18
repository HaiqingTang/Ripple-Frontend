// app/(tabs)/Interest/clubTopic.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ImageBackground,
  FlatList,
  Dimensions,
  Platform,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

/* =========================
 * 类型定义
 * ========================= */
type Club = {
  id: string;
  name: string;
  coverImageUrl: string;
  members: number;
  description: string;
  joined?: boolean;
};

type Post = {
  id: string;
  author: string;
  authorAvatar: string;
  title?: string;
  text?: string;
  imageUrl?: string;
  createdAt: string; // ISO
  supportCount?: number;
};

/* =========================
 * 后端占位（将来替换）
 * ========================= */
// const API_BASE_URL = "https://api.example.com";
// async function fetchClub(id: string): Promise<Club> { ... }
// async function fetchPosts(params: { clubId: string; page: number; pageSize: number; q?: string }): Promise<Post[]> { ... }

/* =========================
 * 本地 Mock（演示 UI）
 * ========================= */
const MOCK_CLUB: Club = {
  id: "football",
  name: "Football",
  coverImageUrl:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop",
  members: 120,
  description:
    "A friendly club for football lovers to chat, share, and play casually.",
  joined: false,
};

const AVATAR =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop";
const LAMP =
  "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=1200&auto=format&fit=crop";

function buildMockPosts(): Post[] {
  const base: Post[] = [
    {
      id: "p1",
      author: "Broken Streetlight",
      authorAvatar: AVATAR,
      text: "Did anyone watch last night’s match? That last-minute goal was crazy!",
      imageUrl: LAMP,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
      supportCount: 8,
    },
    {
      id: "p2",
      author: "Sophie",
      authorAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
      text: "Pickup game this Saturday 10am at Riverside? Comment if you’re in ⚽️",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      supportCount: 12,
    },
    {
      id: "p3",
      author: "Marco",
      authorAvatar:
        "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=400&auto=format&fit=crop",
      text: "Any recommendations for good turf shoes under $80?",
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      supportCount: 5,
    },
    {
      id: "p4",
      author: "Anya",
      authorAvatar:
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400&auto=format&fit=crop",
      imageUrl:
        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop",
      text: "Training drills from today — pass & move! 🏃‍♂️",
      createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      supportCount: 21,
    },
    {
      id: "p5",
      author: "Coach Dan",
      authorAvatar:
        "https://images.unsplash.com/photo-1546456073-92b9f0a8d413?q=80&w=400&auto=format&fit=crop",
      text: "League schedule is out. Check pinned post for fixtures.",
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      supportCount: 15,
    },
  ];
  // 复制多页
  const pages: Post[] = [];
  for (let i = 0; i < 4; i++) {
    pages.push(
      ...base.map((p, idx) => ({
        ...p,
        id: `${p.id}-pg${i}`,
        createdAt: new Date(Date.now() - (i * 6 + idx) * 60 * 60 * 1000).toISOString(),
      }))
    );
  }
  return pages;
}
const ALL_MOCK_POSTS = buildMockPosts();

function mockFetch<T>(data: T, delay = 300): Promise<T> {
  return new Promise((res) => setTimeout(() => res(JSON.parse(JSON.stringify(data))), delay));
}

function timeAgo(iso: string) {
  const diff = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const map: [number, string][] = [
    [60, "s"],
    [3600, "m"],
    [86400, "h"],
    [604800, "d"],
  ];
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / 604800)}w`;
}

/* =========================
 * UI 尺寸
 * ========================= */
const { width: SCREEN_W } = Dimensions.get("window");
const H_PADDING = 16;
const CARD_RADIUS = 16;

/* =========================
 * 页面
 * ========================= */
export default function ClubTopic() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>();

  // 顶部搜索
  const [q, setQ] = useState("");

  // 俱乐部信息（将来可根据 id/name 请求）
  const [club, setClub] = useState<Club>(MOCK_CLUB);

  // 列表/分页
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  /** 初始加载（可根据 id/name 替换为后端请求） */
  const loadFirst = useCallback(async () => {
    setRefreshing(true);
    // const c = await fetchClub(id!);
    // const first = await fetchPosts({ clubId: id!, page: 1, pageSize: PAGE_SIZE, q });
    const first = await mockFetch(ALL_MOCK_POSTS.slice(0, PAGE_SIZE));
    setClub({ ...MOCK_CLUB, name: name || MOCK_CLUB.name });
    setPosts(first);
    setPage(1);
    setHasMore(ALL_MOCK_POSTS.length > PAGE_SIZE);
    setRefreshing(false);
  }, [name]);

  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  /** 下拉刷新 */
  const onRefresh = useCallback(async () => {
    await loadFirst();
  }, [loadFirst]);

  /** 触底加载更多 */
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const slice = ALL_MOCK_POSTS.slice(0, nextPage * PAGE_SIZE);
    // const more = await fetchPosts({ clubId: id!, page: nextPage, pageSize: PAGE_SIZE, q });
    await mockFetch(null, 250);
    setPosts(slice);
    setPage(nextPage);
    setHasMore(slice.length < ALL_MOCK_POSTS.length);
    setLoadingMore(false);
  }, [page, hasMore, loadingMore]);

  /** 固定在顶部的头部（搜索 + 蓝色俱乐部信息卡） */
  const StickyTop = () => (
    <View style={styles.stickyWrap}>
      {/* 返回 + 搜索 */}
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

      {/* 俱乐部信息蓝卡 */}
      <View style={styles.clubCard}>
        <Image source={{ uri: club.coverImageUrl }} style={styles.clubThumb} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.clubName}>{club.name}</Text>
          <Text style={styles.clubMembers}>{club.members} members</Text>
          <Text style={styles.clubDesc} numberOfLines={2}>{club.description}</Text>
        </View>
        <Pressable
          style={[styles.joinBtn, club.joined && styles.joinedBtn]}
          onPress={() => setClub((c) => ({ ...c, joined: !c.joined }))}
        >
          <Text style={[styles.joinText, club.joined && styles.joinedText]}>
            {club.joined ? "Joined" : "Join"}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  /** 写帖提示卡（非固定） */
  const ComposerCard = () => (
    <View style={styles.composerCard}>
      <Image source={{ uri: AVATAR }} style={styles.composerAvatar} />
      <Text style={styles.composerHint} numberOfLines={1}>
        Write your post now!
      </Text>
      <Pressable style={styles.writeBtn} onPress={() => Alert.alert("Compose (Mock)", "")}>
        <Text style={styles.writeBtnText}>Write</Text>
        <Ionicons name="pencil" size={14} color="#fff" />
      </Pressable>
    </View>
  );

  /** 单个帖子 */
  const PostItem = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      {/* 作者行 */}
      <View style={styles.postHeader}>
        <Image source={{ uri: item.authorAvatar }} style={styles.authorAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.authorName}>{item.author}</Text>
          <Text style={styles.subMeta}>
            {timeAgo(item.createdAt)} ago
          </Text>
        </View>
        <Pressable style={styles.roundIcon} onPress={() => Alert.alert("Share (Mock)")}>
          <Ionicons name="paper-plane-outline" size={16} color="#23304E" />
        </Pressable>
      </View>

      {/* 图片/正文 */}
      {item.imageUrl ? (
        <View style={{ borderRadius: CARD_RADIUS, overflow: "hidden", marginTop: 6 }}>
          <ImageBackground source={{ uri: item.imageUrl }} style={styles.postImage}>
            {/* 对话气泡 */}
            {item.text ? (
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>{item.text}</Text>
              </View>
            ) : null}
          </ImageBackground>
        </View>
      ) : item.text ? (
        <View style={styles.textOnly}>
          <Text style={{ color: "#1A2036" }}>{item.text}</Text>
        </View>
      ) : null}

      {/* 操作行 */}
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

  /** 让 header 部分只固定蓝卡与搜索：我们把 header 拆成两段
   *  - stickyHeaderIndices = [0] 让 StickyTop 固定
   *  - “写帖提示卡” 作为列表第一个虚拟元素渲染（不会固定）
   */
  const dataForList = useMemo(() => {
    // 在 posts 前面插入一个“composer”占位
    return [{ id: "__composer__" } as any].concat(posts);
  }, [posts]);

  const renderItem = ({ item }: { item: any }) => {
    if (item.id === "__composer__") return <ComposerCard />;
    return <PostItem item={item as Post} />;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={dataForList}
        keyExtractor={(it, idx) => (it.id ?? `k${idx}`)}
        renderItem={renderItem}
        ListHeaderComponent={<StickyTop />}
        stickyHeaderIndices={[0]}                 // 让顶部蓝色区域固定
        onEndReachedThreshold={0.2}
        onEndReached={loadMore}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B7AFF" />
        }
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

      {/* 底部静态图标（示意） */}
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

/* =========================
 * 样式
 * ========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DDE7FF",
    paddingTop: Platform.select({ ios: 10, android: 0 }),
  },

  /* 顶部固定区 */
  stickyWrap: {
    backgroundColor: "#DDE7FF",
    paddingTop: 6,
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
    color: "#1F2A44",
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
  clubMembers: { color: "#2B3B6E", marginTop: 2, fontWeight: "700" },
  clubDesc: { color: "#2B3B6E", marginTop: 4, lineHeight: 18 },
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
  joinText: { color: "#5C6FD6", fontWeight: "800" },
  joinedText: { color: "#fff" },

  /* 写帖提示卡 */
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
  composerAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  composerHint: { flex: 1, color: "#7A86A8" },
  writeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#6B7AFF",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  writeBtnText: { color: "#fff", fontWeight: "800", marginRight: 4 },

  /* 帖子卡片 */
  postCard: {
    marginTop: 14,
    marginHorizontal: H_PADDING,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  authorAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  authorName: { fontWeight: "800", fontSize: 16, color: "#1A2036" },
  subMeta: { color: "#707AA0", marginTop: 2 },
  roundIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7ECFF",
  },

  postImage: { width: "100%", height: SCREEN_W * 0.6, justifyContent: "flex-end" },
  bubble: {
    alignSelf: "flex-start",
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 14,
    maxWidth: "90%",
  },
  bubbleText: { color: "#1A2036" },

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
  lightPillText: { color: "white", fontWeight: "800" },
  supportText: { color: "#5D678A", marginLeft: 6 },

  /* 底部静态栏（示意） */
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