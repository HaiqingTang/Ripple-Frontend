import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Challenge = {
  id: string;
  title: string;
  desc: string;
  days: number;
  joined: number;
  reward: string;
  cover: string;
};

const MOCK: Challenge[] = [
  {
    id: "eat-smart",
    title: "Eat Smart, Feel Great",
    desc: "Make mindful food choices that boost energy, mood, and long-term health.",
    days: 28,
    joined: 84,
    reward: "protein powder discount",
    cover:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=640&q=80&auto=format&fit=crop",
  },
  {
    id: "fuel-your-body",
    title: "Fuel Your Body, Not Just Your Day",
    desc: "Power your performance with balanced meals that keep you strong and focused all day.",
    days: 28,
    joined: 36,
    reward: "Library coffee coupon",
    cover:
      "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=640&q=80&auto=format&fit=crop",
  },
  {
    id: "good-food",
    title: "Good Food, Better You",
    desc: "Every healthy choice builds a stronger, happier version of yourself.",
    days: 28,
    joined: 58,
    reward: "Luxury Massage coupon",
    cover:
      "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=640&q=80&auto=format&fit=crop",
  },
];

export default function NutritionChallengeList() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return MOCK;
    return MOCK.filter(
      (c) =>
        c.title.toLowerCase().includes(kw) ||
        c.desc.toLowerCase().includes(kw) ||
        c.reward.toLowerCase().includes(kw)
    );
  }, [q]);

  const openDetail = (c: Challenge) => {
    router.push({
      pathname: "/Challenge/challengeReward",
      params: { id: c.id, title: c.title },
    });
  };

  const createNew = () => {
    router.push("/Challenge/postNewChallenge");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable hitSlop={10} style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#6B7AFF" />
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Nutrition challenge</Text>
          <Text style={styles.subtitle}>Healthy plate, healthier you</Text>
        </View>

        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&q=80&auto=format&fit=crop",
          }}
          style={styles.avatar}
        />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#99A2C0" style={{ marginHorizontal: 10 }} />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#99A2C0"
          value={q}
          onChangeText={setQ}
          returnKeyType="search"
          style={styles.searchInput}
        />
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {list.map((c) => (
          <View key={c.id} style={styles.card}>
            {/* 1) 标题：独占整行，不受右侧图片影响 */}
            <Text style={styles.cardTitle}>"{c.title}"</Text>

            {/* 2) 左：描述 + （左列内部居中）时间/人数；右：插画 */}
            <View style={styles.rowTop}>
              <View style={styles.leftCol}>
                <Text style={styles.cardDesc}>{c.desc}</Text>

                {/* ✅ 时间 & 人数：在“左列”内居中显示，受图片（右列）影响 */}
                <View style={styles.metaRowInLeft}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={18} color="#000" />
                    <Text style={styles.metaTextDark}>{c.days} days</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="person-outline" size={18} color="#000" />
                    <Text style={styles.metaTextDark}>{c.joined} joined</Text>
                  </View>
                </View>

                {/* 奖励 chip */}
                <View style={styles.rewardChip}>
                  <View style={styles.rewardDot} />
                  <Text style={styles.rewardText}>{c.reward}</Text>
                </View>
              </View>

              <Image source={{ uri: c.cover }} style={styles.cover} />
            </View>

            {/* 3) view 按钮：整张卡片底部居中 */}
            <Pressable style={styles.viewBtn} onPress={() => openDetail(c)}>
              <Text style={styles.viewBtnText}>view</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {/* 新建 */}
      <Pressable onPress={createNew} style={styles.fab} accessibilityRole="button">
        <Ionicons name="add" size={40} color="#fff" />
      </Pressable>
    </View>
  );
}

const BLUE = "#DDE7FF";
const DEEP = "#6B7AFF";
const GREEN = "#59C34A";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLUE,
    paddingTop: Platform.select({ ios: 54, android: 22 }),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: DEEP,
    textAlign: "left",
  },
  subtitle: { color: "#7B8BBB", marginTop: 4, fontWeight: "600" },
  avatar: { width: 52, height: 52, borderRadius: 12, marginLeft: 8 },

  searchWrap: {
    marginHorizontal: 18,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 14,
  },
  searchInput: { flex: 1, height: "100%", fontSize: 16, color: "#223" },

  card: {
    marginHorizontal: 18,
    marginVertical: 10,
    backgroundColor: "#EEF3FF",
    borderRadius: 20,
    padding: 18,
  },

  // 顶部标题独占整行、居中
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: DEEP,
    textAlign: "center",
    marginBottom: 10,
  },

  // 左右部分
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftCol: {
    flex: 1,
    paddingRight: 12,
  },
  cardDesc: {
    color: "#4C5A7A",
    lineHeight: 20,
    textAlign: "left", // 让描述也居中，和 meta 对齐
  },
  metaRowInLeft: {
      marginTop: 10,
      flexDirection: "row",
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      columnGap: 28,
    },
  cover: {
    width: 92,
    height: 92,
    borderRadius: 20,
    marginLeft: 8,
  },

  // ✅ 在左列内部居中
  metaRowInLeft: {
    marginTop: 10,
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 28,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaTextDark: { color: "#000", fontWeight: "600" },

  // 奖励 chip
  rewardChip: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  rewardDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#F6B95B" },
  rewardText: { color: "#DA6464", fontWeight: "700" },

  // view 按钮：整卡底部居中
  viewBtn: {
    alignSelf: "center",
    marginTop: 14,
    backgroundColor: GREEN,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 20,
  },
  viewBtnText: { color: "#fff", fontWeight: "800", textTransform: "lowercase" },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 90,
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: DEEP,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
