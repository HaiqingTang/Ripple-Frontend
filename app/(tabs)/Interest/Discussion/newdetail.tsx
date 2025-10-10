import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
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
      emit() { listeners.forEach((fn: Listener) => fn()); },

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

export default function DiscussionDetail() {
  const { id } = useLocalSearchParams() as { id?: string };
  const router = useRouter();
  const { getPost, getCommentsForPost, addComment } = useDiscussion(); 
  const post = id ? getPost(String(id)) : undefined;
  const [text, setText] = useState("");
  const stats = getStats();
  const [, setTick] = useState(0);

  useEffect(() => stats.subscribe(() => setTick((t) => t + 1)), [stats]);

  if (!post) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Post not found</Text>
      </View>
    );
  }

  const comments = getCommentsForPost(post.id);
  const liked = stats.isLiked(post.id);
  const likeCount = stats.getLike(post.id);
  const commentCount = comments.length; 

  const handleAddComment = () => {
    if (!text.trim()) return;
    addComment({ postId: post.id, author: "You", text }); 
    setText("");

  };

  return (
    <View style={{ flex: 1, backgroundColor: "#DDE7FF" }}>
      <ScrollView style={{ padding: 16 }}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.meta}>
          {post.author} • {new Date(post.createdAt).toLocaleString()}
        </Text>


        <View style={styles.statRow}>
          <TouchableOpacity
            style={styles.stat}
            onPress={() => stats.toggleLike(post.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={18}
              color={liked ? "#e11d48" : "#4b5563"}
            />
            <Text style={styles.count}>{likeCount}</Text>
          </TouchableOpacity>

          <View style={styles.stat}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#4b5563" />
            <Text style={styles.count}>{commentCount}</Text>
          </View>
        </View>


        <Text style={styles.content}>

        </Text>

        <View style={{ marginTop: 18 }}>
          <Text style={{ fontWeight: "700" }}>Comments</Text>
          {comments.map((c) => (
            <View key={c.id} style={styles.comment}>
              <View style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700" }}>
                  {c.author}{" "}
                  <Text style={{ fontWeight: "400", color: "#666" }}>
                    {new Date(c.createdAt).toLocaleString()}
                  </Text>
                </Text>
                <Text style={{ marginTop: 6 }}>{c.text}</Text>
              </View>
            </View>
          ))}
          {comments.length === 0 && (
            <Text style={{ color: "#666", marginTop: 8 }}>No comments yet</Text>
          )}
        </View>
      </ScrollView>


      <View style={styles.inputBar}>
        <TextInput
          placeholder="Add a comment..."
          value={text}
          onChangeText={setText}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleAddComment} style={styles.sendBtn}>
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "800", marginBottom: 6 },
  meta: { color: "#6F7EA6", marginBottom: 10, fontSize: 12 },
  content: { fontSize: 15, color: "#333", lineHeight: 22 },
  comment: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderColor: "#eee" },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#bbb", marginRight: 10 },
  inputBar: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "#fff" },
  input: { flex: 1, backgroundColor: "#f2f2f2", padding: 8, borderRadius: 8 },
  sendBtn: { marginLeft: 8, backgroundColor: "#4A66C2", padding: 10, borderRadius: 6 },

  statRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  stat: { flexDirection: "row", alignItems: "center", marginRight: 18 },
  count: { marginLeft: 6, color: "#111827", fontWeight: "700" },
});
