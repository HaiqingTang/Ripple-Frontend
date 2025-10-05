import React, { useState, useEffect, useMemo } from 'react';
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

	// Initialize from params on mount
	useEffect(() => {
		if (params.journal) {
			setJournalText(params.journal as string);
		}
		if (params.tags) {
			try {
				const parsedTags = JSON.parse(params.tags as string);
				if (Array.isArray(parsedTags)) {
					setSelectedTags(parsedTags);
				}
			} catch (error) {
				console.warn('Error parsing tags from params:', error);
			}
		}
	}, []); // Run once on mount

	// Memoize tag colors to avoid recalculating on every render
	const tagColors = useMemo(() => {
		return selectedTags.reduce((acc, tag) => {
			acc[tag] = getTagColor(tag);
			return acc;
		}, {} as Record<string, { bg: string; text: string }>);
	}, [selectedTags]);

	// Toggle tag selection - add if not present, remove if present
	const toggleTag = (tag: string) => {
		setSelectedTags(prev =>
			prev.includes(tag)
				? prev.filter(t => t !== tag)
				: [...prev, tag]
		);
	};

	const removeTag = (tagToRemove: string) => {
		setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
	};

	const handleAddToLog = () => {
		if (!journalText.trim()) {
			return; // Button will be disabled anyway
		}
		const tagsString = JSON.stringify(selectedTags);
		router.push(`/(tabs)/personalLog?journal=${encodeURIComponent(journalText.trim())}&tags=${encodeURIComponent(tagsString)}`);
	};

	const isSubmitDisabled = !journalText.trim();

	const addTag = (tag: string) => {
		if (!selectedTags.includes(tag)) {
			setSelectedTags([...selectedTags, tag]);
		}
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
				keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
			>
				<ScrollView
					style={styles.scrollView}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
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
							maxLength={5000}
							accessibilityLabel="Journal text input"
							accessibilityHint="Enter your journal thoughts and reflections"
						/>
					</View>


					{/* Topic Tagging Card */}
					<View style={[styles.card, styles.tagCard]}>
						<Text style={styles.cardTitle}>Tag a topic</Text>

						<View style={styles.tagsContainer}>
							{selectedTags.map((tag) => {
								const colors = tagColors[tag];
								return (
									<View key={tag} style={[styles.selectedTag, { backgroundColor: colors.bg }]}>
										<Text style={[styles.selectedTagText, { color: colors.text }]}>{tag}</Text>
										<TouchableOpacity
											onPress={() => removeTag(tag)}
											accessibilityLabel={`Remove ${tag} tag`}
											accessibilityRole="button"
										>
											<Ionicons name="close" size={16} color={colors.text} />
										</TouchableOpacity>
									</View>
								);
							})}

							<TouchableOpacity
								onPress={() => setIsTagModalVisible(true)}
								style={styles.addTagButton}
								accessibilityLabel="Add more tags"
								accessibilityRole="button"
								accessibilityHint="Opens tag selection modal"
							>
								<Ionicons name="chevron-down" size={16} color="#666" />
							</TouchableOpacity>
						</View>
					</View>

					{/* Add to Log Button */}
					<TouchableOpacity
						style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]}
						onPress={handleAddToLog}
						disabled={isSubmitDisabled}
						accessibilityLabel="Add journal entry to personal log"
						accessibilityRole="button"
						accessibilityState={{ disabled: isSubmitDisabled }}
						accessibilityHint={isSubmitDisabled ? "Enter some text first" : "Saves your journal entry"}
					>
						<Text style={[styles.submitButtonText, isSubmitDisabled && styles.submitButtonTextDisabled]}>
							Add to Personal Log
						</Text>
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
						<TouchableOpacity
							onPress={() => setIsTagModalVisible(false)}
							accessibilityLabel="Cancel tag selection"
							accessibilityRole="button"
						>
							<Text style={styles.modalCancelText}>Cancel</Text>
						</TouchableOpacity>
						<Text style={styles.modalTitle}>Select Topics</Text>
						<TouchableOpacity
							onPress={() => setIsTagModalVisible(false)}
							accessibilityLabel="Done selecting tags"
							accessibilityRole="button"
						>
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
										onPress={() => toggleTag(tag)}
										style={[
											styles.modalTag,
											{
												backgroundColor: isSelected ? colors.bg : '#F5F5F5',
												width: (width - 60) / 2
											}
										]}
										accessibilityLabel={`${isSelected ? 'Remove' : 'Add'} ${tag} tag`}
										accessibilityRole="button"
										accessibilityState={{ selected: isSelected }}
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
	submitButtonDisabled: {
		backgroundColor: '#CCCCCC',
	},
	submitButtonText: {
		color: WHITE,
		fontSize: 18,
		fontWeight: '600',
	},
	submitButtonTextDisabled: {
		color: '#888888',
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