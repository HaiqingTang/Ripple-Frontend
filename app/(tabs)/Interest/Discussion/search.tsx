import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SearchDiscussion() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput style={styles.searchInput} placeholder="Pizza" defaultValue="Pizza" />
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close-circle" size={28} color="#4A66C2" />
        </TouchableOpacity>
      </View>

      <Text style={styles.resultTitle}>Results</Text>
      {[
        "Discussion about the best pizza",
        "Pizza night ideas for the weekend",
        "Homemade pizza dough recipe",
        "My favorite pizza place in town",
        "Homemade pizza with fresh",
        "Best pizza deals this week"
      ].map((text, idx) => (
        <View key={idx} style={styles.item}>
          <View style={styles.avatar} />
          <View>
            <Text style={styles.itemText}>{text}</Text>
            <Text style={styles.time}>Posted {idx + 2} days ago</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#DDE7FF', padding: 16 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  searchInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10, marginRight: 10,
  },
  resultTitle: { fontWeight: '700', fontSize: 16, marginBottom: 12 },
  item: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#bbb', marginRight: 10 },
  itemText: { fontSize: 14, fontWeight: '600', color: '#333' },
  time: { fontSize: 12, color: '#666' },
});
