import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Login() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          testID="login-back-btn"
        >
          <Ionicons name="chevron-back" size={24} color="#1A1A2E" />
        </Pressable>
      </View>
      <View style={styles.body} testID="login-screen">
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>
          Welcome back. Sign in to continue to MyShield.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    height: 48,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
});
