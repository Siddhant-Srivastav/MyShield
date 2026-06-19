import { Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NAVY = "#0B1E3F";
const BLUE = "#1F7AE0";

export default function Home() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container} testID="home-screen">
        <Text style={styles.welcome} testID="home-welcome-title">
          Welcome to <Text style={styles.brand}>MyShield</Text>
        </Text>
        <Text style={styles.subtitle} testID="home-welcome-subtitle">
          Emergency Response & Safety
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  welcome: {
    fontSize: 28,
    color: NAVY,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: Platform.select({
      ios: "System",
      android: "sans-serif-medium",
      default: "System",
    }),
  },
  brand: {
    color: BLUE,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: NAVY,
    textAlign: "center",
    letterSpacing: 0.4,
  },
});
