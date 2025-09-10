import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDiscussion } from "./_layout";

export default function DiscussionDetail() {
  const { id } = useLocalSearchParams() as { id?: string };
  const router = useRouter();
  const { getPost, getCommentsForPost, addComment } = useDiscussion();
  const post = id ? getPost(String(id)) : undefined;
  const comments = id ? getCommentsForPost(String(id)) : [];
  const [text, setText] = useState("");

  if (!post) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Post not found</Text>
      </View>
    );
  }

  const handleAddComment = () => {
    if (!text.trim()) {
      return;
    }
    addComment({ postId: post.id, author: "You", text });
    setText("");
    // optional: scroll or toast
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#DDE7FF" }}>
      <ScrollView style={{ padding: 16 }}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.meta}>{post.author} • {new Date(post.createdAt).toLocaleString()}</Text>
        <Text style={styles.content}>{post.content}</Text>

        <View style={{ marginTop: 18 }}>
          <Text style={{ fontWeight: "700" }}>Comments</Text>
          {comments.map(c => (
            <View key={c.id} style={styles.comment}>
              <View style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700" }}>{c.author} <Text style={{ fontWeight: "400", color: "#666" }}>{new Date(c.createdAt).toLocaleString()}</Text></Text>
                <Text style={{ marginTop: 6 }}>{c.text}</Text>
              </View>
            </View>
          ))}
          {comments.length === 0 && <Text style={{ color: "#666", marginTop: 8 }}>No comments yet</Text>}
        </View>
      </ScrollView>

      {/* add comment bar */}
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
});
