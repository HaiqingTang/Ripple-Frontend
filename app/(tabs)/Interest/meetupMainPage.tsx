// app/Interest/meetupMainPage.tsx
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  ImageBackground,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type Meetup = { id: string; title: string; date: string };

const MY_MEETUPS: Meetup[] = [
  { id: "1", title: "Morning Yoga", date: "17/9/25" },
  { id: "2", title: "Morning Yoga2", date: "18/9/25" },
  { id: "3", title: "Morning Yoga3", date: "19/9/25" },
];

export default function MeetupMainPage() {
  const router = useRouter();

  const onBack = () => console.log("Back pressed");

  // 改这里：点击 + 进入 newMeetup
  const onAdd = () => router.push("/Interest/newMeetup");

  const onAllMeetups = () => {
    router.push("/Interest/myMeetups");
  };
  const onExplore = () => router.push("/Interest/allMeetups");
  const onBottomNav = (key: string) => console.log("Bottom nav ->", key);
  const onOpenMeetup = (m: Meetup) => {
    if (m.id === "1") {
      router.push("/Interest/meetupDetail1");
    } else {
      // 先不跳
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.iconBtn} onPress={onBack}>
            <Ionicons name="chevron-back" size={22} color="#2c3e50" />
          </Pressable>

          <View style={styles.titleWrap}>
            <Text style={styles.title}>Meetups</Text>
            <Ionicons
              name="globe-outline"
              size={16}
              color="#2c3e50"
              style={{ marginLeft: 6, marginTop: 2 }}
            />
          </View>

          {/* 右上角 + 号 */}
          <Pressable style={styles.roundBtnOutline} onPress={onAdd} hitSlop={8}>
            <Ionicons name="add" size={20} color="#3b82f6" />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            placeholder="Search meetups..."
            placeholderTextColor="#9aa3b2"
            style={styles.searchInput}
            onChangeText={(t) => console.log("search:", t)}
            returnKeyType="search"
          />
        </View>

        {/* Featured card */}
        <ImageBackground
          source={{
            uri:
              "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1600&auto=format&fit=crop",
          }}
          style={styles.featured}
          imageStyle={styles.featuredImg}
        >
          <View style={styles.hotBadge}>
            <Text style={styles.hotText}>🔥 HOT</Text>
          </View>

          <View style={styles.featuredTextWrap}>
            <Text style={styles.featuredDate}>Sep 17</Text>
            <Text style={styles.featuredTitle}>Morning Yoga</Text>
          </View>
        </ImageBackground>

        {/* My Meetups card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>My Meetups</Text>
            <Pressable style={styles.allBtn} onPress={onAllMeetups}>
              <Text style={styles.allText}>All Meetups</Text>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </Pressable>
          </View>

          <FlatList
            data={MY_MEETUPS}
            keyExtractor={(i) => i.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onOpenMeetup(item)}
                style={styles.meetupRow}
              >
                <Text style={styles.meetupName}>{item.title}</Text>
                <Text style={styles.meetupDate}>{item.date}</Text>
              </Pressable>
            )}
            contentContainerStyle={{ paddingTop: 6, paddingBottom: 6 }}
          />
        </View>

        {/* Explore button */}
        <Pressable style={styles.exploreBtn} onPress={onExplore}>
          <Text style={styles.exploreText}>Explore more meetups</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom toolbar */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.bottomItem} onPress={() => onBottomNav("mood")}>
          <Ionicons name="happy-outline" size={22} color="#111827" />
        </Pressable>
        <Pressable
          style={styles.bottomItem}
          onPress={() => onBottomNav("notes")}
        >
          <Ionicons name="clipboard-outline" size={22} color="#111827" />
        </Pressable>
        <Pressable
          style={styles.bottomItem}
          onPress={() => onBottomNav("chat")}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#111827" />
        </Pressable>
        <Pressable
          style={styles.bottomItem}
          onPress={() => onBottomNav("clock")}
        >
          <Ionicons name="time-outline" size={22} color="#111827" />
        </Pressable>
        <Pressable
          style={styles.bottomItem}
          onPress={() => onBottomNav("profile")}
        >
          <Ionicons name="person-outline" size={22} color="#111827" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const BG = "#D6E6FD"; // 页面淡蓝背景
const CARD_BG = "#C6DBFA";
const BLUE_TEXT = "#345BCE";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.select({ ios: 0, android: 10 }),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2c3e50",
    letterSpacing: 0.3,
  },

  searchBox: {
    marginTop: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },

  featured: {
    marginTop: 16,
    marginHorizontal: 16,
    height: 170,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  featuredImg: {
    borderRadius: 16,
  },
  hotBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  hotText: {
    fontWeight: "800",
    color: "#ff4d00",
    letterSpacing: 0.5,
  },
  featuredTextWrap: {
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  featuredDate: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowRadius: 4,
  },
  featuredTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowRadius: 4,
  },

  card: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  cardHeader: {
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: BLUE_TEXT,
  },
  allBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  allText: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
  },

  meetupRow: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  meetupName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  meetupDate: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
  },

  exploreBtn: {
    marginTop: 14,
    marginHorizontal: 16,
    height: 44,
    borderRadius: 12,
    backgroundColor: CARD_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  exploreText: {
    fontSize: 15,
    fontWeight: "800",
    color: BLUE_TEXT,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    backgroundColor: BG,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  bottomItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  // 新增：右上角 + 按钮的描边样式
  roundBtnOutline: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#3b82f6",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },

  // 之前留着也可用（备用）
  roundBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#3b82f6",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
});