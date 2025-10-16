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
	ImageSourcePropType,
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
import pic1 from '@/assets/images/profile-post-1.png';
import pic2 from '@/assets/images/profile-post-2.png';
import pic3 from '@/assets/images/profile-post-3.png';
import ProfilePicture from '@/components/ProfilePicture';

const { width } = Dimensions.get("window");

type TabType = "Posts" | "Liked Posts";

interface Post {
	id: string;
	image: ImageSourcePropType;
	imageUrl?: string; // For backend URLs
	createdAt?: string;
	likeCount?: number;
}

// Reusable Grid Component for Posts
interface PostGridProps {
	data: Post[];
	loading: boolean;
	numColumns?: number;
	onPostPress?: (post: Post) => void;
}

const PostGrid: React.FC<PostGridProps> = ({
	                                           data,
	                                           loading,
	                                           numColumns = 2,
	                                           onPostPress
                                           }) => {
	const renderPostItem = ({ item }: { item: Post }) => (
		<TouchableOpacity
			style={styles.gridImageContainer}
			onPress={() => onPostPress?.(item)}
			accessibilityRole="button"
			accessibilityLabel={`View post ${item.id}`}
		>
			<Image
				source={item.imageUrl ? { uri: item.imageUrl } : item.image}
				style={styles.gridImage}
			/>
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
				<Ionicons name="images-outline" size={48} color="#999" />
				<Text style={styles.emptyStateText}>No posts yet</Text>
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
	const { userName, fullName, userId } = useAppContext();
	const displayName = fullName || 'User Name';
	const displayHandle = userName || '@username';

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

	// API Functions (replace with your actual API endpoints)
	const fetchUserPosts = async (): Promise<Post[]> => {
		try {
			// TODO: Replace with actual API endpoint
			// const response = await fetch(`/api/users/${userId}/posts`);
			// const data = await response.json();
			// return data;

			// Temporary static data for development
			await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
			return [
				{ id: "1", image: pic1 },
				{ id: "2", image: pic2 },
				{ id: "3", image: pic3 },
				{ id: "4", image: pic1 },
				{ id: "5", image: pic2 },
				{ id: "6", image: pic3 },
				{ id: "7", image: pic1 },
				{ id: "8", image: pic2 },
				{ id: "9", image: pic3 },
			];
		} catch (error) {
			console.error('Error fetching user posts:', error);
			throw error;
		}
	};

	const fetchLikedPosts = async (): Promise<Post[]> => {
		try {
			// TODO: Replace with actual API endpoint
			// const response = await fetch(`/api/users/${userId}/liked-posts`);
			// const data = await response.json();
			// return data;

			// Temporary static data for development
			await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
			return [
				{ id: "liked-1", image: pic1 },
			];
		} catch (error) {
			console.error('Error fetching liked posts:', error);
			throw error;
		}
	};

	const fetchUserData = async () => {
		try {
			setLoading(true);
			setError(null);

			// Fetch both posts and liked posts concurrently
			const [userPosts, userLikedPosts] = await Promise.all([
				fetchUserPosts(),
				fetchLikedPosts()
			]);

			setPosts(userPosts);
			setLikedPosts(userLikedPosts);
			setPostCount(userPosts.length);
		} catch (error) {
			setError('Failed to load posts. Please try again.');
			console.error('Error fetching user data:', error);
		} finally {
			setLoading(false);
		}
	};

	// Fetch data on component mount
	useEffect(() => {
		if (userId) { // Only fetch if user is logged in
			fetchUserData();
		}
	}, [userId]);

	// Get current tab data
	const currentTabData = useMemo(() => {
		return selectedTab === "Posts" ? posts : likedPosts;
	}, [selectedTab, posts, likedPosts]);

	// Refresh function for pull-to-refresh (if needed)
	const handleRefresh = () => {
		fetchUserData();
	};

	const handleEditProfile = () => {
		router.push({ pathname: '/profile/edit' });
	};

	const handlePostPress = (post: Post) => {
		// TODO: Navigate to post detail page
		router.push({ pathname: `/posts/${post.id}` });
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
				<Text style={styles.name}>{fullName}</Text>
				<Text style={styles.handle}>{userName}</Text>

				<TouchableOpacity
					style={styles.editButton}
					onPress={handleEditProfile}
					accessibilityRole="button"
					accessibilityLabel="Edit profile"
					hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
				>
					<Text style={styles.editButtonText}>Edit Profile</Text>
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
						<Text style={[
							styles.tabText,
							selectedTab === "Posts" && styles.activeTab
						]}>
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
						<Text style={[
							styles.tabText,
							selectedTab === "Liked Posts" && styles.activeTab
						]}>
							Liked Posts
						</Text>
						{selectedTab === "Liked Posts" && <View style={styles.tabIndicator} />}
					</TouchableOpacity>
				</View>
			</View>

			{/* Tab Content - Conditional Rendering */}
			<View style={styles.contentContainer}>
				{error ? (
					<View style={styles.errorState}>
						<Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
						<Text style={styles.errorText}>{error}</Text>
						<TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
							<Text style={styles.retryButtonText}>Try Again</Text>
						</TouchableOpacity>
					</View>
				) : (
					<PostGrid
						data={currentTabData}
						loading={loading}
						onPostPress={handlePostPress}
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
		minHeight: 200, // Ensure minimum height for content
	},
	grid: {
		padding: 10,
	},
	gridRow: {
		justifyContent: "space-between",
		paddingHorizontal: 5,
	},
	gridImageContainer: {
		flex: 1,
		maxWidth: '48%', // Ensures 2 columns with proper spacing
		marginBottom: 12,
		marginHorizontal: 5,
	},
	gridImage: {
		width: '100%',
		aspectRatio: 1, // Square images
		borderRadius: 12,
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