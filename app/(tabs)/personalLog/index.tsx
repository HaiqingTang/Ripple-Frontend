import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  const [dayRating, setDayRating] = useState(5);
  const [moodRating, setMoodRating] = useState(6);
  const [selectedEmoji, setSelectedEmoji] = useState(2);
  const [sleepDuration, setSleepDuration] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(8);
  const [journalText, setJournalText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const {userId, fullName, dayOfWeek, formattedDate } = useAppContext();

  const emojis = ['😢', '😕', '😐', '😊', '😄'];

  // fullName now comes from AppContext

  // Pull incoming journal and tags from journal screen
  useEffect(() => {
    if (params.journal) {
      setJournalText(String(params.journal));
    }
    if (params.tags) {
      try {
        const parsed = JSON.parse(String(params.tags));
        if (Array.isArray(parsed)) setSelectedTags(parsed as string[]);
      } catch {}
    }
  }, [params.journal, params.tags]);

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
		  const docRef = await addDoc(collection(db, 'personalLogs'), {
			  userId,
			  ...logData,
		  })
	  } catch (error) {
			console.error(error);
			// TODO: Handle error
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

  const Card = ({ children, style = {} }: { children: React.ReactNode; style?: any }) => (
    <View style={{
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
      ...style
    }}>
      {children}
    </View>
  );

  const Slider = ({ value, onValueChange, min = 1, max = 10, step = 1, labels = null }: { value: number; onValueChange: (value: number) => void; min?: number; max?: number; step?: number; labels?: string[] | null }) => {
    const handlePress = (event) => {
      const { locationX } = event.nativeEvent;
      const sliderWidth = width - 64; // Account for margins
      const percentage = locationX / sliderWidth;
      const newValue = Math.round(min + (percentage * (max - min)));
      const clampedValue = Math.max(min, Math.min(max, newValue));
      onValueChange(clampedValue);
    };

    return (
      <View style={{ marginTop: 12 }}>
        <TouchableOpacity 
          style={{ 
            height: 6, 
            backgroundColor: '#E0E0E0', 
            borderRadius: 3,
            position: 'relative'
          }}
          onPress={handlePress}
          activeOpacity={1}
        >
          <View style={{
            height: 6,
            backgroundColor: BLUE,
            borderRadius: 3,
            width: `${((value - min) / (max - min)) * 100}%`
          }} />
          <View style={{
            position: 'absolute',
            top: -8,
            left: `${((value - min) / (max - min)) * 100}%`,
            width: 20,
            height: 20,
            backgroundColor: BLUE,
            borderRadius: 10,
            marginLeft: -10
          }} />
        </TouchableOpacity>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          marginTop: 8 
        }}>
          {labels ? labels.map((label, index) => (
            <Text key={index} style={{ fontSize: 12, color: '#666' }}>{label}</Text>
          )) : (
            <>
              <Text style={{ fontSize: 12, color: '#666' }}>{min}</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>{max}</Text>
            </>
          )}
        </View>
      </View>
    );
  };

  // const ProgressBar = ({ progress, max = 10 }) => (
  //   <View style={{ 
  //     height: 8, 
  //     backgroundColor: '#E0E0E0', 
  //     borderRadius: 4,
  //     marginTop: 4
  //   }}>
  //     <View style={{
  //       height: 8,
  //       backgroundColor: BLUE,
  //       borderRadius: 4,
  //       width: `${(progress / max) * 100}%`
  //     }} />
  //   </View>
  // );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BLUE_BG }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={{ flex: 1 }} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 20 }}
        >
        {/* Header Section */}
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: '#333' }}>
                Good Morning {fullName}!
              </Text>
              <Text style={{ fontSize: 16, color: '#666', marginTop: 4 }}>
                It's {dayOfWeek}!
              </Text>
              <Text style={{ fontSize: 14, color: '#666' }}>
                {formattedDate}
              </Text>
              <Text style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
                You&apos;ve been doing an awesome job with logging! Awesome work!
              </Text>
            </View>
            <View style={{
              width: 60,
              height: 60,
              backgroundColor: BLUE_BG,
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons name="trending-up" size={24} color="#FF4444" />
            </View>
          </View>
          <TouchableOpacity 
            style={{
              backgroundColor: BLUE_BG,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 16
            }}
            onPress={handleViewPreviousEntries}
          >
            <Ionicons name="folder-outline" size={16} color="#333" />
            <Text style={{ marginLeft: 8, color: '#333', fontWeight: '500' }}>
              View Previous Entries
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Day Rating Section */}
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#333' }}>
              How would you rate your day overall?
            </Text>
            <View style={{
              width: 50,
              height: 50,
              backgroundColor: BLUE,
              borderRadius: 25,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Text style={{ color: WHITE, fontSize: 25, fontWeight: '700' }}>
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
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#333' }}>
            How are you feeling?
          </Text>
          <Slider 
            value={moodRating} 
            onValueChange={setMoodRating}
            min={1}
            max={10}
          />
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#333', marginTop: 16 }}>
            What are you feeling?
          </Text>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            marginTop: 12 
          }}>
            {emojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedEmoji(index)}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: selectedEmoji === index ? BLUE : '#F0F0F0',
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text style={{ fontSize: 24 }}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Journaling Section */}
        <Card>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#333' }}>Want to journal?</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
            How was your day? What are you grateful for? Any challenges you faced?
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#F8F8F8',
              borderRadius: 8,
              padding: 16,
              marginTop: 12,
              minHeight: 120,
              justifyContent: 'flex-start',
              alignItems: 'flex-start'
            }}
            onPress={openJournal}
          >
              {journalText ? (
                <Text style={{ fontSize: 16, color: '#333', lineHeight: 22 }}>{journalText}</Text>
              ) : (
                <Text style={{ fontSize: 16, color: '#999' }}>Write your thoughts here...</Text>
              )}
          </TouchableOpacity>

          {selectedTags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
              {selectedTags.map((tag, idx) => (
                <View key={`${tag}-${idx}`} style={{
                  backgroundColor: '#EAF2FF',
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 14,
                  marginRight: 8,
                  marginTop: 6,
                }}>
                  <Text style={{ color: '#1E63E9', fontWeight: '600' }}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Sleep Section */}
        <Card>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#333' }}>
            What about your sleep?
          </Text>
          
          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: '#333' }}>Duration?</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
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

          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: '#333' }}>Quality?</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>
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

        {/* Weekly Progress Section */}
        {/* <Card>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#333' }}>
            This Week's Progress
          </Text>
          
          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#333' }}>Daily Check-ins</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>5/7 days</Text>
            </View>
            <ProgressBar progress={5} max={7} />
          </View>

          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#333' }}>Average Mood</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>7.2/10</Text>
            </View>
            <ProgressBar progress={7.2} max={10} />
          </View>

          <View style={{ marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#333' }}>Sleep Quality</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>8.1/10</Text>
            </View>
            <ProgressBar progress={8.1} max={10} />
          </View>
        </Card> */}

        {/* Save Button */}
        <TouchableOpacity 
          style={{
            backgroundColor: BLUE,
            marginHorizontal: 16,
            marginTop: 20,
            marginBottom: 100, // Extra padding to account for tab bar
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onPress={handleSave}
        >
          <Text style={{ 
            color: WHITE, 
            fontSize: 18, 
            fontWeight: '600' 
          }}>
            Save Today&apos;s Log
          </Text>
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}