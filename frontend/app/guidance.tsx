import { StatusBar, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const BLUE = "#1A56DB";
const NAVY = "#1A1A2E";
const MUTED = "#6B7280";

export default function GuidanceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.root} testID="guidance-screen">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7FA" />

      {/* Top Logo */}
      <View style={styles.logoWrap}>
        <Ionicons name="shield-checkmark" size={42} color={BLUE} />
      </View>

      {/* Heading */}
      <Text style={styles.title}>Guidance</Text>
      <Text style={styles.subtitle}>
        Get the right guidance when you need it most.
      </Text>

      {/* Healthcare Assistant Card */}
      <Pressable
        onPress={() => router.push("/healthcare-assistant")}
        style={({ pressed }) => [
          styles.card,
          styles.blueCard,
          pressed && { opacity: 0.92 },
        ]}
        testID="healthcare-assistant-btn"
      >
        <View style={styles.circleGlow}>
          <MaterialIcons name="medical-services" size={70} color="#FFFFFF" />
        </View>

        <Text style={styles.cardTitle}>HEALTHCARE ASSISTANT</Text>

        <Text style={styles.cardDesc}>
          Get immediate first-aid guidance and emergency health support.
        </Text>

        <View style={styles.arrowWrap}>
          <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
        </View>
      </Pressable>

      {/* Route Guidance Card */}
      <View style={[styles.card, styles.greenCard]}>
        <View style={styles.circleGlowGreen}>
          <Feather name="map-pin" size={68} color="#FFFFFF" />
        </View>

        <Text style={styles.cardTitle}>ROUTE GUIDANCE</Text>

        <Text style={styles.cardDesc}>
          Get safer route suggestions and alerts about high-risk areas.
        </Text>

        <View style={styles.arrowWrap}>
          <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {/* Home */}
        <Pressable
          onPress={() => router.push("/home")}
          style={styles.navItem}
        >
          <Ionicons name="home" size={22} color="#6B7280" />
          <Text style={styles.navText}>Home</Text>
        </Pressable>

        {/* Guidance */}
        <View style={styles.navItem}>
          <Ionicons name="compass" size={22} color={BLUE} />
          <Text style={[styles.navText, { color: BLUE, fontWeight: "700" }]}>
            Guidance
          </Text>
        </View>

        {/* Emergency Contacts */}
        <Pressable
          onPress={() => router.push("/emergency-contacts")}
          style={styles.navItem}
        >
          <Ionicons name="people" size={22} color="#6B7280" />
          <Text style={styles.navText}>Emergency Contacts</Text>
        </Pressable>

        {/* Settings */}
        <Pressable
          onPress={() => router.push("/settings")}
          style={styles.navItem}
        >
          <Ionicons name="settings" size={22} color="#6B7280" />
          <Text style={styles.navText}>Settings</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F4F7FA",
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  logoWrap: {
    alignItems: "center",
    marginTop: 4,
  },

  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: NAVY,
    marginTop: 6,
  },

  subtitle: {
    textAlign: "center",
    fontSize: 13,
    color: MUTED,
    marginTop: 6,
    marginBottom: 18,
  },

  card: {
    width: "100%",
    height: 250,
    borderRadius: 26,
    marginBottom: 22,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },

  blueCard: {
    backgroundColor: "#062BCE",
  },

  greenCard: {
    backgroundColor: "#048A35",
  },

  circleGlow: {
    width: 145,
    height: 145,
    borderRadius: 72.5,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#7DD3FC",
    shadowOpacity: 0.7,
    shadowRadius: 20,
  },

  circleGlowGreen: {
    width: 145,
    height: 145,
    borderRadius: 72.5,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#86EFAC",
    shadowOpacity: 0.7,
    shadowRadius: 20,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  cardDesc: {
    color: "#FFFFFF",
    fontSize: 13,
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 28,
    lineHeight: 19,
  },

  arrowWrap: {
    position: "absolute",
    right: 18,
    top: "50%",
    marginTop: -12,
  },

  bottomNav: {
    height: 72,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginHorizontal: -16,
    marginTop: "auto",
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },

  navText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },
});

