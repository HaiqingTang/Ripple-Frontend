// app/(tabs)/Interest/allMeetups.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// 🔁 Firestore
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../../firebase";

/** ================= Types ================= */
type Category =
  | "All"
  | "Arts"
  | "Food"
  | "Lifestyle"
  | "Music"
  | "Sports"
  | "Study"
  | "Travel";

type Meetup = {
  id: string;
  title: string;
  date: string; // display-only (formatted)
  category?: Category; // from Firestore; unknown值会当作 "All" 集合参与
  location?: string;
  description?: string;
  creatorId?: string;
  participants?: string[];
};

/** 固定的分类标签（保持你原有 UI） */
const CATEGORIES: Category[] = [
  "All",
  "Arts",
  "Food",
  "Lifestyle",
  "Music",
  "Sports",
  "Study",
  "Travel",
];

/** 将 Firestore 字段转成显示用字符串日期 dd/MM/yy */
function toDisplayDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}/${mm}/${yy}`;
}

export default function AllMeetupsPage() {
  const router = useRouter();

  const [queryText, setQueryText] = useState("");
  const [active, setActive] = useState<Category>("All");
  const [items, setItems] = useState<Meetup[]>([]); // ← Firestore 数据装到这里

  // 🔁 实时读取 Firestore：按 date 倒序
  useEffect(() => {
    const q = query(collection(db, "meetups"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const next: Meetup[] = snap.docs.map((d) => {
        const data = d.data() as any;
        const dateStr =
          typeof data.date?.toDate === "function"
            ? toDisplayDate(data.date.toDate())
            : String(data.date ?? "");
        // 把后端 category（字符串）兜底到我们已知的枚举里
        const rawCat = String(data.category ?? "").trim();
        const cat = (CATEGORIES.includes(rawCat as Category)
          ? rawCat
          : undefined) as Category | undefined;

        return {
          id: d.id,
          title: data.title ?? "",
          date: dateStr,
          category: cat,
          location: data.location,
          description: data.description,
          creatorId: data.creatorId,
          participants: Array.isArray(data.participants) ? data.participants : [],
        };
      });
      setItems(next);
    });
    return () => unsub();
  }, []);

  /** === 先按分类，再按搜索词过滤（完全保留你原来的交互） === */
  const filtered = useMemo(() => {
    // 分类
    let arr =
      active === "All"
        ? items
        : items.filter((m) => (m.category || "All") === active);

    // 搜索
    const q = queryText.trim().toLowerCase();
    if (!q) return arr;
    return arr.filter((m) => m.title.toLowerCase().includes(q));
  }, [active, queryText, items]);

  const onView = (m: Meetup) => {
    // 这里还是占位逻辑；等详情页就换成 router.push('/path/[id]')
    Alert.alert("View", `Open details: ${m.title}`);
  };

  const onCreate = () => {
    // 这里保持原占位；等“新建 Meetup”页面完成后替换为路由跳转
    Alert.alert("Create", "Go to create meetup (placeholder)");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 32, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            hitSlop={8}
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace("/(tabs)/Interest");
            }}
          >
            <Ionicons name="chevron-back" size={22} color="#2c3e50" />
          </Pressable>
          <Text style={styles.title}>All Meetups</Text>
          <Pressable hitSlop={8} onPress={onCreate}>
            <Ionicons name="add" size={22} color="#3b82f6" />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            placeholder="Search meetups..."
            placeholderTextColor="#9aa3b2"
            style={styles.searchInput}
            value={queryText}
            onChangeText={setQueryText}
          />
        </View>

        {/* Category Chips（完全按你原有样式保留） */}
        <View style={styles.chipsWrap}>
          {CATEGORIES.map((c) => {
            const isActive = c === active;
            return (
              <Pressable
                key={c}
                onPress={() => setActive(c)}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}
                >
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 列表（来自 Firestore 的 filtered 数据） */}
        <View style={{ paddingHorizontal: 16, marginTop: 6 }}>
          {filtered.map((item) => (
            <View key={item.id} style={styles.meetupRow}>
              <Text style={styles.meetupName}>{item.title}</Text>
              <View style={styles.rightWrap}>
                <Text style={styles.meetupDate}>{item.date}</Text>
                <Pressable style={styles.viewBtn} onPress={() => onView(item)}>
                  <Text style={styles.viewText}>View</Text>
                  <Feather name="arrow-right" size={14} color="#345BCE" />
                </Pressable>
              </View>
            </View>
          ))}

          {filtered.length === 0 && (
            <Text style={styles.empty}>No meetups found.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** ================= Styles（保持你原样式） ================= */
const BG = "#dbe7ff";
const CARD_BG = "#ffffff";
const CHIP_BG = "#e5e7eb";
const CHIP_ACTIVE_BG = "#111827";
const BLUE_TEXT = "#345BCE";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
  },

  searchBox: {
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },

  chipsWrap: {
    marginHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: CHIP_BG,
  },
  chipActive: {
    backgroundColor: CHIP_ACTIVE_BG,
  },
  chipText: { fontSize: 12, fontWeight: "700", color: "#111827" },
  chipTextActive: { color: "#fff" },

  meetupRow: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  meetupName: { fontSize: 15, fontWeight: "700", color: "#111827" },

  rightWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  meetupDate: { fontSize: 12, fontWeight: "700", color: "#6b7280" },

  viewBtn: {
    backgroundColor: "#e9f0ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewText: { fontSize: 12, fontWeight: "700", color: BLUE_TEXT },

  empty: { textAlign: "center", color: "#6b7280", marginTop: 16 },
});
