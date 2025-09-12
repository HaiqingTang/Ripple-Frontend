import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const [dayRating, setDayRating] = useState(5);
  const [feeling, setFeeling] = useState(5);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  // 动态日期
  const { weekday, dateStr } = useMemo(() => {
    const today = new Date();
    const weekday = today.toLocaleDateString("en-US", { weekday: "long" });
    const dateStr = today.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    return { weekday, dateStr };
  }, []);

  return (
    <View style={styles.container}>
      {/* 顶部欢迎卡片 */}
      <View style={styles.card}>
        <Text style={styles.title}>Good Morning Ellie!</Text>
        <Text style={styles.subtitle}>{`It's ${weekday}!`}</Text>
        <Text style={styles.subtitle}>{dateStr}</Text>
        <Text style={styles.highlight}>
          You've been doing an awesome job with logging! Awesome work!
        </Text>

        {/* 用户头像 */}
        <Image
          source={{ uri: "https://i.pravatar.cc/100" }} // 测试头像，可以换成本地 assets
          style={styles.avatar}
        />
      </View>

      {/* View Previous Entries */}
      <TouchableOpacity style={styles.entryButton}>
        <Ionicons name="book-outline" size={18} color="#c6a972" />
        <Text style={styles.entryText}> View Previous Entries</Text>
      </TouchableOpacity>

      {/* Rate your day */}
      <View style={[styles.card, styles.dayCard]}>
        <Text style={styles.question}>How would you rate your day overall?</Text>
        <View style={styles.valueBadge}>
          <Text style={{ color: "white", fontWeight: "bold" }}>{dayRating}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#007AFF"
          value={dayRating}
          onValueChange={setDayRating}
        />
        <View style={styles.scaleRow}>
          <Text style={styles.scaleText}>1</Text>
          <Text style={styles.scaleText}>10</Text>
        </View>
      </View>

      {/* How are you feeling */}
      <View style={styles.card}>
        <Text style={styles.question}>How are you feeling?</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>

        {/* slider */}
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#007AFF"
          value={feeling}
          onValueChange={setFeeling}
        />
        <View style={styles.scaleRow}>
          <Text style={styles.scaleText}>1</Text>
          <Text style={styles.scaleText}>10</Text>
        </View>

        {/* emoji 独立选择 */}
        <Text style={styles.subQuestion}>What are you feeling?</Text>
        <View style={styles.emojiRow}>
          {["😭", "😞", "😐", "🙂", "😙"].map((emo, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.emojiBox,
                selectedEmoji === emo && styles.selectedEmoji,
              ]}
              onPress={() => setSelectedEmoji(emo)}
            >
              <Text
                style={[
                  styles.emoji,
                  selectedEmoji === emo && { color: "white" },
                ]}
              >
                {emo}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d9e9fb",
    padding: 16,
    paddingTop: 70,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    position: "relative",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    color: "#666",
    marginBottom: 6,
  },
  highlight: {
    color: "#007AFF",
  },
  avatar: {
    position: "absolute",
    right: 16,
    top: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e6f0fb",
  },
  entryButton: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  entryText: {
    color: "#007AFF",
    fontWeight: "500",
  },
  question: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  valueBadge: {
    position: "absolute",
    right: 16,
    top: 16,
    backgroundColor: "#007AFF",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  slider: {
    width: "100%",
    marginTop: 8,
  },
  scaleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -4,
  },
  scaleText: {
    fontSize: 12,
    color: "#666",
  },
  dayCard: {
    paddingTop: 60,
  },
  moreButton: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  subQuestion: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 12,
    marginBottom: 8,
  },
  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  emojiBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedEmoji: {
    backgroundColor: "#007AFF",
  },
  emoji: {
    fontSize: 24,
  },
});
