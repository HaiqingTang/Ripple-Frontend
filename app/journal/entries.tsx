import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { collection, getDocs, query, where } from "@firebase/firestore";
import { db } from "@/lib/firebase";
import { useAppContext } from "@/context/AppContext";
import { createDataUri } from "@/lib/imageService";

const BLUE_BG = "#DDE7FF";
const WHITE = "#FFFFFF";
const HEADER_HEIGHT = 155;

const emojis = ['😢', '😕', '😐', '😊', '😄'];

// Helper function to normalize Firestore timestamps to Date objects
const toDate = (ts: any): Date | null => {
  if (!ts) return null;
  if (ts.toDate && typeof ts.toDate === "function") return ts.toDate();
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
};

// Helper function to get rating color
const getRatingColor = (rating: number): string => {
  if (rating >= 8) return "#4CAF50"; // Green
  if (rating >= 6) return "#8BC34A"; // Light green
  if (rating >= 4) return "#FFC107"; // Amber
  if (rating >= 2) return "#FF9800"; // Orange
  return "#F44336"; // Red
};

const getTagColor = (tag: string) => {
  const palette = [
    { bg: '#FFF3CD', text: '#8A6D3B' }, // warm yellow
    { bg: '#E2E3F0', text: '#4A4A6A' }, // soft indigo
    { bg: '#D4EDDA', text: '#2E7D32' }, // green
    { bg: '#D1ECF1', text: '#0C5460' }, // teal
    { bg: '#FCE4EC', text: '#AD1457' }, // pink
    { bg: '#E3F2FD', text: '#1565C0' }, // blue
  ];
  const sum = Array.from(tag).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const idx = sum % palette.length;
  return palette[idx];
};

