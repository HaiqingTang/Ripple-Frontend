import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import LogButton from '@/components/LogButton';

const BLUE_BG = '#DDE7FF';
const WHITE = '#FFFFFF';

export default function JournalSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams<{ journal?: string; tags?: string }>();
  const { dayOfWeek, formattedDate } = useAppContext();

  const handleContinue = () => {
    // TODO: which screen to go to?
    router.push('/(tabs)/personalLog');
  };

  const handleViewEntries = () => {
    // TODO: replace with a dedicated entries history screen when available
    console.log('Viewing previous entries...');
    router.push('/journal/entries');
  };

  // day and date are provided by context

  return (
    <SafeAreaView style={styles.container}>
      {/* Title */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text style={styles.headerTitle}>Congratulations!</Text>
      </View>

      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.date}>{`It's ${dayOfWeek}!`}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
            <Text style={styles.encouragement}>You've been doing an awesome job with logging! Awesome work!</Text>
          </View>
          <View style={styles.progressIcon}>
            <Ionicons name="trending-up" size={24} color="#FF6B6B" />
          </View>
        </View>
        
        <TouchableOpacity style={styles.viewEntriesButton} onPress={handleViewEntries}>
          <Ionicons name="book-outline" size={16} color="#4A90E2" />
          <Text style={styles.viewEntriesText}>View Previous Entries</Text>
        </TouchableOpacity>
      </View>

      {/* Success Card */}
      <View style={styles.successCard}>
        <View style={styles.successContent}>
          <View style={styles.successText}>
            <Text style={styles.successTitle}>Good job!</Text>
            <Text style={styles.successMessage}>You've submitted your journal entry for today</Text>
            {!!params.journal && (
              <Text style={[styles.successMessage, { marginTop: 8, color: '#2C3E50' }]} numberOfLines={3}>
                {String(params.journal)}
              </Text>
            )}
            {!!params.tags && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                {(() => {
                  try {
                    const tags = JSON.parse(String(params.tags));
                    if (Array.isArray(tags)) {
                      return tags.map((t: string, i: number) => (
                        <View key={`${t}-${i}`} style={{
                          backgroundColor: '#EAF2FF',
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 14,
                          marginRight: 8,
                          marginTop: 6,
                        }}>
                          <Text style={{ color: '#1E63E9', fontWeight: '600' }}>{t}</Text>
                        </View>
                      ));
                    }
                  } catch {}
                  return null;
                })()}
              </View>
            )}
          </View>
          <View style={styles.successIcon}>
            <Text style={styles.emoji}>😊</Text>
          </View>
        </View>
      </View>

      <LogButton label="Continue" onPress={handleContinue} />
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: BLUE_BG,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  headerCard: {
    backgroundColor: WHITE,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#5A6C7D',
    marginBottom: 4,
  },
  encouragement: {
    fontSize: 14,
    color: '#4A90E2',
    marginTop: 12,
    marginBottom: 16,
  },
  progressIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewEntriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  viewEntriesText: {
    fontSize: 14,
    color: '#4A90E2',
    marginLeft: 8,
    fontWeight: '500',
  },
  successCard: {
    backgroundColor: '#E8F4FD',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successText: {
    flex: 1,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#5A6C7D',
    lineHeight: 22,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF3CD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  continueButton: {
    backgroundColor: '#4A90E2',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '600',
  },
});