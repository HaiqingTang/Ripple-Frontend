import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity,
	ScrollView,
	Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {useAppContext} from "@/context/AppContext";
import { useRouter } from 'expo-router';
import pic1 from '@/assets/images/profile-post-1.png';
import pic2 from '@/assets/images/profile-post-2.png';
import pic3 from '@/assets/images/profile-post-3.png';

const { width } = Dimensions.get("window");

export default function ProfilePage() {
	const router = useRouter();
	// Get username details from global context
	const {userName, fullName} = useAppContext();
	// TODO: get post count from db
	const [postCount] = useState(120);
	const [posts] = useState([
		// TODO: fetch posts from backend
		// insert static images for now
		{ id: "1", image: pic1 },
		{ id: "2", image: pic2 },
		{ id: "3", image: pic3 },
		{ id: "4", image: pic1 },
		{ id: "5", image: pic2 },
		{ id: "6", image: pic3 },
		{ id: "7", image: pic1 },
		{ id: "8", image: pic2 },
		{ id: "9", image: pic3 },
	]);
	const [likedposts] = useState([
		// TODO: fetch liked posts from backend
		{ id: "1", image: pic1 },
	]);
	// Post tab is selected by default
	const [selectedTab, setSelectedTab] = useState<"Posts" | "Liked Posts">("Posts");

	return (
		<ScrollView
			style={styles.container}
			stickyHeaderIndices={[2]} // index of the tab bar inside ScrollView
			showsVerticalScrollIndicator={false}
			keyboardShouldPersistTaps="handled">

			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Profile</Text>
				{/*Todo: maybe remove settings icon?*/}
				<Ionicons name="settings-outline" size={22} color="#333" />
			</View>

			{/* Profile Picture */}
			<View style={styles.profileSection}>
				{/* TODO: placeholder for profile pic (do we need profile pic?)*/}
				<Ionicons name="person-circle-outline" size={150} color="#333" />
				{/*TODO: add this back when BE is implemented*/}
				{/*<Image*/}
				{/*	source={{ uri: "https://placehold.co/150x150/FFDAB9/000" }} // profile avatar (do we need this?)*/}
				{/*	style={styles.avatar}*/}
				{/*/>*/}
				<Text style={styles.name}>{fullName}</Text>
				<Text style={styles.handle}>{userName}</Text>

				<TouchableOpacity
					style={styles.editButton}
					onPress={() => router.push('/profile/edit')}
				>
					<Text style={styles.editButtonText}>Edit Profile</Text>
				</TouchableOpacity>

				<View style={styles.stats}>
					<Text style={styles.statNumber}>{postCount}</Text>
					<Text style={styles.statLabel}>Posts</Text>
				</View>
			</View>

			{/* Tabs */}
			<View>
				<View style={styles.tabRow}>
					<TouchableOpacity onPress={() => setSelectedTab("Posts")}>
						<Text style={[styles.tabText, selectedTab === "Posts" && styles.activeTab]}>
							Posts
						</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={() => setSelectedTab("Liked Posts")}>
						<Text style={[styles.tabText, selectedTab === "Liked Posts" && styles.activeTab]}>
							Liked Posts
						</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Tab Content */}
			<View style={styles.tabContainer}>
				{/* Posts Tab */}
				<View style={[
					styles.grid,
					selectedTab !== "Posts" && styles.hiddenTab
				]}>
					{posts.map((post) => (
						<Image key={post.id} source={post.image} style={styles.gridImage} />
					))}
				</View>

				{/* Liked Posts Tab */}
				<View style={[
					styles.grid,
					selectedTab !== "Liked Posts" && styles.hiddenTab,
					selectedTab === "Liked Posts" && styles.absolutePosition
				]}>
					{likedposts.map((post) => (
						<Image key={post.id} source={post.image } style={styles.gridImage} />
					))}
				</View>
			</View>
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
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		marginBottom: 12,
	},
	name: {
		fontSize: 20,
		fontWeight: "700",
		color: "#333",
		textAlign: "center",
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
	tabRow: {
		flexDirection: "row",
		// justifyContent: "center",
		// alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: "#E0E0E0",
		paddingVertical: 10,
		backgroundColor: "#DDE7FF",
		width: "100%",
	},
	tabText: {
		fontSize: 16,
		color: "#666",
		marginHorizontal: 20,
	},
	activeTab: {
		fontWeight: "700",
		color: "#333",
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		padding: 10,
		justifyContent: "space-between",
	},
	gridImage: {
		width: (width - 40) / 2, // 2 per row
		height: (width - 40) / 2,
		borderRadius: 12,
		marginBottom: 12,
	},
	tabContainer: {
		position: 'relative',
	},
	hiddenTab: {
		opacity: 0,
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
	},
	absolutePosition: {
		position: 'relative',
		opacity: 1,
	},
});