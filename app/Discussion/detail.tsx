import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useDiscussion } from "./_layout";
import { sharedStyles, COLORS } from "./styles/sharedStyles";
import { PostStats } from "./components/PostStats";

/**
 * Memoized Comment component for better performance
 */
const Comment = React.memo<{ 
  author: string; 
  text: string; 
  createdAt: string; 
}>(({ author, text, createdAt }) => (
  <View style={sharedStyles.comment}>
    <View style={sharedStyles.avatar} />
    <View style={{ flex: 1 }}>
      <Text style={{ fontWeight: "700" }}>
        {author}{" "}
        <Text style={{ fontWeight: "400", color: COLORS.textMuted }}>
          {new Date(createdAt).toLocaleString()}
        </Text>
      </Text>
      <Text style={{ marginTop: 6 }}>{text}</Text>
    </View>
  </View>
));
Comment.displayName = 'Comment';

/**
 * Optimized Discussion Detail component
 */
export default function DiscussionDetail() {
  const { id } = useLocalSearchParams() as { id?: string };
  const { getPost, getCommentsForPost, addComment } = useDiscussion(); 
  const [text, setText] = useState("");

  const post = id ? getPost(String(id)) : undefined;
  const comments = React.useMemo(() => 
    id ? getCommentsForPost(String(id)) : [], 
    [id, getCommentsForPost]
  );

  const handleAddComment = React.useCallback(async () => {
    if (!text.trim() || !post) return;
    
    try {
      await addComment({ postId: post.id, text }); 
      setText("");
    } catch (error) {
      console.error('Error adding comment:', error);
      // You could show an error message to the user here
    }
  }, [text, post, addComment]);

  if (!post) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Post not found</Text>
      </View>
    );
  }

  return (
    <View style={sharedStyles.container}>
      <ScrollView style={sharedStyles.contentPadding}>
        <Text style={sharedStyles.postTitle}>{post.title}</Text>
        <Text style={sharedStyles.postMeta}>
          {post.author} • {new Date(post.createdAt).toLocaleString()}
        </Text>

        <PostStats 
          postId={post.id} 
          commentCount={comments.length} 
        />

        <Text style={sharedStyles.postContent}>
          {post.content}
        </Text>

        <View style={{ marginTop: 18 }}>
          <Text style={{ fontWeight: "700" }}>Comments</Text>
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              author={comment.author}
              text={comment.text}
              createdAt={comment.createdAt}
            />
          ))}
          {comments.length === 0 && (
            <Text style={{ color: COLORS.textMuted, marginTop: 8 }}>
              No comments yet
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={sharedStyles.inputBar}>
        <TextInput
          placeholder="Add a comment..."
          value={text}
          onChangeText={setText}
          style={sharedStyles.input}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          onPress={handleAddComment} 
          style={sharedStyles.sendButton}
          disabled={!text.trim()}
        >
          <Text style={{ color: COLORS.white }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}