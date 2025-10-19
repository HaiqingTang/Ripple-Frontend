import React, { useEffect, useMemo, useState } from "react";
import { Text, ScrollView, ActivityIndicator, View, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { useDiscussion } from "./_layout";
import { sharedStyles, COLORS } from "@/styles/sharedStyles";
import HeroSection from "./components/HeroSection";
import SearchBar from "./components/SearchBar";
import PostCard from "./components/PostCard";
import SortFilterBar, { SortBy } from "./components/SortFilterBar";


type Post = {
  id: string;
  title: string;
  author: string;
  createdAt: string;     
  commentCount?: number;
  likeCount?: number;
  content?: string;
  tags?: string[];
};

const STORAGE_KEYS = {
  sortBy: "discussion:sortBy",
  tags: "discussion:selectedTags",
} as const;

function readSession<T>(key: string, fallback: T): T {
  try {
    if (typeof sessionStorage === "undefined") return fallback;
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeSession<T>(key: string, value: T) {
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
   
  }
}


function relevanceScore(q: string, post: Post) {
  const query = q.trim().toLowerCase();
  if (!query) return 0;
  const title = (post.title || "").toLowerCase();
  const body = (post.content || "").toLowerCase();
  const tags = (post.tags || []).join(" ").toLowerCase();

  let score = 0;
 
  const countHits = (txt: string) =>
    txt ? (txt.match(new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length : 0;

  score += countHits(title) * 5;
  score += countHits(body) * 2;
  score += countHits(tags) * 3;

  
  if (title.startsWith(query)) score += 2;
  if (title === query) score += 3;

  return score;
}

/**
 * Optimized Discussion Index with memoized components and pagination
 */
export default function DiscussionIndex() {
  const { posts, loading, loadingMore, hasMore, loadMorePosts } = useDiscussion();


  const [sortBy, setSortBy] = useState<SortBy>(() => readSession<SortBy>(STORAGE_KEYS.sortBy, "date"));
  const [selectedTags, setSelectedTags] = useState<string[]>(() =>
    readSession<string[]>(STORAGE_KEYS.tags, [])
  );


  const [query, setQuery] = useState<string>("");

  
  useEffect(() => writeSession(STORAGE_KEYS.sortBy, sortBy), [sortBy]);
  useEffect(() => writeSession(STORAGE_KEYS.tags, selectedTags), [selectedTags]);

  
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    (posts as Post[]).forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  
  const visiblePosts = useMemo(() => {
    let list: Post[] = (posts as Post[]) || [];

    
    if (selectedTags.length) {
      list = list.filter((p) => {
        const tags = p.tags || [];
        return tags.some((t) => selectedTags.includes(t));
      });
    }

   
    if (sortBy === "date") {
      list = [...list].sort((a, b) => {
        const av = typeof a.createdAt === "number" ? a.createdAt : +new Date(a.createdAt);
        const bv = typeof b.createdAt === "number" ? b.createdAt : +new Date(b.createdAt);
        return bv - av;
      });
    } else if (sortBy === "popularity") {
      list = [...list].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    } else if (sortBy === "relevance") {
      
      if (!query.trim()) {
        list = [...list].sort((a, b) => {
          const av = typeof a.createdAt === "number" ? a.createdAt : +new Date(a.createdAt);
          const bv = typeof b.createdAt === "number" ? b.createdAt : +new Date(b.createdAt);
          return bv - av;
        });
      } else {
        list = [...list]
          .map((p) => ({ p, s: relevanceScore(query, p) }))
          .sort((x, y) => y.s - x.s)
          .filter((x) => x.s > 0)
          .map((x) => x.p);
      }
    }

    return list;
  }, [posts, selectedTags, sortBy, query]);

  // Handle scroll to detect when near bottom and load more posts
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    // Calculate how close we are to the bottom
    const paddingToBottom = 100; // Trigger when 100px from bottom
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    // Load more posts if we're close to bottom and not already loading
    if (isCloseToBottom && !loadingMore && hasMore) {
      loadMorePosts();
    }
  };

  if (loading) {
    return (
      <View style={[sharedStyles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={sharedStyles.container}
      onScroll={handleScroll}
      scrollEventThrottle={400}
    >
      <HeroSection />
      <View style={{ padding: 10 }}>
      <SearchBar />
      <SortFilterBar
        sortBy={sortBy}
        onSortChange={setSortBy}
        availableTags={availableTags}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        query={query}
        onQueryChange={setQuery}
      />

      {visiblePosts.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: COLORS.textMuted, fontSize: 16 }}>No posts found</Text>
        </View>
      ) : (
        <>
          {visiblePosts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
              author={post.author}
              createdAt={post.createdAt}
              commentCount={post.commentCount || 0}
            />
          ))}
          
          {/* Loading indicator at bottom when loading more posts */}
          {loadingMore && (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={{ color: COLORS.textMuted, marginTop: 8, fontSize: 14 }}>
                Loading more posts...
              </Text>
            </View>
          )}
          
          {/* Show message when all posts are loaded */}
          {!hasMore && visiblePosts.length > 0 && (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>
                No more posts
              </Text>
            </View>
          )}
        </>
      )}
      </View>
    </ScrollView>
  );
}
