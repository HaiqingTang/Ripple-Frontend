import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useDiscussion } from "./_layout";
import { useAppContext } from "@/context/AppContext";
import { sharedStyles, COLORS } from "@/styles/sharedStyles";
import PostStats from "./components/PostStats";
import { getDoc, doc } from "firebase/firestore";
import { db } from '@/lib/firebase';

/**
 * Memoized Comment component for better performance
 * Dynamically fetches author's full name using authorId
 */
const Comment = React.memo<{ 
  authorId: string; 
  text: string; 
  createdAt: string;
  authorAvatar?: string;
}>(({ authorId, text, createdAt, authorAvatar }) => {
  const [authorName, setAuthorName] = useState<string>("Loading...");

  useEffect(() => {
    let isMounted = true;
    async function fetchAuthorName() {
      if (!authorId) {
        if (isMounted) setAuthorName("Unknown User");
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", authorId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (isMounted) setAuthorName(userData.name || userData.fullName || "Unknown User");
        } else {
          if (isMounted) setAuthorName("Unknown User");
        }
      } catch (error) {
        if (isMounted) setAuthorName("Unknown User");
      }
    }
    fetchAuthorName();
    return () => { isMounted = false; };
  }, [authorId]);

  return (
    <View style={sharedStyles.comment}>
      {authorAvatar ? (
        <Image 
          source={{ uri: authorAvatar }}
          style={[sharedStyles.avatar, { borderRadius: 18 }]}
        />
      ) : (
        <View style={sharedStyles.avatar} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "700" }}>
          {authorName}{" "}
          <Text style={{ fontWeight: "400", color: COLORS.textMuted }}>
            {new Date(createdAt).toLocaleString()}
          </Text>
        </Text>
        <Text style={{ marginTop: 6 }}>{text}</Text>
      </View>
    </View>
  );
});
Comment.displayName = 'Comment';

/**
 * Optimized Discussion Detail component
 * Dynamically fetches post author's full name using post.authorId
 */
export default function DiscussionDetail() {
  const { id } = useLocalSearchParams() as { id?: string };
  const { getPost, getCommentsForPost, addComment } = useDiscussion();
  const { profilePictureUrl } = useAppContext();
  const [text, setText] = useState("");
  const [postAuthorName, setPostAuthorName] = useState<string>("Loading...");

  const post = id ? getPost(String(id)) : undefined;
  const comments = React.useMemo(() => 
    id ? getCommentsForPost(String(id)) : [], 
    [id, getCommentsForPost]
  );

  // Fetch post author's full name
  useEffect(() => {
    let isMounted = true;
    async function fetchPostAuthorName() {
      if (!post?.authorId) {
        if (isMounted) setPostAuthorName(post?.author || "Unknown User");
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", post.authorId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (isMounted) setPostAuthorName(userData.name || userData.fullName || "Unknown User");
        } else {
          if (isMounted) setPostAuthorName("Unknown User");
        }
      } catch (error) {
        if (isMounted) setPostAuthorName("Unknown User");
      }
    }
    fetchPostAuthorName();
    return () => { isMounted = false; };
  }, [post?.authorId, post?.author]);

  const handleAddComment = React.useCallback(async () => {
    if (!text.trim() || !post) return;
    try {
      await addComment({ postId: post.id, text }); 
      setText("");
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }, [text, post, addComment]);

  if (!post) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Post not found</Text>
      </View>
    );
  }

  // Construct the image URI from imageBase64
  const imageUri = post.imageBase64 
    ? `data:image/jpeg;base64,${post.imageBase64}` 
    : undefined;

  return (
    <View style={sharedStyles.container}>
      <ScrollView style={sharedStyles.contentPadding}>
        <Text style={sharedStyles.postTitle}>{post.title}</Text>
        <Text style={sharedStyles.postMeta}>
          {postAuthorName} • {new Date(post.createdAt).toLocaleString()}
        </Text>

        {/* Display the image if available */}
        {imageUri && (
          <Image 
            source={{ uri: imageUri }}
            style={{ width: "100%", height: 200, borderRadius: 8, marginTop: 10 }}
          />
        )}

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
              authorId={comment.authorId}
              text={comment.text}
              createdAt={comment.createdAt}
              authorAvatar={comment.authorAvatar}
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
        {profilePictureUrl ? (
          <Image 
            source={{ uri: profilePictureUrl }}
            style={[sharedStyles.avatar, { borderRadius: 18 }]}
          />
        ) : (
          <View style={sharedStyles.avatar} />
        )}
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