import React, { useState,useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');
const BLUE_BG = '#DDE7FF';
const WHITE = '#FFFFFF';

export default function JournalPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ journal?: string; tags?: string }>();
  const [journalText, setJournalText] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Hiking', 'Meditation', 'Nutrition']);
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);

  useEffect(() => {
    if (params.journal) setJournalText(String(params.journal));
    if (params.tags) {
      try {
        const parsed = JSON.parse(String(params.tags));
        if (Array.isArray(parsed)) setSelectedTags(parsed as string[]);
      } catch {}
    }
  }, [params.journal, params.tags]);
  // TODO: Replace this with actual backend call
  const availableTags = [
    'Hiking', 'Meditation', 'Nutrition', 'Work', 'Family', 'Friends', 
    'Exercise', 'Reading', 'Music', 'Art', 'Travel', 'Cooking',
    'Learning', 'Health', 'Mindfulness', 'Gratitude', 'Goals', 'Challenges'
  ];

  const handleAddToLog = () => {
    router.push({
      pathname: '/(tabs)/personalLog',
      params: {
        journal: journalText,
        tags: JSON.stringify(selectedTags),
      },
    });
  };
  

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setIsTagModalVisible(false);
  };

  const getTagColor = (tag: string) => {
    // Round-robin pick from 6 preset color pairs, stable by tag
    const palette = [
      { bg: '#FFF3CD', text: '#8A6D3B' }, // warm yellow
      { bg: '#E2E3F0', text: '#4A4A6A' }, // soft indigo
      { bg: '#D4EDDA', text: '#2E7D32' }, // green
      { bg: '#D1ECF1', text: '#0C5460' }, // teal
      { bg: '#FCE4EC', text: '#AD1457' }, // pink
      { bg: '#E3F2FD', text: '#1565C0' }, // blue
    ];
    let sum = 0;
    for (let i = 0; i < tag.length; i++) sum += tag.charCodeAt(i);
    const idx = sum % palette.length;
    return palette[idx];
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BLUE_BG }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: BLUE_BG
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: '#333',
          marginLeft: 20
        }}>
          Write journal
        </Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={{ flex: 1 }} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Journal Prompts Card */}
          <View style={{
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
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#333',
              marginBottom: 16
            }}>
              Some questions for you today...
            </Text>
            
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 14,
                color: '#666',
                marginBottom: 8,
                lineHeight: 20
              }}>
                • What's been weighing on your mind lately?
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#666',
                marginBottom: 8,
                lineHeight: 20
              }}>
                • What 3 things are you grateful for today?
              </Text>
              <Text style={{
                fontSize: 14,
                color: '#666',
                lineHeight: 20
              }}>
                • What's something you're proud of recently?
              </Text>
            </View>

            <TextInput
              style={{
                minHeight: 200,
                fontSize: 16,
                color: '#333',
                textAlignVertical: 'top',
                lineHeight: 24,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                borderRadius: 8,
                padding: 12,
                backgroundColor: '#FAFAFA'
              }}
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
          <View style={{
            backgroundColor: WHITE,
            marginHorizontal: 20,
            marginTop: 16,
            borderRadius: 16,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#333',
              marginBottom: 16
            }}>
              Tag a topic
            </Text>
            
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              {selectedTags.map((tag, index) => {
                const colors = getTagColor(tag);
                return (
                  <View
                    key={index}
                    style={{
                      backgroundColor: colors.bg,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      marginRight: 8,
                      marginBottom: 8,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{
                      color: colors.text,
                      fontSize: 14,
                      fontWeight: '500',
                      marginRight: 6
                    }}>
                      {tag}
                    </Text>
                    <TouchableOpacity onPress={() => removeTag(tag)}>
                      <Ionicons name="close" size={16} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                );
              })}
              
              <TouchableOpacity
                onPress={() => setIsTagModalVisible(true)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#F0F0F0',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8
                }}
              >
                <Ionicons name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Add to Log Button */}
          <TouchableOpacity 
            style={{
              backgroundColor: '#4A90E2',
              marginHorizontal: 20,
              marginTop: 20,
              paddingVertical: 16,
              marginBottom: 100,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={handleAddToLog}
          >
            <Text style={{ 
              color: WHITE, 
              fontSize: 18, 
              fontWeight: '600' 
            }}>
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
        <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#E0E0E0'
          }}>
            <TouchableOpacity onPress={() => setIsTagModalVisible(false)}>
              <Text style={{ fontSize: 16, color: '#4A90E2', fontWeight: '500' }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#333' }}>
              Select Topics
            </Text>
            <TouchableOpacity onPress={() => setIsTagModalVisible(false)}>
              <Text style={{ fontSize: 16, color: '#4A90E2', fontWeight: '600' }}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={{ flex: 1, padding: 20 }}>
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between'
            }}>
              {availableTags.map((tag, index) => {
                const colors = getTagColor(tag);
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => addTag(tag)}
                    style={{
                      backgroundColor: isSelected ? colors.bg : '#F5F5F5',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 20,
                      marginBottom: 12,
                      width: (width - 60) / 2,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{
                      color: isSelected ? colors.text : '#666',
                      fontSize: 14,
                      fontWeight: '500'
                    }}>
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