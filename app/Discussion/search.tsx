import React, { useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useDiscussion } from "./_layout";

export default function DiscussionSearch() {
  const router = useRouter();
  const { posts } = useDiscussion();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return posts;
    return posts.filter(p => p.title.toLowerCase().includes(t) || p.content.toLowerCase().includes(t));
  }, [q, posts]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search"
          style={styles.input}
          autoFocus
        />
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#4A66C2", marginLeft: 8 }}>Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ padding: 16 }}>
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>Results</Text>
        {filtered.map(p => (
          <TouchableOpacity
            key={p.id}
            style={styles.item}
            onPress={() => router.push({ pathname: "/Discussion/detail", params: { id: p.id } })}
          >
            <Text style={styles.itemTitle}>{p.title}</Text>
            <Text style={styles.itemMeta}>{p.author} • {new Date(p.createdAt).toLocaleString()}</Text>
          </TouchableOpacity>
        ))}
        {filtered.length === 0 && <Text style={{ color: "#666" }}>No results</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#DDE7FF" },
  searchBar: { flexDirection: "row", alignItems: "center", padding: 12 },
  input: { flex: 1, backgroundColor: "#fff", padding: 10, borderRadius: 10 },
  item: { paddingVertical: 10, borderBottomWidth: 1, borderColor: "#e7e7e7" },
  itemTitle: { fontWeight: "700" },
  itemMeta: { color: "#6F7EA6", marginTop: 4, fontSize: 12 },
});