export default function LogEntriesPage() {
  const [filter, setFilter] = useState<"All" | "Week" | "Month">("All");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [userTags, setUserTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId, fullName } = useAppContext();
  const router = useRouter();

  // Fetch logs from Firebase
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const logsRef = collection(db, "personalLogs");
        const q = query(logsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const fetchedLogs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort logs by timestamp in descending order using toDate helper
        // Logs with invalid timestamps are placed at the end
        const sortedLogs = fetchedLogs.sort((a, b) => {
          const dateA = toDate(a.timestamp);
          const dateB = toDate(b.timestamp);

          // Handle invalid timestamps
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1; // Put invalid timestamps at the end
          if (!dateB) return -1;

          // Sort in descending order (newest first)
          return dateB.getTime() - dateA.getTime();
        });
        setLogs(sortedLogs);

        // Extract unique tags from logs with defensive checks
        const tags = new Set<string>();
        sortedLogs.forEach((log) => {
          const logTags = Array.isArray(log.tags) ? log.tags : [];
          logTags.forEach((tag: string) => tags.add(tag));
        });
        setUserTags(Array.from(tags));
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchLogs();
    }
  }, [userId]);

  // Filter logic - memoized for performance
  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    // Filter by tag
    if (tagFilter) {
      filtered = filtered.filter((log) => {
        const logTags = Array.isArray(log.tags) ? log.tags : [];
        return logTags.includes(tagFilter);
      });
    }

    // Filter by time
    if (filter !== "All") {
      const today = new Date();
      if (filter === "Week") {
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        filtered = filtered.filter((log) => {
          const logDay = toDate(log.timestamp);
          // Exclude logs with invalid timestamps instead of defaulting to today
          return logDay && logDay >= oneWeekAgo && logDay <= today;
        });
      }
      if (filter === "Month") {
        filtered = filtered.filter((log) => {
          const logDay = toDate(log.timestamp);
          // Exclude logs with invalid timestamps instead of defaulting to today
          return (
            logDay &&
            logDay.getMonth() === today.getMonth() &&
            logDay.getFullYear() === today.getFullYear()
          );
        });
      }
    }

    return filtered;
  }, [logs, filter, tagFilter]);

  const renderLogCard = ({ item }: { item: any }) => {
    const displayDate = toDate(item.timestamp) || new Date();
    const logTags = Array.isArray(item.tags) ? item.tags : [];
    const ratingColor = getRatingColor(item.dayRating || 0);

    return (
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
        {/* Dates */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {displayDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Weekday and Timestamp */}
        <View style={{ flexDirection: "row", marginBottom: 25 }}>
          <Text style={{ color: "#666", marginRight: 8 }}>
            {item.weekday || "N/A"}
          </Text>
          <Text style={{ color: "#666" }}>
            {displayDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </Text>
        </View>

        {/* Overall Rating */}
        <Text style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>OVERALL</Text>
        <View style={{ 
          backgroundColor: "#F9F9F9", 
          padding: 12, 
          borderRadius: 8, 
          marginBottom: 16,
          alignItems: "center",
        }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: "bold", 
              color: ratingColor,
              marginRight: 6,
            }}>
              {item.dayRating || "N/A"}
            </Text>
            <Text style={{ fontSize: 16, color: "#666" }}>/10</Text>
          </View>
        </View>

        {/* Mood info */}
        <Text style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>MOOD</Text>
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
              {item.moodRating}/10
            </Text>
            <Text style={{ fontSize: 11, color: "#666" }}>Mood Rating</Text>
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
				        {emojis[(item.selectedEmoji || 1) - 1]}
            </Text>
            <Text style={{ fontSize: 11, color: "#666"}}>Emotion</Text>
          </View>
        </View>

        {/* Tags */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 5, marginBottom: 15 }}>
          {logTags.map((tag: string, idx: number) => {
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
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BLUE_BG, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BLUE_BG }}>
      <View style={{ height: HEADER_HEIGHT }}>
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
          <TouchableOpacity onPress={() => router.push("/(tabs)/personalLog")}>
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
                marginBottom: 5,
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
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        renderItem={renderLogCard}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Log Details */}
      <Modal visible={!!selectedLog} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: BLUE_BG }}>
          <ScrollView style={{ flex: 1, padding: 20 }}>
            {selectedLog && (() => {
              const displayDate = toDate(selectedLog.timestamp) || new Date();
              const logTags = Array.isArray(selectedLog.tags) ? selectedLog.tags : [];
              const ratingColor = getRatingColor(selectedLog.dayRating);
              
              return (
                <View style={{ backgroundColor: WHITE, borderRadius: 12, padding: 16 }}>
                  {/* Mood + Emoji */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                      {displayDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", marginBottom: 40 }}>
                    <Text style={{ color: "#666", marginRight: 8 }}>
                      {selectedLog.weekday || "N/A"}
                    </Text>
                    <Text style={{ color: "#666" }}>
                      {displayDate.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </Text>
                  </View>

                  {/* Overall Rating */}
                  <Text style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>OVERALL</Text>
                  <View style={{ 
                    backgroundColor: "#F9F9F9", 
                    padding: 16, 
                    borderRadius: 8, 
                    marginBottom: 20,
                    alignItems: "center",
                  }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ 
                        fontSize: 32, 
                        fontWeight: "bold", 
                        color: ratingColor,
                        marginRight: 6,
                      }}>
                        {selectedLog.dayRating || "N/A"}
                      </Text>
                      <Text style={{ fontSize: 20, color: "#666" }}>/10</Text>
                    </View>
                  </View>

				  {/* Mood */}
                  <Text style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>MOOD</Text>
                  <View style={{ flexDirection: "row", marginBottom: 6 }}>
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: "#F9F9F9",
                        padding: 12,
                        borderRadius: 8,
                        marginRight: 10,
                        marginBottom: 20,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontWeight: "600", color: "#2e8adaff", marginBottom: 6 }}>
                        {selectedLog.moodRating || "N/A"}/10
                      </Text>
                      <Text style={{ fontSize: 11, color: "#666" }}>Mood Rating</Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: "#F9F9F9",
                        padding: 12,
                        borderRadius: 8,
                        marginRight: 6,
                        marginBottom: 20,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontWeight: "600", color: "#2e8adaff",marginBottom: 6}}>
					  	          {emojis[(selectedLog.selectedEmoji || 1) - 1]}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#666" }}>Emotion</Text>
                    </View>
                  </View>


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
                        marginBottom: 20,
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
                        marginBottom: 20,
                        alignItems: "center",
                      }}
                      >
                      <Text style={{ fontWeight: "600", color: "#2e8adaff", marginBottom: 6 }}>
                        {selectedLog.sleepQuality || "N/A"}/10
                      </Text>
                      <Text style={{ fontSize: 11, color: "#666" }}>Quality</Text>
                    </View>
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

                  {/* Tags */}
                  <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
                    {logTags.length > 0 ? (
                      logTags.map((tag: string, idx: number) => {
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
                      })
                    ) : (
                      <Text style={{ color: "#666" }}>No tags available.</Text>
                    )}
                  </View>
                </View>
              );
            })()}
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