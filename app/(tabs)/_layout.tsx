import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  bg: "#C9D7FF",
  active: "#4A66C2",
  inactive: "#8FA0CC",
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.active,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: {
          // 关键改动：贴紧底部
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.bg,
          borderTopWidth: 0,
          borderRadius: 0,                 
          height: 56 + insets.bottom,      
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 10),
          elevation: 0,
          shadowOpacity: 0,
        },
        sceneStyle: { backgroundColor: "#DDE7FF" },
      }}
    >
      <Tabs.Screen
        name="personalLog/index"
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" color={color} size={size ?? 26} /> }}
      />
      <Tabs.Screen
        name="Interest"
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses-outline" color={color} size={size ?? 26} /> }}
      />
      <Tabs.Screen
        name="Challenge"
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="trophy-outline" color={color} size={size ?? 26} /> }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size ?? 26} /> }}
      />
    </Tabs>
  );
}
