import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDiscussion } from "./_layout";


type Listener = () => void;
function getStats() {
  const g = globalThis as any;
  if (!g.__POST_STATS__) {
    const listeners = new Set<Listener>();
    const likeCounts = new Map<string, number>();
    const likedByMe = new Set<string>();
    const commentCounts = new Map<string, number>();

    g.__POST_STATS__ = {
      subscribe(fn: Listener) {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
      emit() {
        listeners.forEach((fn: Listener) => fn());
      },

      isLiked: (id: string) => likedByMe.has(id),
      getLike: (id: string) => likeCounts.get(id) ?? 0,
      toggleLike(id: string) {
        if (likedByMe.has(id)) {
          likedByMe.delete(id);
          likeCounts.set(id, Math.max(0, (likeCounts.get(id) ?? 0) - 1));
        } else {
          likedByMe.add(id);
          likeCounts.set(id, (likeCounts.get(id) ?? 0) + 1);
        }
        g.__POST_STATS__.emit();
      },


      getComment: (id: string) => commentCounts.get(id) ?? 0,
      incComment(id: string, delta = 1) {
        commentCounts.set(id, (commentCounts.get(id) ?? 0) + delta);
        g.__POST_STATS__.emit();
      },


      init(id: string, likes = 0, comments = 0, liked = false) {
        if (!likeCounts.has(id)) likeCounts.set(id, likes);
        if (!commentCounts.has(id)) commentCounts.set(id, comments);
        if (liked) likedByMe.add(id);
      },
    };
  }
  return g.__POST_STATS__;
}

export default function DiscussionIndex() {
  const router = useRouter();
  const { posts, getCommentsForPost } = useDiscussion(); 
  const stats = getStats();
  const [, setTick] = useState(0);


  useEffect(() => stats.subscribe(() => setTick((t) => t + 1)), [stats]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* hero / cover */}
      <View style={styles.hero}>
        <View style={styles.heroImage} />
        <Text style={styles.heroTitle}>🔥 Hot topics right now</Text>
        <Text style={styles.heroSub}>Tap a topic to see discussion</Text>
      </View>

      {/* search row */}
      <View style={styles.searchRow}>
        <TouchableOpacity
          style={styles.searchInput}
          onPress={() => router.push("/(tabs)/Interest/Discussion/search")}
        >
          <Text style={{ color: "#888" }}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(tabs)/Interest/Discussion/post")}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>＋</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Latest Discussions</Text>

      {posts.map((p) => {
        const commentCount = getCommentsForPost(p.id).length;
        const liked = stats.isLiked(p.id);
        const likeCount = stats.getLike(p.id);

        return (
          <View key={p.id} style={styles.card}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(`/(tabs)/Interest/Discussion/detail?id=${p.id}`)}
            >
              <Text style={styles.cardTitle}>{p.title}</Text>
              <Text style={styles.cardMeta}>
                {p.author} • {new Date(p.createdAt).toLocaleString()}
              </Text>
            </TouchableOpacity>

          
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => stats.toggleLike(p.id)}
                style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={liked ? "heart" : "heart-outline"}
                  size={16}
                  color={liked ? "#e11d48" : "#4b5563"}
                />
                <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: "600", color: "#111827" }}>
                  {likeCount}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#4b5563" />
                <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: "600", color: "#111827" }}>
                  {commentCount}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#DDE7FF" }, 
  hero: { padding: 12 },
  heroImage: { height: 140, borderRadius: 14, backgroundColor: "#EAF0FF", marginBottom: 10 },
  heroTitle: { fontSize: 18, fontWeight: "800", color: "#4A66C2" },
  heroSub: { color: "#6F7EA6", marginTop: 4 },
  searchRow: { flexDirection: "row", alignItems: "center", marginTop: 12, paddingHorizontal: 4 },
  searchInput: { flex: 1, backgroundColor: "#fff", padding: 10, borderRadius: 10 },
  addButton: { marginLeft: 8, backgroundColor: "#4A66C2", padding: 10, borderRadius: 8 },
  sectionTitle: { marginTop: 16, marginLeft: 4, fontWeight: "700" },
  card: { marginTop: 10, marginHorizontal: 4, padding: 12, backgroundColor: "#C9D7FF", borderRadius: 12 },
  cardTitle: { fontWeight: "700" },
  cardMeta: { color: "#6F7EA6", marginTop: 6, fontSize: 12 },
});
