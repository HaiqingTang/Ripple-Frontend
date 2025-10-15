import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Platform,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { db, auth } from "../../../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

type Reward = {
  id: string;
  title: string;
  subtitle: string;
  logoUri: string;
  description: string;
  validUntil: string; // ISO
  value?: string;
  redeemed?: boolean;
  terms?: string[];
  expired?: boolean; // 新增：后端可选字段，便于回写
};

/* ---------- 日期工具：与 rewardDetail 保持一致 ---------- */
function parseISODateSafe(iso?: string | null): Date | null {
  if (!iso) return null;
  const ymd = iso.match(/^\d{4}-\d{2}-\d{2}$/);
  try {
    if (ymd) return new Date(`${iso}T00:00:00.000Z`);
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/** 过期判断：到期日 **包含该日的 23:59:59.999(UTC)** */
function isExpiredUTC(validUntilISO?: string): boolean {
  if (!validUntilISO) return false;
  const parsed = parseISODateSafe(validUntilISO);
  if (!parsed) return false;
  const end = new Date(parsed);
  end.setUTCHours(23, 59, 59, 999);
  return Date.now() > end.getTime();
}

export default function MyRewards() {
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // error state for list subscription + manual retry tick
  const [listError, setListError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const uid = auth.currentUser?.uid || null;

  useEffect(() => {
    if (!uid) return;

    setLoading(true);
    setListError(null);

    const ref = collection(db, "users", uid, "rewards");
    const qRef = query(ref, orderBy("issuedAt", "desc"));
    const unsub = onSnapshot(
      qRef,
      (snap) => {
        const items: Reward[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as any;
          items.push({
            id: docSnap.id,
            title: d.title || "Untitled Reward",
            subtitle: d.subtitle || "",
            logoUri:
              d.logoUri ||
              "https://cdn-icons-png.flaticon.com/512/1047/1047711.png",
            description: d.description || "",
            validUntil: d.validUntil || "",
            value: d.value || "",
            redeemed: d.redeemed || false,
            terms: Array.isArray(d.terms) ? d.terms : undefined,
            expired: Boolean(d.expired),
          });
        });
        setRewards(items);
        setLoading(false);
        setListError(null);
      },
      // error callback: capture message and stop loading
      (err) => {
        console.error("myRewards onSnapshot error:", err);
        setLoading(false);
        setListError(
          err?.message ||
            "Failed to load rewards. Please check your connection or Firestore rules/indexes."
        );
      }
    );

    return () => unsub();
  }, [reloadTick, uid]); // re-subscribe on retry

  // diacritic-insensitive lowercasing
  const diacriticFold = (s: string) =>
    (s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // ✅ 自动回写：把“已过期但未兑换”的奖励标记为 expired=true（一次遍历批量写回）
  useEffect(() => {
    if (!uid || rewards.length === 0) return;

    const updates = rewards
      .filter((r) => !r.redeemed && isExpiredUTC(r.validUntil) && !r.expired)
      .map((r) =>
        updateDoc(doc(db, "users", uid, "rewards", r.id), {
          expired: true,
          expiredAt: serverTimestamp(),
        }).catch((e) => {
          // 静默失败：不影响 UI
          console.warn("auto-expire update failed:", r.id, e?.message || e);
        })
      );

    if (updates.length > 0) {
      Promise.all(updates).catch(() => {});
    }
  }, [uid, rewards]);

  // filter & grouping（使用 isExpiredUTC + redeemed）
  const { activeList, expiredList } = useMemo(() => {
    const queryText = diacriticFold(q);

    const match = (r: Reward) =>
      !queryText ||
      diacriticFold(r.title).includes(queryText) ||
      diacriticFold(r.subtitle).includes(queryText) ||
      diacriticFold(r.description).includes(queryText);

    const act: Reward[] = [];
    const exp: Reward[] = [];
    for (const r of rewards) {
      if (!match(r)) continue;
      const expired = r.redeemed === true || isExpiredUTC(r.validUntil);
      (expired ? exp : act).push(r);
    }
    return { activeList: act, expiredList: exp };
  }, [rewards, q]);

  // back button
  const goBackToIndex = () => {
    router.replace("/(tabs)/Challenge");
  };

  const renderCard = (r: Reward, faded?: boolean) => (
    <Pressable
      key={r.id}
      style={[styles.card, faded && { opacity: 0.6 }]}
      onPress={() =>
        router.push({
          pathname: "/(tabs)/Challenge/rewardDetail",
          params: {
            id: r.id,
            title: r.title,
            subtitle: r.subtitle,
            description: r.description,
            logoUri: r.logoUri,
            validUntil: r.validUntil,
            value: r.value ?? "",
            terms: r.terms ? JSON.stringify(r.terms) : undefined,
          },
        })
      }
    >
      <View style={styles.row}>
        <Image source={{ uri: r.logoUri }} style={styles.logo} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{r.title}</Text>
          {r.subtitle ? <Text style={styles.subtitle}>{r.subtitle}</Text> : null}
          {r.validUntil ? (
            <Text style={styles.valid}>
              Valid until{" "}
              {(() => {
                const d = parseISODateSafe(r.validUntil);
                return d
                  ? d.toLocaleDateString("en-AU", {
                      timeZone: "UTC",
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                    })
                  : new Date(r.validUntil).toLocaleDateString("en-AU");
              })()}
            </Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color="#6B7AFF" />
      </View>

      {r.description ? (
        <Text style={styles.desc} numberOfLines={2}>
          {r.description}
        </Text>
      ) : null}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.headerRow}>
        <Pressable hitSlop={10} onPress={goBackToIndex}>
          <Ionicons name="chevron-back" size={24} color="#6B7AFF" />
        </Pressable>
        <Text style={styles.headerTitle}>My rewards</Text>
        <View style={{ width: 24, height: 24 }} />
      </View>

      {/* search bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#6B7AFF" />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#9CA3AF"
          value={q}
          onChangeText={setQ}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      {/* error empty-state with retry */}
      {!!listError && !loading ? (
        <View style={styles.emptyBox}>
          <Ionicons name="warning-outline" size={54} color="#EF4444" />
          <Text style={[styles.emptyText, { marginTop: 10 }]}>{listError}</Text>
          <Pressable
            onPress={() => setReloadTick((t) => t + 1)}
            style={{
              marginTop: 14,
              backgroundColor: "#6B7AFF",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>Retry</Text>
          </Pressable>
        </View>
      ) : loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} color="#6B7AFF" size="large" />
      ) : (activeList.length + expiredList.length) === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="sparkles-outline" size={60} color="#A0A0A0" />
          <Text style={styles.emptyText}>No rewards yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Active */}
          <Text style={styles.sectionTitle}>Active ({activeList.length})</Text>
          {activeList.map((r) => renderCard(r, false))}

          {/* Expired */}
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
            Expired ({expiredList.length})
          </Text>
          {expiredList.map((r) => renderCard(r, true))}
        </ScrollView>
      )}
    </View>
  );
}

const BLUE = "#DDE7FF";
const DEEP = "#6B7AFF";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLUE,
    paddingTop: Platform.select({ ios: 54, android: 22 }),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: DEEP,
  },

  // search
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#111827",
    paddingVertical: 2,
  },

  sectionTitle: {
    marginTop: 14,
    marginBottom: 6,
    marginHorizontal: 18,
    fontSize: 18,
    fontWeight: "900",
    color: "#3A56C0",
  },

  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    paddingHorizontal: 22,
  },
  emptyText: { color: "#777", marginTop: 12, fontWeight: "600", textAlign: "center" },

  card: {
    backgroundColor: "#EEF3FF",
    marginHorizontal: 18,
    marginVertical: 10,
    borderRadius: 20,
    padding: 18,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: { width: 60, height: 60, borderRadius: 12, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "800", color: DEEP },
  subtitle: { color: "#64748b", marginTop: 2 },
  valid: { color: "#1f2937", marginTop: 4, fontWeight: "600" },
  desc: { marginTop: 8, color: "#374151", lineHeight: 18, fontSize: 14 },
});
