import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  ScrollView,
} from "react-native";

const BLUE_BG = "#DDE7FF";
const WHITE = "#FFFFFF";

const availableTags = [
  "Hiking", "Meditation", "Nutrition", "Work", "Family", "Friends", "Exercise",
  "Reading", "Music", "Art", "Travel", "Cooking", "Learning", "Health", "Mindfulness",
  "Gratitude", "Goals", "Challenges",
];

const tagColors: Record<string, { bg: string; text: string }> = {
  Hiking: { bg: "#E0F7FA", text: "#00695C" },
  Meditation: { bg: "#FFF3E0", text: "#E65100" },
  Nutrition: { bg: "#E8F5E9", text: "#2E7D32" },
  Work: { bg: "#E3F2FD", text: "#1565C0" },
  Family: { bg: "#FCE4EC", text: "#AD1457" },
  Friends: { bg: "#F3E5F5", text: "#6A1B9A" },
  Exercise: { bg: "#FFFDE7", text: "#F9A825" },
  Reading: { bg: "#F1F8E9", text: "#33691E" },
  Music: { bg: "#EDE7F6", text: "#4527A0" },
  Art: { bg: "#FFF8E1", text: "#FF6F00" },
  Travel: { bg: "#E0F2F1", text: "#004D40" },
  Cooking: { bg: "#FBE9E7", text: "#D84315" },
  Learning: { bg: "#F9FBE7", text: "#827717" },
  Health: { bg: "#E8EAF6", text: "#1A237E" },
  Mindfulness: { bg: "#E0F7FA", text: "#00838F" },
  Gratitude: { bg: "#FFFDE7", text: "#F57F17" },
  Goals: { bg: "#F1F8E9", text: "#33691E" },
  Challenges: { bg: "#F3E5F5", text: "#4A148C" },
  Nature: { bg: "#E8F5E9", text: "#1B5E20" },
  Walking: { bg: "#E0F2F1", text: "#00695C" },
};

const username = "Ellie";

// log entry samples
const sampleLogs = [
  {
    id: "1",
    date: "2025-09-18", 
    weekday: "Tuesday",
    reflection:
      "Had a really productive day at the community center. Helped organize the food drive and saw so many volunteers come together. Feeling grateful for this work and the impact we're making.",
    sleep: { duration: "7.5h", quality: "8/10" },
    mood: 8,
    tags: ["Gratitude", "Work"],
    emoji: '😊',
  },
  {
    id: "2",
    date: "2025-09-16",
    weekday: "Monday",
    reflection:
      "Monday blues hit hard today. Had some challenging cases at work that left me feeling drained. Took a walk during lunch which helped clear my head.",
    sleep: { duration: "6.2h", quality: "5/10" },
    mood: 6,
    tags: ["Work", "Walking"],
    emoji: '😐',
  },
  {
    id: "3",
    date: "2025-09-11",
    weekday: "Tuesday",
    reflection:
      "Went hiking in the mountains. The fresh air and nature really recharged me. Feeling peaceful.",
    sleep: { duration: "8h", quality: "9/10" },
    mood: 9,
    tags: ["Hiking", "Nature"],
    emoji: '😄',
  },
];

