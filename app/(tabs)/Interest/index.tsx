import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useDiscussion } from "./_layout"; // relative import to provider

export default function DiscussionIndex() {
  const router = useRouter();
  const { posts } = useDiscussion();

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
        <TouchableOpacity style={styles.searchInput} onPress={() => router.push("/(tabs)/Interest/Discussion/search")}>
          <Text style={{ color: "#888" }}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push("/(tabs)/Interest/Discussion/post")}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>＋</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Latest Discussions</Text>

      {posts.map(p => (
        <TouchableOpacity
          key={p.id}
          style={styles.card}
          onPress={() => router.push({ pathname: "/(tabs)/Interest/Discussion/detail", params: { id: p.id } })}
        >
          <Text style={styles.cardTitle}>{p.title}</Text>
          <Text style={styles.cardMeta}>{p.author} • {new Date(p.createdAt).toLocaleString()}</Text>
        </TouchableOpacity>
      ))}
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