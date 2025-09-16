// app/(tabs)/profile/index.tsx
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";

const BG = "#D6E6FD";
const CARD = "#5C95E9";
const HEAD = "#3C7BD6";
const DARK = "#1b3b82";

const INNER_W = "85%";
const ROW_H = 60;
const PILL_W = 80;
const PILL_H = 32;

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function Row({
  title,
  rightIcon,
  rightText,
  onPress,
}: {
  title: string;
  rightIcon?: IconName;
  rightText?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.9 }]}>
      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.rowText}>
        {title}
      </Text>
      <View style={styles.rightBox}>
        {rightText ? (
          <Text style={styles.rightText}>{rightText}</Text>
        ) : (
          <Ionicons name={rightIcon!} size={20} color={DARK} />
        )}
      </View>
    </Pressable>
  );
}

export default function ProfileHome() {
  const userName = "UserName";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: 48, paddingBottom: 24 }}
    >
      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>
              [{userName}],{"\n"}welcome back!{"\n"}Here’s your personal hub.
            </Text>
          </View>
          <View style={styles.headerRightSlot} />
        </View>

        <View style={styles.list}>
          <Link href="/(tabs)/moodCheckIn" asChild>
            <Row title="Mood Check-in" rightIcon="happy-outline" />
          </Link>

          <Link href="/(tabs)/quickNote" asChild>
            <Row title="Mood Insights" rightIcon="clipboard-outline" />
          </Link>

          <Link href="/(tabs)/Interest" asChild>
            <Row title="Clubs & Events" rightIcon="chatbubble-ellipses-outline" />
          </Link>

          <Link href="/(tabs)/Challenge" asChild>
            <Row title="Challenges" rightIcon="trophy-outline" />
          </Link>

          <Link href="/(tabs)/profile" asChild>
            <Row title="Profile" rightText="view" />
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  inner: {
    width: INNER_W,
    alignSelf: "center",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 160,
    marginBottom: 12,
  },
  headerTextWrap: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 12,
    height: "100%",
  },
  title: {
    color: HEAD,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  headerRightSlot: {
    width: 110,
    height: 110,
  },

  list: { gap: 20 },

  row: {
    width: "100%",
    height: ROW_H,
    backgroundColor: CARD,
    borderRadius: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    alignSelf: "center",
  },
  rowText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
    marginRight: 12,
  },

  rightBox: {
    width: PILL_W,
    height: PILL_H,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  rightText: { color: DARK, fontWeight: "800", fontSize: 12 },
});