export default function LogEntriesPage() {
  const [filter, setFilter] = useState<"All" | "Week" | "Month">("All");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const router = useRouter();

  // filter logic
  const filterLogs = () => {
    let filtered = [...sampleLogs];

    // filter by tag
    if (tagFilter) {
      filtered = filtered.filter((log) => log.tags.includes(tagFilter));
    }

    // filter by time
    if (filter !== "All") {
      const today = new Date(); 
      if (filter === "Week") {
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        filtered = filtered.filter((log) => {
          const logDay = new Date(log.date);
          return logDay >= oneWeekAgo && logDay <= today;
        });
      }
      if (filter === "Month") {
        filtered = filtered.filter((log) => {
          const logDay = new Date(log.date);
          return (
            logDay.getMonth() === today.getMonth() &&
            logDay.getFullYear() === today.getFullYear()
          );
        });
      }
    }

    return filtered;
  };

  const renderLogCard = ({ item }: { item: any }) => (
    <View
      style={{
        backgroundColor: WHITE,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
      }}
    >
      {/* Mood and Emoji */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          {new Date(item.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              backgroundColor: "#4A90E2",
              width: 28,
              height: 28,
              borderRadius: 14,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 6,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 12 }}>
              {item.mood}
            </Text>
          </View>
          <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
        </View>
      </View>
    
      <View style={{ flexDirection: "row", marginBottom: 6 }}></View>
      <Text style={{ color: "#666", marginBottom: 18 }}>{item.weekday}</Text>

      <Text style={{ fontSize: 12, color: "#666" }}>DAILY REFLECTION</Text>
      <View style={{ flexDirection: "row", marginBottom: 8 }}></View>

      <Text style={{ marginBottom: 16 }} numberOfLines={3}>
        {item.reflection}
      </Text>

      {/* Sleep info */}
      <Text style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>SLEEP</Text>
      <View style={{ flexDirection: "row", marginBottom: 6 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: "#F9F9F9",
            padding: 12,
            borderRadius: 8,
            marginRight: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "600", color: "#2e8adaff", marginBottom: 6 }}>{item.sleep.duration}</Text>
          <Text style={{ fontSize: 11, color: "#666" }}>Duration</Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: "#F9F9F9",
            padding: 12,
            borderRadius: 8,
            marginRight: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "600", color: "#2e8adaff", marginBottom: 6 }}>{item.sleep.quality}</Text>
          <Text style={{ fontSize: 11, color: "#666" }}>Quality</Text>
        </View>
      </View>

      {/* Tags */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 5, marginBottom: 15 }}>
        {item.tags.map((tag: string, idx: number) => {
          const colors = tagColors[tag] || { bg: "#EAF2FF", text: "#1E63E9" };
          return (
            <View
              key={idx}
              style={{
                backgroundColor: colors.bg,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                marginRight: 6,
                marginTop: 6,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "500" }}>{tag}</Text>
            </View>
          );
        })}
      </View>

      <TouchableOpacity onPress={() => setSelectedLog(item)}>
        <Text style={{ color: "#4A90E2", fontWeight: "500" }}>
          Show more details
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BLUE_BG }}>
      <View style={{ height: 155}}>
        {/* Top header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 8,
          }}
        >
          <TouchableOpacity onPress={() => router.push("/(tabs)/personalLog ")}>
            <Ionicons name="arrow-back" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 18 }}>
            {username}'s Log Entries
          </Text>
          <View style={{ width: 25 }} />
        </View>

        {/* Time Filter Tabs */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          {["All", "Week", "Month"].map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => setFilter(key as any)}
              style={{
                backgroundColor: filter === key ? "#4A90E2" : WHITE,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                marginHorizontal: 6,
                marginBottom: 5
              }}
            >
              <Text
                style={{
                  color: filter === key ? WHITE : "#333",
                  fontWeight: "600",
                }}
              >
                {key === "All"
                  ? "All Entries"
                  : key === "Week"
                  ? "This Week"
                  : "This Month"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tag Filter Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingHorizontal: 16, height: 40, marginBottom: 8 }}
        >
          {Object.keys(tagColors).map((tag) => {
            const colors = tagColors[tag];
            const isActive = tagFilter === tag;
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => setTagFilter(isActive ? null : tag)}
                style={{
                  backgroundColor: isActive ? colors.bg : colors.bg,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  marginRight: 8,
                  height: 30,
                }}
              >
                <Text style={{ color: colors.text, fontWeight: "500" }}>{tag}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Log List */}
      <FlatList
        data={filterLogs()}
        keyExtractor={(item) => item.id}
        renderItem={renderLogCard}
        contentContainerStyle={{ paddingBottom: 20 }} 
      />

      {/* Log Details */}
      <Modal visible={!!selectedLog} animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: BLUE_BG }}>
        <ScrollView style={{ flex: 1, padding: 20 }}>
          {selectedLog && (
            <View style={{ backgroundColor: WHITE, borderRadius: 12, padding: 16 }}>

              {/* Mood + Emoji */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                  {new Date(selectedLog.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ backgroundColor: "#4A90E2", width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 6 }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 12 }}>
                      {selectedLog.mood}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 20 }}>{selectedLog.emoji}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", marginBottom: 3 }}></View>
              <Text style={{ color: "#666", marginBottom: 18 }}>{selectedLog.weekday}</Text>

              {/* Reflection */}
              <Text style={{ fontSize: 12, color: "#666" }}>DAILY REFLECTION</Text>
              <View style={{ flexDirection: "row", marginBottom: 6 }}></View>
              <Text style={{ marginBottom: 20 }}>{selectedLog.reflection}</Text>

              {/* Sleep */}
              <Text style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>SLEEP</Text>
              <View style={{ flexDirection: "row", marginBottom: 6 }}>
                <View style={{ flex: 1, backgroundColor: "#F9F9F9", padding: 12, borderRadius: 8, marginRight: 10, alignItems: "center" }}>
                  <Text style={{ fontWeight: "600", color: "#2e8adaff", marginBottom: 6 }}>{selectedLog.sleep.duration}</Text>
                  <Text style={{ fontSize: 11, color: "#666" }}>Duration</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: "#F9F9F9", padding: 12, borderRadius: 8, marginRight: 6, alignItems: "center" }}>
                  <Text style={{ fontWeight: "600", color: "#2e8adaff", marginBottom: 6 }}>{selectedLog.sleep.quality}</Text>
                  <Text style={{ fontSize: 11, color: "#666" }}>Quality</Text>
                </View>
              </View>
              
              {/* Mood */}
              <View style={{ flexDirection: "row", marginBottom: 15 }}></View>
              <Text style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>MOOD</Text>
              <View style={{ flexDirection: "row", marginBottom: 6 }}>
                <View style={{ flex: 1, backgroundColor: "#F9F9F9", padding: 12, borderRadius: 8, marginRight: 10, alignItems: "center" }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: "#2e8adaff" }}>{selectedLog.emoji}</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: "#F9F9F9", padding: 12, borderRadius: 8, marginRight: 6, alignItems: "center" }}>
                  <Text style={{ fontWeight: "600", color: "#2e8adaff", marginBottom: 6 }}>{selectedLog.mood}/10</Text>
                  <Text style={{ fontSize: 11, color: "#666" }}>Quality</Text>
                </View>
              </View>

              {/* Tags (with color) */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
                {selectedLog.tags.map((tag: string, idx: number) => {
                  const colors = tagColors[tag] || { bg: "#EAF2FF", text: "#1E63E9" };
                  return (
                    <View
                      key={idx}
                      style={{
                        backgroundColor: colors.bg,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        marginRight: 6,
                        marginTop: 6,
                      }}
                    >
                      <Text style={{ color: colors.text, fontWeight: "500" }}>{tag}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

          <TouchableOpacity
            style={{
              backgroundColor: "#4A90E2",
              padding: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => setSelectedLog(null)}
          >
            <Text style={{ color: WHITE, fontSize: 18, fontWeight: "600" }}>
              Close
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
