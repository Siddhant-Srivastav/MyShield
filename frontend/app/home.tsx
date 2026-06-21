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
import { useRouter, usePathname } from "expo-router";

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
          style={({ pressed }) => [styles.cardWrap, pressed && { opacity: 0.95 }]}
          testID="safety-emergency-card"
        >
          <LinearGradient
            colors={["#F87171", "#DC2626"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.iconBubble}>
              <View style={[styles.iconInner, { backgroundColor: "#FEE2E2" }]}>
                <MaterialCommunityIcons name="shield-alert" size={36} color="#DC2626" />
              </View>
            </View>
            <Text style={styles.cardTitle}>SAFETY EMERGENCY</Text>
            <Text style={styles.cardDesc}>
              For any safety threat, accident, danger or immediate help.
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Medical Emergency card */}
        <Pressable
          onPress={() => router.push("/medical-emergency")}
          style={({ pressed }) => [styles.cardWrap, pressed && { opacity: 0.95 }]}
          testID="medical-emergency-card"
        >
          <LinearGradient
            colors={["#34D399", "#15803D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.iconBubble}>
              <View style={[styles.iconInner, { backgroundColor: "#DCFCE7" }]}>
                <MaterialCommunityIcons name="medical-bag" size={34} color="#15803D" />
              </View>
            </View>
            <Text style={styles.cardTitle}>MEDICAL EMERGENCY</Text>
            <Text style={styles.cardDesc}>
              For medical emergencies, health issues or immediate medical assistance.
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Safety notice */}
        <View style={styles.notice} testID="home-safety-notice">
          <View style={styles.noticeIcon}>
            <Ionicons name="shield-checkmark" size={18} color={BLUE} />
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
    { key: "guidance" as const, label: "Guidance", icon: "compass", path: "/guidance" },
    { key: "contacts" as const, label: "Emergency\nContacts", icon: "people", path: "/contacts" },
    { key: "settings" as const, label: "Settings", icon: "settings-sharp", path: "/settings" },
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
                isActive ? { color: BLUE, fontWeight: "700" } : { color: "#9CA3AF" },
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
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 6 },

  header: { alignItems: "center", marginBottom: 8 },
  logo: { width: 42, height: 42 },
  heading: {
    marginTop: 4,
    fontSize: 26,
    fontWeight: "700",
    color: NAVY,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: MUTED,
    textAlign: "center",
  },

  card: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrap: {
    flex: 1,
    marginTop: 8,
  },
  iconBubble: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  cardDesc: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 6,
  },

  notice: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LIGHT,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  noticeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeTitle: { color: BLUE, fontSize: 13, fontWeight: "700" },
  noticeBody: { color: MUTED, fontSize: 11, marginTop: 1, lineHeight: 14 },

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
