import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function Interest() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Welcome to the community hub{'\n'}Ellie!</Text>
        <Text style={styles.heroSub}>
          Here you can find discussion boards, events, and clubs to participate in!
        </Text>
      </View>

      <Pressable
        style={styles.card}
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => router.push('/(tabs)/Interest/clubMainPage')}
      >
        <Image
          style={styles.imagePlaceholder}
          source={{
            uri:
              'https://images.unsplash.com/photo-1663162550974-aaf76bcdeedf?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          }}
        />
        <Text style={styles.cardTitle}>Clubs</Text>
        <Text style={styles.cardDesc}>
          Share your thoughts, ask questions, and interact with other members.
        </Text>
      </Pressable>

      <Pressable
        style={styles.card}
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => router.push('/(tabs)/Interest/meetupMainPage')}
      >
        <Image
          style={styles.imagePlaceholder}
          source={{
            uri:
              'https://images.unsplash.com/photo-1692261929431-253094ad8497?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          }}
        />
        <Text style={styles.cardTitle}>Meetups</Text>
        <Text style={styles.cardDesc}>
          Discover nearby meetups and join others for coffee, walks, or shared activities.
        </Text>
      </Pressable>
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
