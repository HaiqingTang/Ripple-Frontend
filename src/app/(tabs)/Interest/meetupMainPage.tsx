import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ImageBackground,
  FlatList,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  limit,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // subscribe auth changes
import { db, auth } from "../../../firebase";
import { SafeAreaView } from "react-native-safe-area-context";

type Meetup = {
  id: string;
  title: string;
  date: string;
  location?: string;
  description?: string;
  category?: string;
  creatorId?: string;
  participants: string[];
};

export default function MeetupMainPage() {
  const router = useRouter();

  // top hero meetup states
  const [top, setTop] = useState<Meetup | null>(null);
  const [loadingTop, setLoadingTop] = useState(true); // loading for top subscription
  const [topError, setTopError] = useState<string | null>(null); // non-blocking error banner

  // my meetups states
  const [myMeetups, setMyMeetups] = useState<Meetup[]>([]);
  const [loadingMy, setLoadingMy] = useState(true); // loading for my meetups list
  const [myError, setMyError] = useState<string | null>(null); // non-blocking error banner

  // subscribe TOP hero (latest meetup) with error callback
  useEffect(() => {
    setLoadingTop(true);
    setTopError(null);
    const q1 = query(collection(db, "meetups"), orderBy("date", "desc"), limit(1));

    // use onSnapshot(next, error) to surface issues instead of silent failures
    const unsub = onSnapshot(
      q1,
      (snap) => {
        const d = snap.docs[0];
        if (!d) {
          setTop(null);
          setLoadingTop(false);
          return;
        }
        const data = d.data() as any;
        const dateStr =
          typeof data.date?.toDate === "function"
            ? toDisplayDate(data.date.toDate())
            : String(data.date ?? "");
        setTop({
          id: d.id,
          title: data.title ?? "",
          date: dateStr,
          location: data.location,
          description: data.description,
          category: data.category,
          creatorId: data.creatorId,
          participants: Array.isArray(data.participants) ? data.participants : [],
        });
        setLoadingTop(false);
      },
      (err) => {
        // non-blocking banner; keep page usable
        setTopError("Failed to load featured meetup.");
        setTop(null);
        setLoadingTop(false);
      }
    );
    return () => unsub();
  }, []);

  // subscribe MY meetups; resubscribe on auth changes, not just on mount
  useEffect(() => {
    // keep reference to the current meetups unsubscribe
    let meetupsUnsub: (() => void) | null = null;

    // ensure proper lifecycle: subscribe/unsubscribe when auth user changes
    const authUnsub = onAuthStateChanged(auth, (user) => {
      // clear previous listener when user switches
      if (meetupsUnsub) {
        meetupsUnsub();
        meetupsUnsub = null;
      }

      setLoadingMy(true);
      setMyError(null);
      setMyMeetups([]);

      if (!user) {
        // no user: nothing to subscribe; show empty state quickly
        setLoadingMy(false);
        return;
      }

      const q2 = query(
        collection(db, "meetups"),
        where("participants", "array-contains", user.uid),
        orderBy("date", "desc"),
        limit(4)
      );

      // use onSnapshot(next, error) to handle failures explicitly
      meetupsUnsub = onSnapshot(
        q2,
        (snap) => {
          const list: Meetup[] = [];
          snap.forEach((d) => {
            const data = d.data() as any;
            const dateStr =
              typeof data.date?.toDate === "function"
                ? toDisplayDate(data.date.toDate())
                : String(data.date ?? "");
            list.push({
              id: d.id,
              title: data.title ?? "",
              date: dateStr,
              location: data.location,
              description: data.description,
              category: data.category,
              creatorId: data.creatorId,
              participants: Array.isArray(data.participants) ? data.participants : [],
            });
          });
          setMyMeetups(list);
          setLoadingMy(false);
        },
        (err) => {
          // non-blocking banner; keep page usable
          setMyError("Failed to load your meetups.");
          setMyMeetups([]);
          setLoadingMy(false);
        }
      );
    });

    // cleanup both listeners
    return () => {
      if (meetupsUnsub) meetupsUnsub();
      authUnsub();
    };
  }, []);

  const onAdd = () => router.push("/(tabs)/Interest/newMeetup");
  const onOpenTop = () => {
    if (!top) return;
    router.push({ pathname: "/(tabs)/Interest/meetupDetail1", params: { id: top.id } });
  };
  const onOpenMeetup = (m: Meetup) => {
    router.push({ pathname: "/(tabs)/Interest/meetupDetail1", params: { id: m.id } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={() => router.replace("/(tabs)/Interest")}>
            <Ionicons name="chevron-back" size={22} color="#2c3e50" />
          </Pressable>
          <Text style={styles.title}>Meetups 🌐</Text>
          <Pressable hitSlop={8} onPress={onAdd}>
            <Ionicons name="add" size={22} color="#3b82f6" />
          </Pressable>
        </View>

        {/* Optional non-blocking error banner for TOP */}
        {topError && (
          <View style={styles.warnRow}>
            <Ionicons name="alert-circle-outline" size={16} color="#d84535" />
            <Text style={styles.warnText}>{topError}</Text>
          </View>
        )}

        {/* Hero card (show loading/placeholder if needed) */}
        <Pressable onPress={onOpenTop} disabled={!top} style={{ paddingHorizontal: 16 }}>
          <ImageBackground
            source={{
              uri:
                "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1400&q=60",
            }}
            style={styles.hero}
            imageStyle={{ borderRadius: 16 }}
          >
            <View style={styles.heroBadge}>
              <Text style={{ fontWeight: "800", color: "#FF5A3E" }}>🔥 HOT</Text>
            </View>
            <View style={styles.heroOverlay} />
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroDate}>
                {loadingTop ? "Loading…" : top ? top.date : "—"}
              </Text>
              <Text style={styles.heroTitle}>
                {loadingTop ? "Loading meetup…" : top ? top.title : "No Meetup"}
              </Text>
            </View>
          </ImageBackground>
        </Pressable>

        {/* My Meetups */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>My Meetups</Text>
            <Pressable
              style={styles.allBtn}
              onPress={() => router.push("/(tabs)/Interest/myMeetups")}
            >
              <Text style={styles.allText}>All Meetups</Text>
              <Feather name="chevron-right" size={16} color="#6b7280" />
            </Pressable>
          </View>

          {/* Optional non-blocking error banner for MY meetups */}
          {myError && (
            <View style={[styles.warnRow, { marginHorizontal: 6, marginTop: 8 }]}>
              <Ionicons name="alert-circle-outline" size={16} color="#d84535" />
              <Text style={styles.warnText}>{myError}</Text>
            </View>
          )}

          {/* Loading state for my meetups */}
          {loadingMy ? (
            <View style={{ paddingHorizontal: 12, paddingVertical: 12 }}>
              {/* very light skeletons: keep UI simple without extra libs */}
              <View style={styles.skeletonRow} />
              <View style={[styles.skeletonRow, { marginTop: 8, width: "78%" }]} />
              <View style={[styles.skeletonRow, { marginTop: 8, width: "88%" }]} />
            </View>
          ) : myMeetups.length === 0 ? (
            // Empty state with CTA to explore
            <View style={{ paddingHorizontal: 12, paddingVertical: 14 }}>
              <Text style={styles.emptyTitle}>No meetups yet</Text>
              <Text style={styles.emptyText}>
                Join or create your first meetup. You can explore popular events now.
              </Text>
              <Pressable
                style={styles.moreBtn}
                onPress={() => router.push("/(tabs)/Interest/allMeetups")}
              >
                <Text style={styles.moreText}>Explore more meetups</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={myMeetups}
              keyExtractor={(i) => i.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              renderItem={({ item }) => (
                <Pressable onPress={() => onOpenMeetup(item)} style={styles.meetupRow}>
                  <Text style={styles.meetupName}>{item.title}</Text>
                  <Text style={styles.meetupDate}>{item.date}</Text>
                </Pressable>
              )}
              contentContainerStyle={{ paddingTop: 6, paddingBottom: 6 }}
            />
          )}
        </View>

        <View style={{ height: 16 }} />
        <Pressable
          style={styles.moreBtn}
          onPress={() => router.push("/(tabs)/Interest/allMeetups")}
        >
          <Text style={styles.moreText}>Explore more meetups</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function toDisplayDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}/${mm}/${yy}`;
}

const BG = "#dbe7ff";
const CARD_BG = "#C6DBFA";
const BLUE_TEXT = "#345BCE";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 20, fontWeight: "800", color: "#1f2937" },

  // non-blocking inline warning banner
  warnRow: {
    marginHorizontal: 16,
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffeceb",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  warnText: { color: "#d84535", fontWeight: "700" },

  hero: { height: 220, borderRadius: 16, overflow: "hidden", marginTop: 12 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)" },
  heroTextWrap: { position: "absolute", bottom: 16, left: 16, right: 16 },
  heroDate: { color: "#fff", fontWeight: "800", fontSize: 18, marginBottom: 4 },
  heroTitle: { color: "#fff", fontWeight: "900", fontSize: 28 },
  heroBadge: {
    position: "absolute",
    right: 12,
    top: 12,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  card: {
    marginTop: 12,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: CARD_BG,
  },
  cardHeader: {
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { fontSize: 16, fontWeight: "800", color: BLUE_TEXT },
  allBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  allText: { color: "#6b7280", fontSize: 12, fontWeight: "600" },

  // simple skeleton block (no external libs)
  skeletonRow: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f0f4ff",
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
  meetupName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  meetupDate: { fontSize: 12, fontWeight: "700", color: "#6b7280" },

  moreBtn: {
    marginHorizontal: 16,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#e9f0ff",
    alignItems: "center",
    justifyContent: "center",
  },
  moreText: { fontSize: 16, fontWeight: "800", color: "#345BCE" },

  // empty state copy + CTA
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#1f2937", marginBottom: 6 },
  emptyText: { fontSize: 13, color: "#42566b", marginBottom: 10 },
});
