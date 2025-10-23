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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import ProfilePicture from "@/components/ProfilePicture";
import { collection, query, where, getDocs, Timestamp, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const { width } = Dimensions.get("window");

type TabType = "Posts" | "Liked Posts";

interface Post {
    id: string;
    imageUrl?: string;
    title: string;
    createdAt: string;
}

// Helper function to parse createdAt timestamp
const parseCreatedAt = (value: any): string => {
    if (value instanceof Timestamp) {
        return value.toDate().toISOString();
    }
    if (typeof value === 'string') {
        return value;
    }
    console.warn('Missing or invalid createdAt, using current time');
    return new Date().toISOString();
};

// Helper function to resolve image URL
const resolveImageUrl = (data: any): string | undefined => {
    if (data.imageBase64) {
        return `data:image/jpeg;base64,${data.imageBase64}`;
    }
    return data.imageUrl || data.image;
};

// Helper function to sort posts by date
const sortPostsByDate = (posts: Post[]): Post[] => {
    return posts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

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
                <Ionicons name={emptyIcon as any} size={48} color="#999" />
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
            scrollEnabled={false}
        />
    );
};

export default function ProfilePage() {
    const router = useRouter();

    const { userId, fullName, userName } = useAppContext();
    
    // display name from Firestore users (same logic as Challenge page)
    const [displayName, setDisplayName] = useState<string>(
        auth.currentUser?.displayName?.trim().split(/\s+/)[0] || "there"
    );
    const displayHandle = userName || "@username";

    const [posts, setPosts] = useState<Post[]>([]);
    const [likedPosts, setLikedPosts] = useState<Post[]>([]);
    const [postCount, setPostCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedTab, setSelectedTab] = useState<TabType>("Posts");

    const [settingsModalVisible, setSettingsModalVisible] = useState(false);

    // Fetch display name from Firestore (same logic as Challenge page)
    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const ref = doc(db, "users", uid);
        const unsub = onSnapshot(
            ref,
            (snap) => {
                const dn = (snap.data() as any)?.displayName as string | undefined;
                if (dn && typeof dn === "string") {
                    setDisplayName(dn.trim().split(/\s+/)[0] || "there");
                }
            },
            // keep silent on error to avoid UI churn; header will keep current fallback
            () => {}
        );
        return () => unsub();
    }, []);

    // Fetch user posts from Firestore
    const fetchUserPosts = async (): Promise<Post[]> => {
        try {
            const q = query(
                collection(db, "discussionPosts"),
                where("authorId", "==", userId)
            );
            const querySnapshot = await getDocs(q);
            const posts: Post[] = querySnapshot.docs.map((postDoc) => {
                const data = postDoc.data();

                return {
                    id: postDoc.id,
                    imageUrl: resolveImageUrl(data),
                    title: data.title || 'Untitled',
                    createdAt: parseCreatedAt(data.createdAt),
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
            const q = query(
                collection(db, 'discussionPosts'),
                where('likes', 'array-contains', userId)
            );
            const querySnapshot = await getDocs(q);
            
            const likedPostsData: Post[] = querySnapshot.docs.map((postDoc) => {
                const data = postDoc.data();
                
                return {
                    id: postDoc.id,
                    title: data.title || 'Untitled',
                    imageUrl: resolveImageUrl(data),
                    createdAt: parseCreatedAt(data.createdAt),
                };
            });
            
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

            setPosts(sortPostsByDate(userPosts));
            setLikedPosts(sortPostsByDate(userLikedPosts));
            setPostCount(userPosts.length);

        } catch (error) {
            setError("Failed to load posts. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on component mount
    useEffect(() => {
        const isMounted = { current: true };

        if (userId) {
            fetchUserData().then(() => {
                // Data fetched
            }).catch(() => {
                // Error handled in fetchUserData
            });
        }

        return () => {
            isMounted.current = false;
        };
    }, [userId]);

    // Get current tab data
    const currentTabData = useMemo(() => {
        return selectedTab === "Posts" ? posts : likedPosts;
    }, [selectedTab, posts, likedPosts]);

    // Navigate to post detail page
    const handlePostPress = (post: Post) => {
        router.push({
            pathname: "/Discussion/detail",
            params: { id: post.id, fromProfile: 'true' }
        });
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
                            router.replace('/');
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
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
            <ScrollView
                style={styles.container}
                stickyHeaderIndices={[2]}
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

                <TouchableOpacity
					style={styles.editButton}
					onPress={() => router.push('/profile/edit')}
				><Text style={styles.editButtonText}>Edit Profile</Text>
				</TouchableOpacity>


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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#DDE7FF",
    },
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