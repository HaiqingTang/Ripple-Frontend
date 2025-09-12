// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform, SafeAreaView } from 'react-native';

const BLUE_BG = '#DDE7FF';

export default function TabsLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BLUE_BG }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#111',
          tabBarInactiveTintColor: '#111',
          tabBarItemStyle: { flex: 1 },
          tabBarStyle: {
            height: 64,
            backgroundColor: BLUE_BG,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            paddingTop: 8,
            paddingBottom: Platform.OS === 'ios' ? 14 : 10,
            position: 'absolute', left: 0, right: 0, bottom: 0,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
          },
        }}
      >
        <Tabs.Screen
          name="personalLog/index"
          options={{ tabBarIcon: ({ color }) =>
            <Ionicons name="happy-outline" size={28} color={color} /> }}
        />
        <Tabs.Screen
          name="Interest/index"
          options={{ tabBarIcon: ({ color }) =>
            <Ionicons name="chatbubble-ellipses-outline" size={28} color={color} /> }}
        />
        <Tabs.Screen
          name="Challenge/index"
          options={{ tabBarIcon: ({ color }) =>
            <Ionicons name="trophy-outline" size={28} color={color} /> }}
        />
        <Tabs.Screen
          name="profile/index"
          options={{ tabBarIcon: ({ color }) =>
            <Ionicons name="person-outline" size={28} color={color} /> }}
        />
      </Tabs>
    </SafeAreaView>
  );
}