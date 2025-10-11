import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const router = useRouter();

export default function Interest() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Welcome to the community hub{'\n'}Ellie!</Text>
        <Text style={styles.heroSub}>
          Here you can find discussion boards, events, and clubs to participate in!
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.imagePlaceholder} />
        <Text style={styles.cardTitle}>Clubs</Text>
        <Text style={styles.cardDesc}>
          Share your thoughts, ask questions, and interact with other members.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.imagePlaceholder} />
        <Text style={styles.cardTitle}>Meetups</Text>
        <Text style={styles.cardDesc}>
          Discover nearby meetups and join others for coffee, walks, or shared activities.
        </Text>
      </View>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/Discussion')}>
        <View style={styles.imagePlaceholder} />
        <Text style={styles.cardTitle}>Discussion Boards</Text>
        <Text style={styles.cardDesc}>
          Share your thoughts, ask questions, and interact with other members.
        </Text>
      </TouchableOpacity>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#DDE7FF' },
  hero: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#4A66C2', lineHeight: 34, marginBottom: 8 },
  heroSub: { fontSize: 14, color: '#6F7EA6' },
  card: { marginHorizontal: 12, marginTop: 16, backgroundColor: '#C9D7FF', borderRadius: 18, padding: 12 },
  imagePlaceholder: { height: 150, borderRadius: 14, backgroundColor: '#EAF0FF', marginBottom: 10 },
  cardTitle: { textAlign: 'center', fontSize: 20, fontWeight: '800', color: '#4A66C2' },
  cardDesc: { textAlign: 'left', marginTop: 6, color: '#536082' },
});