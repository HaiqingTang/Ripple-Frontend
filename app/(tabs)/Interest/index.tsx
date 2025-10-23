// app/(tabs)/Interest/index.tsx
import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Image, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { auth } from "../../../firebase";

const Routes = {
  Interest: {
    clubMain: "/(tabs)/Interest/clubMainPage" as const,
    meetupMain: "/(tabs)/Interest/meetupMainPage" as const,
  },
  Discussion: {
    home: "/(tabs)/Discussion" as const, // Discussion/index.tsx
  },
} as const;

export default function InterestIndex() {
  const router = useRouter();

  const helloName = useMemo(() => {
    const full = auth.currentUser?.displayName || "";
    if (!full) return "there";
    const first = full.trim().split(/\s+/)[0];
    return first || "there";
  }, [auth.currentUser?.displayName]);

  const goClubMain = () => router.push(Routes.Interest.clubMain);
  const goMeetupMain = () => router.push(Routes.Interest.meetupMain);
  const goDiscussion = () => router.push("/Discussion");

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Welcome to the community hub{"\n"}
            {helloName}!
          </Text>
          <Text style={styles.heroSub}>
            Here you can find discussion boards, events, and clubs to participate in!
          </Text>
        </View>

        {/* Clubs */}
        <Pressable style={styles.card} accessibilityRole="button" hitSlop={8} onPress={goClubMain}>
          <Image
            style={styles.image}
            resizeMode="cover"
            source={{
              uri:
                "https://images.unsplash.com/photo-1663162550974-aaf76bcdeedf?q=80&w=1740&auto=format&fit=crop",
            }}
          />
          <Text style={styles.cardTitle}>Clubs</Text>
          <Text style={styles.cardDesc}>
            Join interest-based clubs and connect with people who share your passions.
          </Text>
        </Pressable>

        {/* Meetups */}
        <Pressable style={styles.card} accessibilityRole="button" hitSlop={8} onPress={goMeetupMain}>
          <Image
            style={styles.image}
            resizeMode="cover"
            source={{
              uri:
                "https://images.unsplash.com/photo-1692261929431-253094ad8497?q=80&w=1740&auto=format&fit=crop",
            }}
          />
          <Text style={styles.cardTitle}>Meetups</Text>
          <Text style={styles.cardDesc}>
            Discover nearby meetups and join others for coffee, walks, or shared activities.
          </Text>
        </Pressable>

        {/* Discussion Boards */}
        <Pressable style={styles.card} accessibilityRole="button" hitSlop={8} onPress={goDiscussion}>
          <Image
            style={styles.image}
            resizeMode="cover"
            source={{
              uri:
                "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1740&auto=format&fit=crop",
            }}
          />
          <Text style={styles.cardTitle}>Discussion Boards</Text>
          <Text style={styles.cardDesc}>
            Start threads, reply to others, and keep the conversation going.
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#DDE7FF" },
  container: { flex: 1, backgroundColor: "#DDE7FF" },

  hero: {
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 24, android: 16 }),
    paddingBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4A66C2",
    lineHeight: 34,
    marginBottom: 8,
  },
  heroSub: { fontSize: 14, color: "#6F7EA6" },

  card: {
    marginHorizontal: 12,
    marginTop: 16,
    backgroundColor: "#C9D7FF",
    borderRadius: 18,
    padding: 12,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 14,
    backgroundColor: "#EAF0FF",
    marginBottom: 10,
  },

  cardTitle: { textAlign: "center", fontSize: 20, fontWeight: "800", color: "#4A66C2" },
  cardDesc: { textAlign: "left", marginTop: 6, color: "#536082" },
});
