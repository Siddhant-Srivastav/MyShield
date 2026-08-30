import {
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";

const NAVY = "#111827";
const MUTED = "#6B7280";
const BLUE = "#1A56DB";
const LIGHT = "#EEF4FF";

export default function Home() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="home-screen">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.body}>
        {/* Top: logo + heading + subtitle */}
        <View style={styles.header}>
          <Image
            source={require("../assets/images/myshield-shield.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.heading} testID="home-heading">
            How can we help you?
          </Text>
          <Text style={styles.subtitle}>
            Choose the type of emergency you are facing.
          </Text>
        </View>

        {/* Safety Emergency card */}
        <Pressable
          onPress={() => router.push("/safety-emergency")}
          style={({ pressed }) => [
            styles.cardWrap,
            pressed && { opacity: 0.95 },
          ]}
          testID="safety-emergency-card"
        >
          <LinearGradient
            colors={["#DC2626", "#991B1B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.iconBubble}>
              <View style={[styles.iconInner, { backgroundColor: "#FEE2E2" }]}>
                <MaterialCommunityIcons
                  name="shield-alert"
                  size={34}
                  color="#B91C1C"
                />
              </View>
            </View>
            <Text style={styles.cardTitle}>SAFETY EMERGENCY</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>
              For any safety threat, accident, danger or immediate help.
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Medical Emergency card */}
        <Pressable
          onPress={() => router.push("/medical-emergency")}
          style={({ pressed }) => [
            styles.cardWrap,
            styles.cardWrapSecond,
            pressed && { opacity: 0.95 },
          ]}
          testID="medical-emergency-card"
        >
          <LinearGradient
            colors={["#16A34A", "#166534"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.iconBubble}>
              <View style={[styles.iconInner, { backgroundColor: "#DCFCE7" }]}>
                <MaterialCommunityIcons
                  name="medical-bag"
                  size={32}
                  color="#15803D"
                />
              </View>
            </View>
            <Text style={styles.cardTitle}>MEDICAL EMERGENCY</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>
              For medical emergencies, health issues or immediate medical
              assistance.
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Safety notice */}
        <View style={styles.notice} testID="home-safety-notice">
          <View style={styles.noticeIcon}>
            <Ionicons name="shield-checkmark" size={16} color={BLUE} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>We are here to protect you.</Text>
            <Text style={styles.noticeBody}>
              Use these options only in real emergencies. Stay safe!
            </Text>
          </View>
        </View>
      </View>
      <BottomNav active="home" />
    </SafeAreaView>
  );
}

export function BottomNav({
  active,
}: {
  active: "home" | "guidance" | "contacts" | "settings";
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items = [
    { key: "home" as const, label: "Home", icon: "home", path: "/home" },
    {
      key: "guidance" as const,
      label: "Guidance",
      icon: "compass",
      path: "/guidance",
    },
    {
      key: "contacts" as const,
      label: "Emergency\nContacts",
      icon: "people",
      path: "/contacts",
    },
    {
      key: "settings" as const,
      label: "Settings",
      icon: "settings-sharp",
      path: "/settings",
    },
  ];
  return (
    <View
      style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}
      testID="bottom-nav"
    >
      {items.map((it) => {
        const isActive = it.key === active;
        return (
          <Pressable
            key={it.key}
            onPress={() => router.replace(it.path as never)}
            style={({ pressed }) => [styles.tab, pressed && { opacity: 0.7 }]}
            testID={`tab-${it.key}`}
          >
            <Ionicons
              name={it.icon as never}
              size={22}
              color={isActive ? BLUE : "#9CA3AF"}
            />
            <Text
              style={[
                styles.tabLabel,
                isActive
                  ? { color: BLUE, fontWeight: "700" }
                  : { color: "#9CA3AF" },
              ]}
              numberOfLines={2}
            >
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
  header: { alignItems: "center", marginBottom: 6 },
  logo: { width: 36, height: 36 },
  heading: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: "700",
    color: NAVY,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: MUTED,
    textAlign: "center",
  },
  /* Cards flex to fill the screen -> NO scrolling needed */
  cardWrap: { flex: 1 },
  cardWrapSecond: { marginTop: 12 },
  card: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBubble: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.7)",
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  cardDesc: {
    marginTop: 3,
    color: "#FFFFFF",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 15,
    paddingHorizontal: 8,
  },
  notice: {
    marginTop: 10,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LIGHT,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  noticeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeTitle: { color: BLUE, fontSize: 12, fontWeight: "700" },
  noticeBody: { color: MUTED, fontSize: 10, marginTop: 1, lineHeight: 13 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEF1F5",
    paddingTop: 6,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 4, gap: 2 },
  tabLabel: { fontSize: 10, marginTop: 2, textAlign: "center", lineHeight: 12 },
});