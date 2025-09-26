import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, SafeAreaView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Module-level constants
const BLUE_BG = '#E3F2FD';
const WHITE = '#FFFFFF';

const AVAILABLE_TAGS = [
	'Work', 'Relationships', 'Health', 'Goals', 'Gratitude', 'Stress',
	'Achievements', 'Challenges', 'Family', 'Friends', 'Exercise', 'Sleep',
	'Mood', 'Anxiety', 'Happiness', 'Growth', 'Learning', 'Creativity'
];

const TAG_COLOR_PALETTE = [
	{ bg: '#FFE5E5', text: '#D63384' },
	{ bg: '#E5F3FF', text: '#0D6EFD' },
	{ bg: '#E5FFE5', text: '#198754' },
	{ bg: '#FFF3E5', text: '#FD7E14' },
	{ bg: '#F0E5FF', text: '#6F42C1' },
	{ bg: '#FFE5F3', text: '#E91E63' },
	{ bg: '#E5FFF3', text: '#20C997' },
	{ bg: '#FFF5E5', text: '#FFC107' }
];

// Utility function moved outside component
const getTagColor = (tag: string) => {
	const charSum = tag.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
	return TAG_COLOR_PALETTE[charSum % TAG_COLOR_PALETTE.length];
};

export default function JournalPage() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const [journalText, setJournalText] = useState('');
	const [selectedTags, setSelectedTags] = useState<string[]>(['Work', 'Goals', 'Growth']);
	const [isTagModalVisible, setIsTagModalVisible] = useState(false);
	const [hasInitialized, setHasInitialized] = useState(false);

	useEffect(() => {
		if (!hasInitialized) {
			try {
				if (params.journal) {
					setJournalText(params.journal as string);
				}
				if (params.tags) {
					const parsedTags = JSON.parse(params.tags as string);
					if (Array.isArray(parsedTags)) {
						setSelectedTags(parsedTags);
					}
				}
			} catch (error) {
				console.warn('Error parsing tags from params:', error);
			}
			setHasInitialized(true);
		}
	}, [params.journal, params.tags, hasInitialized]);

	const addTag = (tag: string) => {
		if (!selectedTags.includes(tag)) {
			setSelectedTags([...selectedTags, tag]);
		}
	};

	const removeTag = (tagToRemove: string) => {
		setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
	};

	const handleAddToLog = () => {
		const tagsString = JSON.stringify(selectedTags);
		router.push(`/(tabs)/personalLog?journal=${encodeURIComponent(journalText)}&tags=${encodeURIComponent(tagsString)}`);
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()}>
					<Ionicons name="arrow-back" size={24} color="#333" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Write journal</Text>
			</View>

			<KeyboardAvoidingView
				style={styles.keyboardContainer}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<ScrollView
					style={styles.scrollView}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					{/* Journal Prompts Card */}
					<View style={styles.card}>
						<Text style={styles.cardTitle}>Some questions for you today...</Text>

						<View style={styles.promptsContainer}>
							<Text style={styles.promptText}>• What's been weighing on your mind lately?</Text>
							<Text style={styles.promptText}>• What 3 things are you grateful for today?</Text>
							<Text style={styles.promptText}>• What's something you're proud of recently?</Text>
						</View>

						<TextInput
							style={styles.journalInput}
							placeholder="Start writing your thoughts here..."
							placeholderTextColor="#999"
							multiline
							value={journalText}
							onChangeText={setJournalText}
							autoCorrect={true}
							autoCapitalize="sentences"
						/>
					</View>

					{/* Topic Tagging Card */}
					<View style={[styles.card, styles.tagCard]}>
						<Text style={styles.cardTitle}>Tag a topic</Text>

						<View style={styles.tagsContainer}>
							{selectedTags.map((tag, index) => {
								const colors = getTagColor(tag);
								return (
									<View key={tag} style={[styles.selectedTag, { backgroundColor: colors.bg }]}>
										<Text style={[styles.selectedTagText, { color: colors.text }]}>{tag}</Text>
										<TouchableOpacity onPress={() => removeTag(tag)}>
											<Ionicons name="close" size={16} color={colors.text} />
										</TouchableOpacity>
									</View>
								);
							})}

							<TouchableOpacity
								onPress={() => setIsTagModalVisible(true)}
								style={styles.addTagButton}
							>
								<Ionicons name="chevron-down" size={16} color="#666" />
							</TouchableOpacity>
						</View>
					</View>

					{/* Add to Log Button */}
					<TouchableOpacity style={styles.submitButton} onPress={handleAddToLog}>
						<Text style={styles.submitButtonText}>Add to Personal Log</Text>
					</TouchableOpacity>
				</ScrollView>
			</KeyboardAvoidingView>

			{/* Tag Selection Modal */}
			<Modal
				visible={isTagModalVisible}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => setIsTagModalVisible(false)}
			>
				<SafeAreaView style={styles.modalContainer}>
					<View style={styles.modalHeader}>
						<TouchableOpacity onPress={() => setIsTagModalVisible(false)}>
							<Text style={styles.modalCancelText}>Cancel</Text>
						</TouchableOpacity>
						<Text style={styles.modalTitle}>Select Topics</Text>
						<TouchableOpacity onPress={() => setIsTagModalVisible(false)}>
							<Text style={styles.modalDoneText}>Done</Text>
						</TouchableOpacity>
					</View>

					<ScrollView style={styles.modalScrollView}>
						<View style={styles.modalTagsGrid}>
							{AVAILABLE_TAGS.map((tag) => {
								const colors = getTagColor(tag);
								const isSelected = selectedTags.includes(tag);
								return (
									<TouchableOpacity
										key={tag}
										onPress={() => addTag(tag)}
										style={[
											styles.modalTag,
											{
												backgroundColor: isSelected ? colors.bg : '#F5F5F5',
												width: (width - 60) / 2
											}
										]}
									>
										<Text style={[
											styles.modalTagText,
											{ color: isSelected ? colors.text : '#666' }
										]}>
											{tag}
										</Text>
									</TouchableOpacity>
								);
							})}
						</View>
					</ScrollView>
				</SafeAreaView>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: BLUE_BG,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: BLUE_BG,
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#333',
		marginLeft: 20,
	},
	keyboardContainer: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 20,
	},
	card: {
		backgroundColor: WHITE,
		marginHorizontal: 20,
		marginTop: 20,
		borderRadius: 16,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	tagCard: {
		marginTop: 16,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 16,
	},
	promptsContainer: {
		marginBottom: 20,
	},
	promptText: {
		fontSize: 14,
		color: '#666',
		marginBottom: 8,
		lineHeight: 20,
	},
	journalInput: {
		minHeight: 200,
		fontSize: 16,
		color: '#333',
		textAlignVertical: 'top',
		lineHeight: 24,
		borderWidth: 1,
		borderColor: '#E0E0E0',
		borderRadius: 8,
		padding: 12,
		backgroundColor: '#FAFAFA',
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
	},
	selectedTag: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
		marginRight: 8,
		marginBottom: 8,
		flexDirection: 'row',
		alignItems: 'center',
	},
	selectedTagText: {
		fontSize: 14,
		fontWeight: '500',
		marginRight: 6,
	},
	addTagButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: '#F0F0F0',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 8,
	},
	submitButton: {
		backgroundColor: '#4A90E2',
		marginHorizontal: 20,
		marginTop: 20,
		paddingVertical: 16,
		marginBottom: 100,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	submitButtonText: {
		color: WHITE,
		fontSize: 18,
		fontWeight: '600',
	},
	modalContainer: {
		flex: 1,
		backgroundColor: WHITE,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
	},
	modalCancelText: {
		fontSize: 16,
		color: '#4A90E2',
		fontWeight: '500',
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
	},
	modalDoneText: {
		fontSize: 16,
		color: '#4A90E2',
		fontWeight: '600',
	},
	modalScrollView: {
		flex: 1,
		padding: 20,
	},
	modalTagsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
	},
	modalTag: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 20,
		marginBottom: 12,
		alignItems: 'center',
	},
	modalTagText: {
		fontSize: 14,
		fontWeight: '500',
	},
});