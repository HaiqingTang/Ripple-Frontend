import React, { createContext, useContext, useState, useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  orderBy, 
  arrayUnion, 
  arrayRemove,
  increment,
  Timestamp,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAppContext } from "@/context/AppContext";


type Comment = { 
  id: string; 
  postId: string; 
  author: string; 
  authorId: string;
  text: string; 
  createdAt: string;
};

type Post = { 
  id: string; 
  title: string; 
  content: string; 
  createdAt: string; 
  author?: string;
  authorId: string;
  likes: string[]; // Array of user IDs who liked the post
  likeCount: number;
  commentCount: number;
};

type DiscussionContextType = {
  posts: Post[];
  loading: boolean;
  addPost: (p: Omit<Post, "id" | "createdAt" | "likes" | "likeCount" | "commentCount">) => Promise<Post>;
  getPost: (id: string) => Post | undefined;
  comments: Comment[];
  addComment: (c: Omit<Comment, "id" | "createdAt" | "author" | "authorId">) => Promise<Comment>;
  getCommentsForPost: (postId: string) => Comment[];
  // Firebase-backed Discussion stats:
  isPostLiked: (postId: string) => boolean;
  getPostLikes: (postId: string) => number;
  togglePostLike: (postId: string) => Promise<void>;
  getPostComments: (postId: string) => number;
  refreshPosts: () => Promise<void>;
  // Hottest post functionality:
  hottestPost: Post | null;
  loadHottestPost: () => Promise<void>;
};

const DiscussionContext = createContext<DiscussionContextType | null>(null);

export const useDiscussion = () => {
  const ctx = useContext(DiscussionContext);
  if (!ctx) throw new Error("useDiscussion must be used within DiscussionProvider");
  return ctx;
};

