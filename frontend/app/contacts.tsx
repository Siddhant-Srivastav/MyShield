import { StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNav } from "./home";

export default function Contacts() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="contacts-screen">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.body}>
        <Text style={styles.title}>Emergency Contacts</Text>
        <Text style={styles.subtitle}>
          Your trusted contacts who will be alerted in an emergency.
        </Text>
      </View>
      <BottomNav active="contacts" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  title: { fontSize: 28, fontWeight: "700", color: "#1A1A2E" },
  subtitle: { marginTop: 8, fontSize: 14, color: "#6B7280", lineHeight: 20 },
});
