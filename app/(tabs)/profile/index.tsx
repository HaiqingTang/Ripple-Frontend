

import React, { useState, useMemo, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    FlatList,
    ActivityIndicator,
    Modal,
    TouchableWithoutFeedback,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import ProfilePicture from "@/components/ProfilePicture";
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const { width } = Dimensions.get("window");

type TabType = "Posts" | "Liked Posts";

interface Post {
    id: string;
    imageUrl?: string; // URL of the image (optional)
    title: string; // Title of the post
    createdAt: string; // Timestamp of creation
}

// Reusable Grid Component for Posts
interface PostGridProps {
    data: Post[];
    loading: boolean;
    numColumns?: number;
    onPostPress?: (post: Post) => void;
    emptyMessage?: string;
    emptyIcon?: string;
}

const PostGrid: React.FC<PostGridProps> = ({
    data,
    loading,
    numColumns = 2,
    onPostPress,
    emptyMessage = "No posts yet",
    emptyIcon = "images-outline",
}) => {
    const renderPostItem = ({ item }: { item: Post }) => (
        <TouchableOpacity
            style={styles.gridItemContainer}
            onPress={() => onPostPress?.(item)}
            accessibilityRole="button"
            accessibilityLabel={`View post ${item.title}`}
        >
            <View style={styles.gridImageContainer}>
                {item.imageUrl ? (
                    <Image 
                        source={{ uri: item.imageUrl }} 
                        style={styles.gridImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Ionicons name="image-outline" size={48} color="#999" />
                    </View>
                )}
            </View>
            <Text 
                style={styles.postTitle} 
                numberOfLines={2}
                ellipsizeMode="tail"
            >
                {item.title}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingState}>
                <ActivityIndicator size="large" color="#333" />
                <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
        );
    }

    if (data.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Ionicons name={emptyIcon} size={48} color="#999" />
                <Text style={styles.emptyStateText}>{emptyMessage}</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={data}
            renderItem={renderPostItem}
            numColumns={numColumns}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={numColumns > 1 ? styles.gridRow : undefined}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} // Disable scrolling since we're inside ScrollView
        />
    );
};

