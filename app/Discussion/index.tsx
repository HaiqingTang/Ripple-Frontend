import React from "react";
import { Text, ScrollView, ActivityIndicator, View } from "react-native";
import { useDiscussion } from "./_layout";
import { sharedStyles, COLORS } from "@/styles/sharedStyles";
import HeroSection from "./components/HeroSection";
import SearchBar from "./components/SearchBar";
import PostCard from "./components/PostCard";

/**
 * Optimized Discussion Index with memoized components
 */
export default function DiscussionIndex() {
  const { posts, loading } = useDiscussion();

  if (loading) {
    return (
      <View style={[sharedStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: COLORS.textSecondary }}>Loading discussions...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={sharedStyles.container} 
      contentContainerStyle={sharedStyles.contentPadding}
      showsVerticalScrollIndicator={false}
    >
      <HeroSection />
      <SearchBar />
      
      <Text style={sharedStyles.sectionTitle}>Latest Discussions</Text>

      {posts.length === 0 ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 16 }}>
            No discussions yet. Be the first to start one!
          </Text>
        </View>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            title={post.title}
            author={post.author}
            createdAt={post.createdAt}
            commentCount={post.commentCount}
          />
        ))
      )}
    </ScrollView>
  );
}