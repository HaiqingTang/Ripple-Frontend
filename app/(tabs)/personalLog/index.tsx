import React, { useState, useEffect, useRef } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Image,
	Dimensions,
	KeyboardAvoidingView,
	Platform, 
	Alert,
	InteractionManager,
	StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import JournalIcon from '@/assets/images/journaling.png';
import { useAppContext } from '@/context/AppContext';
import {addDoc, collection} from "@firebase/firestore";
import {db} from "@/lib/firebase";

const { width } = Dimensions.get('window');
const BLUE_BG = '#DDE7FF';
const WHITE = '#FFFFFF';
const BLUE = '#4A90E2';

export default function PersonalLog() {
  const router = useRouter();
  const params = useLocalSearchParams<{ journal?: string; tags?: string }>();
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
  const {userId, fullName, dayOfWeek, formattedDate } = useAppContext();

  const emojis = ['😢', '😠', '😐', '😊', '😄'];


  //TODO: fix the scrolling to the journal section when returning from the journal page
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
      } catch {}
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
  }, [params.journal, params.tags, journalingCardY]);

 

  const handleSave = async () => {
	  const logData = {
		  date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
		  dayRating,
		  moodRating,
		  selectedEmoji: selectedEmoji + 1, // Save as 1-5 integer instead of emoji character
		  journalText,
		  tags: selectedTags,
		  sleepDuration,
		  sleepQuality,
		  timestamp: new Date().toISOString()
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
    
    // Optional: Reset form after saving
    // setDayRating(5);
    // setMoodRating(6);
    // setSelectedEmoji(2);
    // setJournalText('');
    // setSleepDuration(7);
    // setSleepQuality(8);
  };

  const handleViewPreviousEntries = () => {
    // TODO: Navigate to previous entries screen
    console.log('Viewing previous entries...');
  };

  const openJournal = () => {
    router.push({
      pathname: '/journal',
      params: {
        journal: journalText,
        tags: JSON.stringify(selectedTags),
      },
    });
  };

  const handleJournalingCardLayout = (event: { nativeEvent: { layout: { y: number } } }) => {
    const { y } = event.nativeEvent.layout;
    setJournalingCardY(y);
  };

  const Card = ({ children, style = {} }: { children: React.ReactNode; style?: any }) => (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );

  const Slider = ({ value, onValueChange, min = 1, max = 10, step = 1, labels = null }: { value: number; onValueChange: (value: number) => void; min?: number; max?: number; step?: number; labels?: string[] | null }) => {
    const handlePress = (event: any) => {
      const { locationX } = event.nativeEvent;
      const sliderWidth = width - 64; // Account for margins
      const percentage = locationX / sliderWidth;
      const newValue = Math.round(min + (percentage * (max - min)));
      const clampedValue = Math.max(min, Math.min(max, newValue));
      onValueChange(clampedValue);
    };

    return (
      <View style={styles.sliderContainer}>
        <TouchableOpacity 
          style={styles.sliderTrack}
          onPress={handlePress}
          activeOpacity={1}
        >
          <View style={[
            styles.sliderFill,
            { width: `${((value - min) / (max - min)) * 100}%` }
          ]} />
          <View style={[
            styles.sliderThumb,
            { left: `${((value - min) / (max - min)) * 100}%` }
          ]} />
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
        >
                {/* Header Section */}
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
            <Image source={JournalIcon} style={styles.journalIcon} />
          </View>
          <TouchableOpacity 
            style={styles.viewEntriesButton}
            onPress={handleViewPreviousEntries}
          >
            <Ionicons name="folder-outline" size={16} color="#333" />
            <Text style={styles.viewEntriesText}>
              View Previous Entries
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Day Rating Section */}
        <Card>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>
              How would you rate your day overall?
            </Text>
            <View style={styles.ratingCircle}>
              <Text style={styles.ratingNumber}>
                {dayRating}
              </Text>
            </View>
          </View>
          <Slider 
            value={dayRating} 
            onValueChange={setDayRating}
            min={1}
            max={10}
          />
        </Card>

        {/* Mood Section */}
        <Card>
          <Text style={styles.moodText}>
            How are you feeling?
          </Text>
          <Slider 
            value={moodRating} 
            onValueChange={setMoodRating}
            min={1}
            max={10}
          />
        </Card>

        {/* Emotion Section */}
        <Card>
        <Text style={styles.emotionText}>
            What are you feeling?
          </Text>
          <View style={styles.emojiRow}>
            {emojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedEmoji(index)}
                style={[
                  styles.emojiButton,
                  selectedEmoji === index ? styles.emojiSelected : styles.emojiUnselected
                ]}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Journaling Section */}
        <View ref={journalingCardRef} onLayout={handleJournalingCardLayout}>
          <Card>
            <Text style={styles.journalTitle}>Want to journal?</Text>
          <Text style={styles.journalSubtitle}>
            How was your day? What are you grateful for? Any challenges you faced?
          </Text>
          <TouchableOpacity
            style={styles.journalTextArea}
            onPress={openJournal}
          >
              {journalText ? (
                <Text style={styles.journalText}>{journalText}</Text>
              ) : (
                <Text style={styles.journalPlaceholder}>Write your thoughts here...</Text>
              )}
          </TouchableOpacity>

          {selectedTags.length > 0 && (
            <View style={styles.tagsContainer}>
              {selectedTags.map((tag, idx) => (
                <View key={`${tag}-${idx}`} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          </Card>
        </View>

        {/* Sleep Section */}
        <Card>
          <Text style={styles.sleepTitle}>
            What about your sleep?
          </Text>
          
          <View style={styles.sleepSection}>
            <View style={styles.sleepRow}>
              <Text style={styles.sleepLabel}>Duration?</Text>
              <Text style={styles.sleepValue}>
                {sleepDuration}h
              </Text>
            </View>
            <Slider 
              value={sleepDuration} 
              onValueChange={setSleepDuration}
              min={1}
              max={12}
              labels={['1h', '12h']}
            />
          </View>

          <View style={styles.sleepQualitySection}>
            <View style={styles.sleepRow}>
              <Text style={styles.sleepLabel}>Quality?</Text>
              <Text style={styles.sleepValue}>
                {sleepQuality}/10
              </Text>
            </View>
            <Slider 
              value={sleepQuality} 
              onValueChange={setSleepQuality}
              min={1}
              max={10}
            />
          </View>
        </Card>

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
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
    shadowOffset: { width: 0, height: 2 },
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
});