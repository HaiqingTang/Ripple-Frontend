import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { collection, getDocs, query, where } from "@firebase/firestore";
import { db } from "@/lib/firebase";
import { useAppContext } from "@/context/AppContext";
import { createDataUri } from "@/lib/imageService";

const BLUE_BG = "#DDE7FF";
const WHITE = "#FFFFFF";

const emojis = ['😢', '😕', '😐', '😊', '😄'];

const getTagColor = (tag: string) => {
  const palette = [
    { bg: '#FFF3CD', text: '#8A6D3B' }, // warm yellow
    { bg: '#E2E3F0', text: '#4A4A6A' }, // soft indigo
    { bg: '#D4EDDA', text: '#2E7D32' }, // green
    { bg: '#D1ECF1', text: '#0C5460' }, // teal
    { bg: '#FCE4EC', text: '#AD1457' }, // pink
    { bg: '#E3F2FD', text: '#1565C0' }, // blue
  ];
  let sum = 0;
  for (let i = 0; i < tag.length; i++) sum += tag.charCodeAt(i);
  const idx = sum % palette.length;
  return palette[idx];
};

export default function LogEntriesPage() {
  const [filter, setFilter] = useState<"All" | "Week" | "Month">("All");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]); // State to store fetched logs
  const [userTags, setUserTags] = useState<string[]>([]); // State to store unique tags from logs
  const { userId, fullName } = useAppContext(); // Fetch userId and fullName from AppContext
  const router = useRouter();

  // Fetch logs from Firebase
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logsRef = collection(db, "personalLogs");
        const q = query(logsRef, where("userId", "==", userId)); // Use userId from AppContext
        const querySnapshot = await getDocs(q);
        const fetchedLogs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort logs by the timestamp field in descending order (most recent first)
        const sortedLogs = fetchedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(sortedLogs);

        // Extract unique tags from logs
        const tags = new Set<string>();
        sortedLogs.forEach((log) => {
          log.tags.forEach((tag: string) => tags.add(tag));
        });
        setUserTags(Array.from(tags)); // Convert Set to Array
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };

    if (userId) {
      fetchLogs(); // Fetch logs only if userId is available
    }
  }, [userId]);

  // Filter logic
  const filterLogs = () => {
    let filtered = [...logs];

    // Filter by tag
    if (tagFilter) {
      filtered = filtered.filter((log) => log.tags.includes(tagFilter));
    }

    // Filter by time
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
              {item.moodRating}
            </Text>
          </View>
          <Text style={{ fontSize: 20 }}>{emojis[(item.selectedEmoji || 1) - 1]}</Text>
        </View>
      </View>

      {/* Weekday and Timestamp */}
      <View style={{ flexDirection: "row", marginBottom: 6 }}>
        <Text style={{ color: "#666", marginRight: 8 }}>
          {item.weekday || "N/A"}
        </Text>
        <Text style={{ color: "#666" }}>
          {new Date(item.timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true, // Ensures AM/PM format
          })}
        </Text>
      </View>

      <Text style={{ fontSize: 12, color: "#666" }}>DAILY REFLECTION</Text>
      <View style={{ flexDirection: "row", marginBottom: 8 }}></View>

      <Text style={{ marginBottom: 16 }} numberOfLines={3}>
        {item.journalText || "-"}
      </Text>

      {/* Image */}
      {(item.journalPhoto || item.imageBase64) && (
        <View style={{ marginBottom: 12, borderRadius: 8, overflow: "hidden" }}>
          <Image
            source={{ uri: createDataUri(item.journalPhoto || item.imageBase64) }}
            style={{ width: "100%", height: 160, borderRadius: 8 }}
            contentFit="cover"
            transition={200}
          />
        </View>
      )}

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
          <Text style={{ fontWeight: "600", color: "#2e8adaff", marginBottom: 6 }}>
            {item.sleepDuration}h
          </Text>
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
          <Text style={{ fontWeight: "600", color: "#2e8adaff", marginBottom: 6 }}>
            {item.sleepQuality}/10
          </Text>
          <Text style={{ fontSize: 11, color: "#666" }}>Quality</Text>
        </View>
      </View>

      {/* Tags */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 5, marginBottom: 15 }}>
        {item.tags.map((tag: string, idx: number) => {
          const colors = getTagColor(tag);
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
            {fullName}'s Log Entries
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
          {userTags.map((tag) => {
            const colors = getTagColor(tag);
            const isActive = tagFilter === tag;
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => setTagFilter(isActive ? null : tag)}
                style={{
                  backgroundColor: isActive ? colors.bg : WHITE,
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
                        {selectedLog.moodRating || "N/A"}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 20 }}>{emojis[(selectedLog.selectedEmoji || 1) - 1]}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", marginBottom: 6 }}>
                <Text style={{ color: "#666", marginRight: 8 }}>
                {selectedLog.weekday || "N/A"}
                </Text>
                <Text style={{ color: "#666" }}>
                {new Date(selectedLog.timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true, // Ensures AM/PM format
                })}
                </Text>
            </View>
                {/* Reflection */}
                <Text style={{ fontSize: 12, color: "#666" }}>DAILY REFLECTION</Text>
                <View style={{ flexDirection: "row", marginBottom: 6 }}></View>
                <Text style={{ marginBottom: 20 }}>{selectedLog.journalText || "-"}</Text>

                {/* Image */}
                {(selectedLog.journalPhoto || selectedLog.imageBase64) && (
                  <View style={{ marginBottom: 20, borderRadius: 12, overflow: "hidden" }}>
                    <Image
                      source={{ uri: createDataUri(selectedLog.journalPhoto || selectedLog.imageBase64) }}
                      style={{ width: "100%", height: 300, borderRadius: 12 }}
                      contentFit="cover"
                      transition={200}
                    />
                  </View>
                )}

                {/* Sleep */}
                <Text style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>SLEEP</Text>
                <View style={{ flexDirection: "row", marginBottom: 6 }}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#F9F9F9",
                      padding: 12,
                      borderRadius: 8,
                      marginRight: 10,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontWeight: "600", color: "#2e8adaff", marginBottom: 6 }}>
                      {selectedLog.sleepDuration || "N/A"}h
                    </Text>
                    <Text style={{ fontSize: 11, color: "#666" }}>Duration</Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#F9F9F9",
                      padding: 12,
                      borderRadius: 8,
                      marginRight: 6,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontWeight: "600", color: "#2e8adaff", marginBottom: 6 }}>
                      {selectedLog.sleepQuality || "N/A"}/10
                    </Text>
                    <Text style={{ fontSize: 11, color: "#666" }}>Quality</Text>
                  </View>
                </View>
              
                {/* Tags */}
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
                  {selectedLog.tags?.map((tag: string, idx: number) => {
                    const colors = getTagColor(tag) || { bg: "#EAF2FF", text: "#1E63E9" };
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
                  }) || <Text style={{ color: "#666" }}>No tags available.</Text>}
                </View>
              </View>
            )}
          </ScrollView>
          
          <TouchableOpacity
            style={{
              backgroundColor: "#4A90E2",
              marginHorizontal: 16,
              marginTop: 20,
              marginBottom: 60,
              paddingVertical: 16,
              borderRadius: 12,
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