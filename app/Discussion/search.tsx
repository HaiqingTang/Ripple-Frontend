import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { collection, query, orderBy, getDocs, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Post = {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
};

export default function DiscussionSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch and filter posts from Firebase
  useEffect(() => {
    const searchPosts = async () => {
      const searchTerm = q.trim().toLowerCase();
      
      // If search is empty, clear results
      if (!searchTerm) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        // Query Firebase for recent posts (limited to avoid too much data)
        const postsRef = collection(db, 'discussionPosts');
        const q = query(
          postsRef,
          orderBy('createdAt', 'desc'),
          limit(100) // Limit to last 100 posts for search
        );
        
        const querySnapshot = await getDocs(q);
        const allPosts: Post[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          allPosts.push({
            id: doc.id,
            title: data.title || '',
            content: data.content || '',
            author: data.author || 'Anonymous',
            authorId: data.authorId || '',
            createdAt: data.createdAt instanceof Timestamp 
              ? data.createdAt.toDate().toISOString() 
              : data.createdAt,
            likeCount: data.likeCount || 0,
            commentCount: data.commentCount || 0,
          });
        });

        // Filter posts by search term
        const filtered = allPosts.filter(p => 
          p.title.toLowerCase().includes(searchTerm) || 
          p.content.toLowerCase().includes(searchTerm)
        );

        setSearchResults(filtered);
      } catch (error) {
        console.error('Error searching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search - wait 500ms after user stops typing
    const timeoutId = setTimeout(() => {
      searchPosts();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [q]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search discussions..."
          style={styles.input}
          autoFocus
          placeholderTextColor="#999"
        />
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#4A66C2", marginLeft: 8, fontWeight: "600" }}>Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ padding: 16 }}>
        {/* Search status */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4A66C2" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        {/* Results header */}
        {!loading && hasSearched && (
          <Text style={{ fontWeight: "700", marginBottom: 8, color: "#333" }}>
            {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'}
          </Text>
        )}

        {/* Empty state when no search yet */}
        {!hasSearched && !q && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>🔍</Text>
            <Text style={styles.emptySubtext}>Type to search discussions</Text>
          </View>
        )}

        {/* Search results */}
        {!loading && searchResults.map(p => (
          <TouchableOpacity
            key={p.id}
            style={styles.item}
            onPress={() => router.push({ pathname: "/Discussion/detail", params: { id: p.id } })}
          >
            <Text style={styles.itemTitle}>{p.title}</Text>
            <Text style={styles.itemMeta}>
              {p.author} • {new Date(p.createdAt).toLocaleDateString()} • {p.likeCount} likes • {p.commentCount} comments
            </Text>
            {/* Show snippet of content if available */}
            {p.content && (
              <Text style={styles.itemContent} numberOfLines={2}>
                {p.content}
              </Text>
            )}
          </TouchableOpacity>
        ))}

        {/* No results */}
        {!loading && hasSearched && searchResults.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>😔</Text>
            <Text style={styles.emptySubtext}>No results found for &ldquo;{q}&rdquo;</Text>
            <Text style={styles.emptyHint}>Try different keywords</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#DDE7FF" 
  },
  searchBar: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 12,
    backgroundColor: "#DDE7FF",
    borderBottomWidth: 1,
    borderBottomColor: "#C9D7FF"
  },
  input: { 
    flex: 1, 
    backgroundColor: "#fff", 
    padding: 12, 
    borderRadius: 10,
    fontSize: 16,
    color: "#333"
  },
  item: { 
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  itemTitle: { 
    fontWeight: "700",
    fontSize: 16,
    color: "#333",
    marginBottom: 4
  },
  itemMeta: { 
    color: "#6F7EA6", 
    fontSize: 12,
    marginBottom: 6
  },
  itemContent: {
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20
  },
  loadingText: {
    marginLeft: 10,
    color: "#4A66C2",
    fontSize: 14
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 12
  },
  emptySubtext: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4
  },
  emptyHint: {
    fontSize: 14,
    color: "#999"
  }
});