import { View, Text, Pressable, Linking } from "react-native";

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
};

function MapView({ style, children }: any) {
  return (
    <View style={style}>
      <View style={{ padding: 12, alignItems: "center" }}>
        <Text>Map preview is simplified on Web build.</Text>
        <Pressable
          onPress={() => Linking.openURL("https://maps.google.com")}
          style={{ marginTop: 6 }}
        >
          <Text style={{ textDecorationLine: "underline" }}>Open Google Maps</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

export const Marker = (_props: { coordinate: { latitude: number; longitude: number } }) => <View />;
export const PROVIDER_GOOGLE = "google" as const;

export default MapView;
