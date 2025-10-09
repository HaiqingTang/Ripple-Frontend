import React, {useState, useEffect, useRef, useMemo} from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Image as RNImage,
	Dimensions,
	KeyboardAvoidingView,
	Platform,
	Alert,
	InteractionManager,
	StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {Image} from 'expo-image';
import JournalIcon from '@/assets/images/journaling.png';
import {useAppContext} from '@/context/AppContext';
import {addDoc, collection} from "@firebase/firestore";
import {db} from "@/lib/firebase";

const {width} = Dimensions.get('window');
const BLUE_BG = '#DDE7FF';
const WHITE = '#FFFFFF';
const BLUE = '#4A90E2';

export default function PersonalLog() {
	const router = useRouter();
	const params = useLocalSearchParams<{ journal?: string; tags?: string; image?: string }>();
	const scrollViewRef = useRef<ScrollView>(null);
	const journalingCardRef = useRef<View>(null);
	const [journalingCardY, setJournalingCardY] = useState(0);
	const [dayRating, setDayRating] = useState(5);
	const [moodRating, setMoodRating] = useState(6);
	const [selectedEmoji, setSelectedEmoji] = useState(2);
	const [sleepDuration, setSleepDuration] = useState(7);
	const [sleepQuality, setSleepQuality] = useState(8);
	const [journalText, setJournalText] = useState('');
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [journalImage, setJournalImage] = useState<string | null>(null);
	const {userId, fullName, dayOfWeek, formattedDate} = useAppContext();

	const emojis = ['😢', '😠', '😐', '😊', '😄'];
	const emojiLabels = ['sad', 'Angry', 'Neutral', 'Happy', 'Very happy'];

	useEffect(() => {
		let shouldScrollToJournal = false;

		if (params.journal) {
			setJournalText(String(params.journal));
			shouldScrollToJournal = true;
		}
		if (params.tags) {
			try {
				const parsed = JSON.parse(String(params.tags));
				if (Array.isArray(parsed)) setSelectedTags(parsed as string[]);
				shouldScrollToJournal = true;
			} catch {
			}
		}
		if (params.image) {
			setJournalImage(String(params.image));
			shouldScrollToJournal = true;
		}

		// Scroll to journaling section when returning from journal page
		if (shouldScrollToJournal && journalingCardY > 0) {
			InteractionManager.runAfterInteractions(() => {
				scrollViewRef.current?.scrollTo({
					y: journalingCardY - 50, // Slight offset for better positioning
					animated: true
				});
			});
		}
	}, [params.journal, params.tags, params.image, journalingCardY]);


	const handleSave = async () => {
		// Extract base64 data from data URI if image exists
		let imageBase64 = null;
		if (journalImage) {
			// Remove the data URI prefix (e.g., "data:image/jpeg;base64,")
			const base64Match = journalImage.match(/^data:image\/[a-z]+;base64,(.+)$/);
			if (base64Match && base64Match[1]) {
				imageBase64 = base64Match[1];
			}
		}

		const logData = {
			date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
			weekday: dayOfWeek,
			dayRating,
			moodRating,
			selectedEmoji: selectedEmoji + 1, // Save as 1-5 integer instead of emoji character
			journalText,
			tags: selectedTags,
			sleepDuration,
			sleepQuality,
			timestamp: new Date().toISOString(),
			imageBase64: imageBase64, // Store only the base64 string
		};

		try {
			await addDoc(collection(db, 'personalLogs'), {
				userId,
				...logData,
			});
		} catch (error) {
			console.error(error); // TODO: debug purposes, remove from prod
			Alert.alert('Error', 'Failed to save your log. Please try again.');
			return;
		}

		// Redirect to success page
		router.push('/journal/success');


	};

	const handleViewPreviousEntries = () => {
		// TODO: Navigate to previous entries screen
		console.log('Viewing previous entries...');
		router.push('/journal/entries')
	};

	const openJournal = () => {
		const params: any = {
			journal: journalText,
			tags: JSON.stringify(selectedTags),
		};
		if (journalImage) {
			params.image = journalImage;
		}
		router.push({
			pathname: '/journal',
			params,
		});
	};

	const handleJournalingCardLayout = (event: { nativeEvent: { layout: { y: number } } }) => {
		const {y} = event.nativeEvent.layout;
		setJournalingCardY(y);
	};

	const Card = ({children, style = {}}: { children: React.ReactNode; style?: any }) => (
		<View style={[styles.card, style]}>
			{children}
		</View>
	);

	const HeaderSection = useMemo(() => (
		<Card>
			<View style={styles.headerRow}>
				<View style={styles.headerTextContainer}>
					<Text style={styles.welcomeText}>
						Welcome {fullName}!
					</Text>
					<Text style={styles.dayText}>
						It&apos;s {dayOfWeek}!
					</Text>
					<Text style={styles.dateText}>
						{formattedDate}
					</Text>
					<Text style={styles.encouragementText}>
						You&apos;ve been doing an awesome job with logging! Awesome work!
					</Text>
				</View>
				<RNImage
					source={JournalIcon}
					style={styles.journalIcon}
					accessible={true}
					accessibilityLabel="Journal illustration"
					accessibilityRole="image"
				/>
			</View>
			<TouchableOpacity
				style={styles.viewEntriesButton}
				onPress={handleViewPreviousEntries}
				accessible={true}
				accessibilityLabel="View previous entries"
				accessibilityHint="Navigate to your previous journal entries"
				accessibilityRole="button"
			>
				<Ionicons name="folder-outline" size={16} color="#333"/>
				<Text style={styles.viewEntriesText}>
					View Previous Entries
				</Text>
			</TouchableOpacity>
		</Card>), [fullName, dayOfWeek, formattedDate]);

	const Slider = ({value, onValueChange, min = 1, max = 10, step = 1, labels = null, accessibilityLabel = 'Slider'}: {
		value: number;
		onValueChange: (value: number) => void;
		min?: number;
		max?: number;
		step?: number;
		labels?: string[] | null;
		accessibilityLabel?: string;
	}) => {
		const handlePress = (event: any) => {
			const {locationX} = event.nativeEvent;
			const sliderWidth = width - 64; // Account for margins
			const percentage = locationX / sliderWidth;
			const newValue = Math.round(min + (percentage * (max - min)));
			const clampedValue = Math.max(min, Math.min(max, newValue));
			onValueChange(clampedValue);
		};

		const handleAccessibilityAction = (event: any) => {
			switch (event.nativeEvent.actionName) {
				case 'increment':
					const incrementedValue = Math.min(value + step, max);
					onValueChange(incrementedValue);
					break;
				case 'decrement':
					const decrementedValue = Math.max(value - step, min);
					onValueChange(decrementedValue);
					break;
			}
		};

		return (
			<View style={styles.sliderContainer}>
				<TouchableOpacity
					style={styles.sliderTrack}
					onPress={handlePress}
					activeOpacity={1}
					accessible={true}
					accessibilityLabel={`${accessibilityLabel}: ${value} out of ${max}`}
					accessibilityHint={`Tap to adjust value between ${min} and ${max}. Use increment and decrement actions to adjust by keyboard.`}
					accessibilityRole="adjustable"
					accessibilityValue={{
						min: min,
						max: max,
						now: value,
						text: `${value} out of ${max}`
					}}
					accessibilityActions={[
						{name: 'increment', label: 'Increase value'},
						{name: 'decrement', label: 'Decrease value'}
					]}
					onAccessibilityAction={handleAccessibilityAction}
				>
					<View style={[
						styles.sliderFill,
						{width: `${((value - min) / (max - min)) * 100}%`}
					]}/>
					<View style={[
						styles.sliderThumb,
						{left: `${((value - min) / (max - min)) * 100}%`}
					]}/>
				</TouchableOpacity>
				<View style={styles.sliderLabels}>
					{labels ? labels.map((label, index) => (
						<Text key={index} style={styles.sliderLabel}>{label}</Text>
					)) : (
						<>
							<Text style={styles.sliderLabel}>{min}</Text>
							<Text style={styles.sliderLabel}>{max}</Text>
						</>
					)}
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				style={styles.keyboardAvoidingView}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
			>
				<ScrollView
					ref={scrollViewRef}
					style={styles.scrollView}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
					contentContainerStyle={styles.scrollViewContent}
					accessible={true}
					accessibilityLabel="Personal log form"
					accessibilityHint="Scroll to navigate through different sections of your daily log"
				>
					{/* Header Section */}
					{HeaderSection}

					{/* Day Rating Section */}
					<Card>
						<View style={styles.ratingRow}>
							<Text
								style={styles.ratingText}
								accessible={true}
								accessibilityRole="header"
							>
								How would you rate your day overall?
							</Text>
							<View
								style={styles.ratingCircle}
								accessible={true}
								accessibilityLabel={`Day rating: ${dayRating} out of 10`}
								accessibilityRole="text"
							>
								<Text
									style={styles.ratingNumber}
									accessible={false}
								>
									{dayRating}
								</Text>
							</View>
						</View>
						<Slider
							value={dayRating}
							onValueChange={setDayRating}
							min={1}
							max={10}
							accessibilityLabel="Day rating"
						/>
					</Card>

					{/* Mood Section */}
					<Card>
						<Text
							style={styles.moodText}
							accessible={true}
							accessibilityRole="header"
						>
							How are you feeling?
						</Text>
						<Slider
							value={moodRating}
							onValueChange={setMoodRating}
							min={1}
							max={10}
							accessibilityLabel="Mood rating"
						/>
					</Card>

					{/* Emotion Section */}
					<Card>
						<Text
							style={styles.emotionText}
							accessible={true}
							accessibilityRole="header"
						>
							What are you feeling?
						</Text>
						<View
							style={styles.emojiRow}
							accessible={true}
							accessibilityLabel="Emotion selection"
						>
							{emojis.map((emoji, index) => (
								<TouchableOpacity
									key={index}
									onPress={() => setSelectedEmoji(index)}
									style={[
										styles.emojiButton,
										selectedEmoji === index ? styles.emojiSelected : styles.emojiUnselected
									]}
									accessible={true}
									accessibilityLabel={`${emojiLabels[index]} emotion`}
									accessibilityHint={`Select ${emojiLabels[index]} as your current emotion`}
									accessibilityRole="button"
									accessibilityState={{selected: selectedEmoji === index}}
								>
									<Text
										style={styles.emojiText}
										accessible={false}
									>
										{emoji}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</Card>

					{/* Journaling Section */}
					<View ref={journalingCardRef} onLayout={handleJournalingCardLayout}>
						<Card>
							<Text
								style={styles.journalTitle}
								accessible={true}
								accessibilityRole="header"
							>
								Want to journal?
							</Text>
							<Text style={styles.journalSubtitle}>
								How was your day? What are you grateful for? Any challenges you faced?
							</Text>
							<TouchableOpacity
								style={styles.journalTextArea}
								onPress={openJournal}
								accessible={true}
								accessibilityLabel={journalText ? `Journal entry: ${journalText.substring(0, 100)}${journalText.length > 100 ? '...' : ''}` : "Journal entry area"}
								accessibilityHint="Tap to open journal editor to write your thoughts"
								accessibilityRole="button"
							>
								{journalText ? (
									<Text
										style={styles.journalText}
										accessible={false}
									>
										{journalText}
									</Text>
								) : (
									<Text
										style={styles.journalPlaceholder}
										accessible={false}
									>
										Write your thoughts here...
									</Text>
								)}
							</TouchableOpacity>

							{selectedTags.length > 0 && (
								<View
									style={styles.tagsContainer}
									accessible={true}
									accessibilityLabel={`Selected tags: ${selectedTags.join(', ')}`}
								>
									{selectedTags.map((tag, idx) => (
										<View
											key={`${tag}-${idx}`}
											style={styles.tag}
											accessible={true}
											accessibilityLabel={`Tag: ${tag}`}
											accessibilityRole="text"
										>
											<Text
												style={styles.tagText}
												accessible={false}
											>
												{tag}
											</Text>
										</View>
									))}
								</View>
							)}

							{journalImage && (
								<View
									style={styles.journalImageContainer}
									accessible={true}
									accessibilityLabel="Attached journal image"
								>
									<Image
										source={{ uri: journalImage }}
										style={styles.journalImage}
										contentFit="cover"
										transition={200}
									/>
								</View>
							)}
						</Card>
					</View>

					{/* Sleep Section */}
					<Card>
						<Text
							style={styles.sleepTitle}
							accessible={true}
							accessibilityRole="header"
						>
							What about your sleep?
						</Text>

						<View style={styles.sleepSection}>
							<View style={styles.sleepRow}>
								<Text style={styles.sleepLabel}>Duration?</Text>
								<Text
									style={styles.sleepValue}
									accessible={true}
									accessibilityLabel={`Sleep duration: ${sleepDuration} hours`}
								>
									{sleepDuration}h
								</Text>
							</View>
							<Slider
								value={sleepDuration}
								onValueChange={setSleepDuration}
								min={1}
								max={12}
								labels={['1h', '12h']}
								accessibilityLabel="Sleep duration in hours"
							/>
						</View>

						<View style={styles.sleepQualitySection}>
							<View style={styles.sleepRow}>
								<Text style={styles.sleepLabel}>Quality?</Text>
								<Text
									style={styles.sleepValue}
									accessible={true}
									accessibilityLabel={`Sleep quality: ${sleepQuality} out of 10`}
								>
									{sleepQuality}/10
								</Text>
							</View>
							<Slider
								value={sleepQuality}
								onValueChange={setSleepQuality}
								min={1}
								max={10}
								accessibilityLabel="Sleep quality rating"
							/>
						</View>
					</Card>

					{/* Save Button */}
					<TouchableOpacity
						style={styles.saveButton}
						onPress={handleSave}
						accessible={true}
						accessibilityLabel="Save today's log"
						accessibilityHint="Save all your daily log entries including ratings, mood, journal, and sleep data"
						accessibilityRole="button"
					>
						<Text style={styles.saveButtonText}>
							Save Today&apos;s Log
						</Text>
					</TouchableOpacity>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: BLUE_BG,
	},
	keyboardAvoidingView: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollViewContent: {
		paddingBottom: 20,
	},
	card: {
		backgroundColor: WHITE,
		borderRadius: 16,
		padding: 20,
		marginHorizontal: 16,
		marginVertical: 8,
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 2},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	headerTextContainer: {
		flex: 1,
	},
	welcomeText: {
		fontSize: 28,
		fontWeight: '700',
		color: '#333',
	},
	dayText: {
		fontSize: 16,
		color: '#666',
		marginTop: 4,
	},
	dateText: {
		fontSize: 14,
		color: '#666',
	},
	encouragementText: {
		fontSize: 14,
		color: '#666',
		marginTop: 8,
	},
	journalIcon: {
		width: 145,
		height: 145,
		marginLeft: -10,
	},
	viewEntriesButton: {
		backgroundColor: BLUE_BG,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 16,
	},
	viewEntriesText: {
		marginLeft: 8,
		color: '#333',
		fontWeight: '500',
	},
	ratingRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	ratingText: {
		fontSize: 15,
		fontWeight: '600',
		color: '#333',
	},
	ratingCircle: {
		width: 50,
		height: 50,
		backgroundColor: BLUE,
		borderRadius: 25,
		alignItems: 'center',
		justifyContent: 'center',
	},
	ratingNumber: {
		color: WHITE,
		fontSize: 25,
		fontWeight: '700',
	},
	moodText: {
		fontSize: 15,
		fontWeight: '600',
		color: '#333',
	},
	emotionText: {
		fontSize: 16,
		fontWeight: '500',
		color: '#333',
		marginTop: 16,
	},
	emojiRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 12,
	},
	emojiButton: {
		width: 50,
		height: 50,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	emojiSelected: {
		backgroundColor: BLUE,
	},
	emojiUnselected: {
		backgroundColor: '#F0F0F0',
	},
	emojiText: {
		fontSize: 24,
	},
	journalTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
	},
	journalSubtitle: {
		fontSize: 14,
		color: '#666',
		marginTop: 8,
	},
	journalTextArea: {
		backgroundColor: '#F8F8F8',
		borderRadius: 8,
		padding: 16,
		marginTop: 12,
		minHeight: 120,
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
	},
	journalText: {
		fontSize: 16,
		color: '#333',
		lineHeight: 22,
	},
	journalPlaceholder: {
		fontSize: 16,
		color: '#999',
	},
	tagsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginTop: 10,
	},
	tag: {
		backgroundColor: '#EAF2FF',
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 14,
		marginRight: 8,
		marginTop: 6,
	},
	tagText: {
		color: '#1E63E9',
		fontWeight: '600',
	},
	sleepTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
	},
	sleepSection: {
		marginTop: 16,
	},
	sleepRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	sleepLabel: {
		fontSize: 16,
		color: '#333',
	},
	sleepValue: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
	},
	sleepQualitySection: {
		marginTop: 20,
	},
	saveButton: {
		backgroundColor: BLUE,
		marginHorizontal: 16,
		marginTop: 20,
		marginBottom: 100,
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
	},
	saveButtonText: {
		color: WHITE,
		fontSize: 18,
		fontWeight: '600',
	},
	sliderContainer: {
		marginTop: 12,
	},
	sliderTrack: {
		height: 6,
		backgroundColor: '#E0E0E0',
		borderRadius: 3,
		position: 'relative',
	},
	sliderFill: {
		height: 6,
		backgroundColor: BLUE,
		borderRadius: 3,
	},
	sliderThumb: {
		position: 'absolute',
		top: -8,
		width: 20,
		height: 20,
		backgroundColor: BLUE,
		borderRadius: 10,
		marginLeft: -10,
	},
	sliderLabels: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 8,
	},
	sliderLabel: {
		fontSize: 12,
		color: '#666',
	},
	journalImageContainer: {
		marginTop: 16,
		borderRadius: 12,
		overflow: 'hidden',
	},
	journalImage: {
		width: '100%',
		height: 200,
		borderRadius: 12,
	},
});