export default function DiscussionLayout() {
  const router = useRouter();
  const { userId, fullName } = useAppContext();
  
  // Back button for index screen - goes to Interest tab
  const BackToTabButton = () => (
    <TouchableOpacity
      onPress={() => router.push('/(tabs)/Interest')}
      style={{ marginLeft: 8 }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="arrow-back" size={24} color="#4A66C2" />
    </TouchableOpacity>
  );

  // Back button for other screens - goes to Discussion index
  const BackToIndexButton = () => (
    <TouchableOpacity
      onPress={() => router.push('/Discussion')}
      style={{ marginLeft: 8 }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="arrow-back" size={24} color="#4A66C2" />
    </TouchableOpacity>
  );

  // Firebase-backed state
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [hottestPost, setHottestPost] = useState<Post | null>(null);

  // Load posts from Firebase
  const loadPosts = async () => {
    try {
      setLoading(true);
      const postsRef = collection(db, 'discussionPosts');
      const q = query(
        postsRef, 
        orderBy('createdAt', 'desc'),
        limit(25)  // Limit to 25 most recent posts
      );
      const querySnapshot = await getDocs(q);
      
      const loadedPosts: Post[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedPosts.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          author: data.author,
          authorId: data.authorId,
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString() 
            : data.createdAt,
          likes: data.likes || [],
          likeCount: data.likeCount || 0,
          commentCount: data.commentCount || 0,
        });
      });
      
      setPosts(loadedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load comments from Firebase
  const loadComments = async () => {
    try {
      const commentsRef = collection(db, 'discussionComments');
      const q = query(commentsRef, orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const loadedComments: Comment[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedComments.push({
          id: doc.id,
          postId: data.postId,
          author: data.author,
          authorId: data.authorId,
          text: data.text,
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString() 
            : data.createdAt,
        });
      });
      
      setComments(loadedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  // Load hottest post from Firebase (post with most likes)
  const loadHottestPost = async () => {
    try {
      const postsRef = collection(db, 'discussionPosts');
      const q = query(
        postsRef, 
        orderBy('likeCount', 'desc'),
        limit(1)  // Get only the hottest post
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        const hottestPostData: Post = {
          id: doc.id,
          title: data.title,
          content: data.content,
          author: data.author,
          authorId: data.authorId,
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString() 
            : data.createdAt,
          likes: data.likes || [],
          likeCount: data.likeCount || 0,
          commentCount: data.commentCount || 0,
        };
        setHottestPost(hottestPostData);
      }
    } catch (error) {
      console.error('Error loading hottest post:', error);
    }
  };

  // Add post to Firebase
  const addPost = async (p: Omit<Post, "id" | "createdAt" | "likes" | "likeCount" | "commentCount">): Promise<Post> => {
    try {
      const postData = {
        ...p,
        authorId: userId,
        author: fullName,
        createdAt: new Date().toISOString(),
        likes: [],
        likeCount: 0,
        commentCount: 0,
      };
      
      const docRef = await addDoc(collection(db, 'discussionPosts'), postData);
      const newPost: Post = { id: docRef.id, ...postData };
      
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (error) {
      console.error('Error adding post:', error);
      throw error;
    }
  };

  // Add comment to Firebase
  const addComment = async (c: Omit<Comment, "id" | "createdAt" | "author" | "authorId">): Promise<Comment> => {
    try {
      const commentData = {
        ...c,
        authorId: userId,
        author: fullName,
        createdAt: new Date().toISOString(),
      };
      
      const docRef = await addDoc(collection(db, 'discussionComments'), commentData);
      const newComment: Comment = { id: docRef.id, ...commentData };
      
      setComments(prev => [...prev, newComment]);
      
      // Update post comment count
      const postRef = doc(db, 'discussionPosts', c.postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });
      
      // Update local post state
      setPosts(prev => prev.map(post => 
        post.id === c.postId 
          ? { ...post, commentCount: post.commentCount + 1 }
          : post
      ));
      
      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  // Toggle like in Firebase
  const togglePostLike = async (postId: string): Promise<void> => {
    try {
      const postRef = doc(db, 'discussionPosts', postId);
      const post = posts.find(p => p.id === postId);
      
      if (!post) return;
      
      const isLiked = post.likes.includes(userId);
      
      if (isLiked) {
        // Unlike
        await updateDoc(postRef, {
          likes: arrayRemove(userId),
          likeCount: increment(-1)
        });
        
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                likes: p.likes.filter(id => id !== userId),
                likeCount: Math.max(0, p.likeCount - 1)
              }
            : p
        ));
      } else {
        // Like
        await updateDoc(postRef, {
          likes: arrayUnion(userId),
          likeCount: increment(1)
        });
        
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                likes: [...p.likes, userId],
                likeCount: p.likeCount + 1
              }
            : p
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Helper functions
  const getPost = (id: string) => posts.find(x => x.id === id);
  const getCommentsForPost = (postId: string) => comments.filter(c => c.postId === postId);
  const isPostLiked = (postId: string): boolean => {
    const post = posts.find(p => p.id === postId);
    return post ? post.likes.includes(userId) : false;
  };
  const getPostLikes = (postId: string): number => {
    const post = posts.find(p => p.id === postId);
    return post ? post.likeCount : 0;
  };
  const getPostComments = (postId: string): number => {
    const post = posts.find(p => p.id === postId);
    return post ? post.commentCount : 0;
  };

  const refreshPosts = React.useCallback(async () => {
    await Promise.all([loadPosts(), loadComments(), loadHottestPost()]);
  }, []);

  // Load data on mount
  useEffect(() => {
    if (userId) {
      refreshPosts();
    }
  }, [userId, refreshPosts]);

  const value: DiscussionContextType = { 
    posts, 
    loading,
    addPost, 
    getPost, 
    comments, 
    addComment, 
    getCommentsForPost,
    isPostLiked,
    getPostLikes,
    togglePostLike,
    getPostComments,
    refreshPosts,
    hottestPost,
    loadHottestPost
  };

  return (
    <DiscussionContext.Provider value={value}>
      {/* Use Stack so children (index, detail, post, search) are stack screens */}
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#DDE7FF', // Match the page background
          },
          headerTitleStyle: {
            color: '#4A66C2',
            fontWeight: '700',
          },
          headerShadowVisible: false, // Remove header shadow for seamless look
        }}
      >
        {/* screen names correspond to files in this folder */}
        <Stack.Screen 
          name="index" 
          options={{ 
            title: "Discussion Boards",
            headerLeft: () => <BackToTabButton />
          }} 
        />
        <Stack.Screen 
          name="search" 
          options={{ 
            title: "Search",
            headerLeft: () => <BackToIndexButton />
          }} 
        />
        <Stack.Screen 
          name="detail" 
          options={{ 
            title: "Discussion",
            headerLeft: () => <BackToIndexButton />
          }} 
        />
        <Stack.Screen 
          name="post" 
          options={{ 
            title: "Create Post",
            headerLeft: () => <BackToIndexButton />
          }} 
        />
      </Stack>
    </DiscussionContext.Provider>
  );
}
