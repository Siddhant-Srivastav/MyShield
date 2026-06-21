import { StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNav } from "./home";

export default function Guidance() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="guidance-screen">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.body}>
        <Text style={styles.title}>Guidance</Text>
        <Text style={styles.subtitle}>
          Safety tips, emergency procedures and how-to videos.
        </Text>
      </View>
      <BottomNav active="guidance" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  title: { fontSize: 28, fontWeight: "700", color: "#1A1A2E" },
  subtitle: { marginTop: 8, fontSize: 14, color: "#6B7280", lineHeight: 20 },
});
