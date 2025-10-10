import React, { createContext, useContext, useState } from "react";
import { Stack } from "expo-router";


type Comment = { id: string; postId: string; author: string; text: string; createdAt: string };
type Post = { id: string; title: string; content: string; createdAt: string; author?: string };

type DiscussionContextType = {
  posts: Post[];
  addPost: (p: Omit<Post, "id" | "createdAt">) => Post;
  getPost: (id: string) => Post | undefined;
  comments: Comment[];
  addComment: (c: Omit<Comment, "id" | "createdAt">) => Comment;
  getCommentsForPost: (postId: string) => Comment[];
};

const DiscussionContext = createContext<DiscussionContextType | null>(null);

export const useDiscussion = () => {
  const ctx = useContext(DiscussionContext);
  if (!ctx) throw new Error("useDiscussion must be used within DiscussionProvider");
  return ctx;
};

import { v4 as uuidv4 } from "uuid";

export default function DiscussionLayout() {
  // initial sample data for testing
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "p1",
      title: "Discussion about this weekend's national competition",
      content: "Anyone joining the national competition this weekend? Tips & schedule.",
      createdAt: new Date().toISOString(),
      author: "Sophia",
    },
    {
      id: "p2",
      title: "Best pizza places in town",
      content: "Share your favorite pizza spots!",
      createdAt: new Date().toISOString(),
      author: "Ethan",
    },
  ]);

  const [comments, setComments] = useState<Comment[]>([
    { id: "c1", postId: "p1", author: "Ethan", text: "I'm joining, excited!", createdAt: new Date().toISOString() },
    { id: "c2", postId: "p2", author: "Olivia", text: "Try Pine Street Pizza.", createdAt: new Date().toISOString() },
  ]);

  const addPost = (p: Omit<Post, "id" | "createdAt">) => {
    const post: Post = { id: uuidv4(), createdAt: new Date().toISOString(), ...p };
    setPosts(prev => [post, ...prev]);
    return post;
  };

  const getPost = (id: string) => posts.find(x => x.id === id);

  const addComment = (c: Omit<Comment, "id" | "createdAt">) => {
    const comment: Comment = { id: uuidv4(), createdAt: new Date().toISOString(), ...c };
    setComments(prev => [...prev, comment]);
    return comment;
  };

  const getCommentsForPost = (postId: string) => comments.filter(c => c.postId === postId);

  const value: DiscussionContextType = { posts, addPost, getPost, comments, addComment, getCommentsForPost };

  return (
    <DiscussionContext.Provider value={value}>
      {/* Use Stack so children (index, detail, post, search) are stack screens */}
      <Stack
        screenOptions={{
          headerShown: true, // show header for each discussion screen; can be customized
        }}
      >
        {/* screen names correspond to files in this folder */}
        <Stack.Screen name="index" options={{ title: "Discussion Boards" }} />
        <Stack.Screen name="search" options={{ title: "Search" }} />
        <Stack.Screen name="detail" options={{ title: "Discussion" }} />
        <Stack.Screen name="post" options={{ title: "Create Post" }} />
      </Stack>
    </DiscussionContext.Provider>
  );
}