export default function ProfilePage() {
    const router = useRouter();

    // Get user details from global context with fallbacks
    const { userId, fullName, userName } = useAppContext();
    const displayName = fullName || "User Name";
    const displayHandle = userName || "@username";

    // State for data that will come from backend
    const [posts, setPosts] = useState<Post[]>([]);
    const [likedPosts, setLikedPosts] = useState<Post[]>([]);
    const [postCount, setPostCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Tab selection state
    const [selectedTab, setSelectedTab] = useState<TabType>("Posts");

    // Settings modal state
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);

    // Fetch user posts from Firestore
    const fetchUserPosts = async (): Promise<Post[]> => {
        try {
            const q = query(
                collection(db, "discussionPosts"),
                where("authorId", "==", userId)
            );
            const querySnapshot = await getDocs(q);
            const posts: Post[] = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                const createdAt = data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : typeof data.createdAt === 'string'
                ? data.createdAt
                : new Date().toISOString();

                return {
                    id: doc.id,
                    imageUrl: data.imageBase64 
                            ? `data:image/jpeg;base64,${data.imageBase64}`
                            : data.imageUrl || data.image,
                    title: data.title,
                    createdAt: createdAt,
                };
            });
            return posts;
        } catch (error) {
            console.error("Error fetching user posts:", error);
            throw error;
        }
    };

    const fetchLikedPosts = async (userId: string): Promise<Post[]> => {
        try {
            const postsRef = collection(db, 'discussionPosts');
            const querySnapshot = await getDocs(postsRef);
            
            const likedPostsData: Post[] = [];
            
            querySnapshot.forEach((postDoc) => {
                const data = postDoc.data();
                
                // Check if this post's likes array contains the current user
                if (data.likes && data.likes.includes(userId)) {
                    const createdAt = data.createdAt instanceof Timestamp
                        ? data.createdAt.toDate().toISOString()
                        : typeof data.createdAt === 'string'
                        ? data.createdAt
                        : new Date().toISOString();
                    
                    likedPostsData.push({
                        id: postDoc.id,
                        title: data.title,
                        imageUrl: data.imageBase64 
                            ? `data:image/jpeg;base64,${data.imageBase64}`
                            : data.imageUrl || data.image,
                        createdAt: createdAt,
                    });
                }
            });
            
            console.log('Total posts with userId in likes array:', likedPostsData.length);
            console.log('Liked posts:', likedPostsData);
            
            return likedPostsData;
        } catch (error) {
            console.error('Error fetching liked posts:', error);
            throw error;
        }
    };
    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError(null);
    
            const [userPosts, userLikedPosts] = await Promise.all([
                fetchUserPosts(),
                userId ? fetchLikedPosts(userId) : Promise.resolve([])
            ]);

            // Sort by createdAt in descending order (newest first)
            const sortedUserPosts = userPosts.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            
            const sortedLikedPosts = userLikedPosts.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
    
            setPosts(sortedUserPosts);
            setLikedPosts(sortedLikedPosts);
            setPostCount(sortedUserPosts.length);

        } catch (error) {
            setError("Failed to load posts. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    // Get current tab data
    const currentTabData = useMemo(() => {
        return selectedTab === "Posts" ? posts : likedPosts;
    }, [selectedTab, posts, likedPosts]);

    // Navigate to post detail page
    const handlePostPress = (post: Post) => {
        router.push('/Discussion');
        
        setTimeout(() => {
            router.push({
                pathname: "/Discussion/detail",
                params: { id: post.id }
            });
        }, 100);
    };

    const handleTabPress = (tab: TabType) => {
        setSelectedTab(tab);
    };

    const handleSignOut = () => {
        setSettingsModalVisible(false);
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut(auth);
                            // AppContext will automatically detect auth state change
                            // User will be redirected to login page
                            router.replace('/auth/login');
                        } catch (error) {
                            console.error('Sign out error:', error);
                            Alert.alert('Error', 'Failed to sign out. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView
            style={styles.container}
            stickyHeaderIndices={[2]} // Tab bar is the third child (index 2)
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity
                    onPress={() => setSettingsModalVisible(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Settings"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="settings-outline" size={22} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Profile Section */}
            <View style={styles.profileSection}>
                <ProfilePicture size={150} showEditButton={false} />
                <Text style={styles.name}>{displayName}</Text>
                <Text style={styles.handle}>{displayHandle}</Text>

                <View style={styles.stats}>
                    <Text style={styles.statNumber}>{postCount}</Text>
                    <Text style={styles.statLabel}>Posts</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <View style={styles.tabRow}>
                    <TouchableOpacity
                        onPress={() => handleTabPress("Posts")}
                        accessibilityRole="tab"
                        accessibilityLabel="Posts tab"
                        accessibilityState={{ selected: selectedTab === "Posts" }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                selectedTab === "Posts" && styles.activeTab,
                            ]}
                        >
                            Posts
                        </Text>
                        {selectedTab === "Posts" && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleTabPress("Liked Posts")}
                        accessibilityRole="tab"
                        accessibilityLabel="Liked posts tab"
                        accessibilityState={{ selected: selectedTab === "Liked Posts" }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                selectedTab === "Liked Posts" && styles.activeTab,
                            ]}
                        >
                            Liked Posts
                        </Text>
                        {selectedTab === "Liked Posts" && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tab Content */}
            <View style={styles.contentContainer}>
                {error ? (
                    <View style={styles.errorState}>
                        <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : (
                    <PostGrid
                        data={currentTabData}
                        loading={loading}
                        onPostPress={handlePostPress}
                        emptyMessage={
                            selectedTab === "Posts"
                            ? "You haven't created any posts yet."
                            : "You haven't liked any posts yet."
                        }
                        emptyIcon={selectedTab === "Posts" ? "create-outline" : "heart-outline"}
                    />
                )}
            </View>

            {/* Settings Modal */}
            <Modal
                visible={settingsModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setSettingsModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setSettingsModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.settingsModal}>
                                <Text style={styles.modalTitle}>Settings</Text>

                                <TouchableOpacity
                                    style={styles.settingsOption}
                                    onPress={handleSignOut}
                                    accessibilityRole="button"
                                    accessibilityLabel="Sign out of your account"
                                >
                                    <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
                                    <Text style={styles.signOutText}>Sign Out</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setSettingsModalVisible(false)}
                                    accessibilityRole="button"
                                    accessibilityLabel="Cancel"
                                >
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#DDE7FF",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
    },
    profileSection: {
        alignItems: "center",
        paddingVertical: 20,
    },
    avatarContainer: {
        marginBottom: 12,
    },
    name: {
        fontSize: 20,
        fontWeight: "700",
        color: "#333",
        textAlign: "center",
        marginBottom: 4,
    },
    handle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
        textAlign: "center",
    },
    editButton: {
        backgroundColor: "#F0F0F0",
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 16,
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
    },
    stats: {
        alignItems: "center",
        marginBottom: 20,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
    },
    statLabel: {
        fontSize: 14,
        color: "#666",
    },
    tabContainer: {
        backgroundColor: "#DDE7FF",
    },
    tabRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
        paddingVertical: 10,
        backgroundColor: "#DDE7FF",
    },
    tabText: {
        fontSize: 16,
        color: "#666",
        marginHorizontal: 20,
        paddingBottom: 8,
    },
    activeTab: {
        fontWeight: "700",
        color: "#333",
    },
    tabIndicator: {
        height: 2,
        backgroundColor: "#333",
        marginHorizontal: 20,
        borderRadius: 1,
    },
    contentContainer: {
        flex: 1,
        minHeight: 200,
    },
    grid: {
        padding: 10,
    },
    gridRow: {
        justifyContent: "space-between",
        paddingHorizontal: 5,
    },
    gridItemContainer: {
        flex: 1,
        maxWidth: '48%',
        marginBottom: 16,
        marginHorizontal: 5,
    },
    gridImageContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        marginBottom: 8,
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    placeholderContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    postTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        lineHeight: 18,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#999',
        marginTop: 12,
    },
    loadingState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
    },
    errorState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    errorText: {
        fontSize: 16,
        color: '#ff4444',
        marginTop: 12,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    retryButton: {
        backgroundColor: '#333',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 16,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    settingsModal: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    settingsOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFF5F5',
        borderRadius: 12,
        marginBottom: 12,
    },
    signOutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF3B30',
        marginLeft: 12,
    },
    cancelButton: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
});
