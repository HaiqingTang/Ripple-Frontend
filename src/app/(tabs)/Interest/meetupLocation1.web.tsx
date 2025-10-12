import { View, Text, Pressable, Linking } from "react-native";

export default function MeetupLocation1Web() {
  const googleMapUrl =
    "https://www.google.com/maps/search/?api=1&query=Melbourne%20CBD";

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>
        Map Preview (Web)
      </Text>
      <Text>
        The native map component is simplified in the web preview. Click the button below to open and navigate in Google Maps.
      </Text>
      <Pressable
        onPress={() => Linking.openURL(googleMapUrl)}
        style={{
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 10,
          borderWidth: 1,
        }}
      >
        <Text>Open in Google Maps</Text>
      </Pressable>
    </View>
  );
}
