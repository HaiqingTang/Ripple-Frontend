import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Discussion() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Hero card */}
      <View style={styles.hero}>
        <View style={styles.imagePlaceholder} />
        <Text style={styles.heroTitle}>🔥 [HOT] Discussion about this weekend's national competition</Text>
        <Text style={styles.heroSub}>Started 2 days ago</Text>
        <Text style={styles.heroSub}>1234 participants</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          onFocus={() => router.push('/Interest/Discussion/search')}
        />
        <TouchableOpacity onPress={() => router.push('/Interest/Discussion/post')}>
          <Ionicons name="add-circle" size={32} color="#4A66C2" />
        </TouchableOpacity>
      </View>

      {/* Latest discussion list */}
      <View style={styles.latest}>
        <Text style={styles.latestTitle}>Latest Discussion</Text>
        {['2 hours ago', '3 hours ago', '4 hours ago'].map((time, idx) => (
          <View key={idx} style={styles.item}>
            <View style={styles.avatar} />
            <Text style={styles.itemText}>I think we should pay attention to the</Text>
            <Text style={styles.time}>{time}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#DDE7FF', padding: 16 },
  hero: { marginBottom: 20 },
  imagePlaceholder: { height: 120, borderRadius: 12, backgroundColor: '#C9D7FF', marginBottom: 10 },
  heroTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  heroSub: { color: '#666', fontSize: 13, marginTop: 2 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  searchInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10, marginRight: 10,
  },
  latest: {},
  latestTitle: { fontWeight: '700', fontSize: 16, marginBottom: 10 },
  item: { marginBottom: 12 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#bbb', marginBottom: 4 },
  itemText: { fontSize: 14, color: '#333' },
  time: { fontSize: 12, color: '#666' },
});
