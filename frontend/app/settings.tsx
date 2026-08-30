import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomNav } from "./home";


const NAVY = "#111827";
const MUTED = "#6B7280";
const BLUE = "#1A56DB";

const preferenceItems = [
  { title: "Change Language", subtitle: "Choose your preferred language", icon: "language", color: "#1565FF", value: "English" },
  { title: "Edit Contacts", subtitle: "Add, remove or update emergency contacts", icon: "people", color: "#16C02B" },
  { title: "Notification Settings", subtitle: "Manage alert & notification preferences", icon: "notifications", color: "#8B3DFF" },
];

const privacyItems = [
  { title: "Privacy Settings", subtitle: "Control data, permissions & privacy", icon: "shield-lock", color: "#1565FF", type: "MaterialCommunityIcons" },
  { title: "Data & Access", subtitle: "Manage your data and app access", icon: "lock", color: "#FF8A00" },
  { title: "Location Sharing", subtitle: "Manage location sharing preferences", icon: "location-sharp", color: "#16CDB5", value: "Always On" },
];

const otherItems = [
  { title: "Help & Support", subtitle: "Get help and contact support", icon: "help-circle", color: "#4B7CFF" },
  { title: "Terms & Conditions", subtitle: "Read our terms and conditions", icon: "document-text", color: "#5DCB2A" },
  { title: "About MyShield", subtitle: "App version and information", icon: "information-circle", color: "#9CA3AF", value: "v1.0.0" },
];

function SettingRow({ item }: { item: any }) {
  return (
    <Pressable style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.85 }]}>
      <View style={[styles.iconBox, { backgroundColor: item.color }]}>
        {item.type === "MaterialCommunityIcons" ? (
          <MaterialCommunityIcons name={item.icon} size={18} color="#FFFFFF" />
        ) : (
          <Ionicons name={item.icon} size={18} color="#FFFFFF" />
        )}
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
      </View>
      <View style={styles.rightWrap}>
        {item.value ? <Text style={styles.valueText}>{item.value}</Text> : null}
        <Ionicons name="chevron-forward" size={14} color="#8A8FA3" />
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();

  // =========================
  // LOGOUT -> back to Welcome (Login / Create Account)
  // =========================
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("user");
          } catch (e) {
            console.log("Logout clear error:", e);
          }
          router.replace("/welcome");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.body}>
        {/* ===== White header with MyShield logo (same style as Home) ===== */}
        <View style={styles.header}>
          <Image
            source={require("../assets/images/myshield-shield.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.heading}>Settings</Text>
          <Text style={styles.subtitle}>Manage your preferences and privacy.</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* PREFERENCES */}
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.card}>
            {preferenceItems.map((item, index) => (
              <SettingRow key={index} item={item} />
            ))}
          </View>

          {/* PRIVACY & SECURITY */}
          <Text style={styles.sectionTitle}>PRIVACY & SECURITY</Text>
          <View style={styles.card}>
            {privacyItems.map((item, index) => (
              <SettingRow key={index} item={item} />
            ))}
          </View>

          {/* OTHERS */}
          <Text style={styles.sectionTitle}>OTHERS</Text>
          <View style={styles.card}>
            {otherItems.map((item, index) => (
              <SettingRow key={index} item={item} />
            ))}
          </View>

          {/* LOGOUT */}
          <Pressable
  style={styles.logoutBtn}
  onPress={async () => {
    try {
      await AsyncStorage.removeItem("user");
    } catch (e) {
      console.log("Logout error:", e);
    }
    router.replace("/welcome");
  }}
>
  <MaterialIcons name="logout" size={22} color="#FF4D4D" />
  <Text style={styles.logoutText}>Logout</Text>
</Pressable>
        </ScrollView>
      </View>
      <BottomNav active="settings" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  body: { flex: 1, paddingHorizontal: 14, paddingTop: 4 },
  header: { alignItems: "center", marginBottom: 4 },
  logo: { width: 36, height: 36 },
  heading: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: "700",
    color: NAVY,
    textAlign: "center",
  },
  subtitle: { marginTop: 1, fontSize: 11, color: MUTED, textAlign: "center" },
  content: { paddingBottom: 10 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: BLUE,
    marginTop: 8,
    marginBottom: 5,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#EEF1F5",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  textWrap: { flex: 1 },
  settingTitle: { fontSize: 13, fontWeight: "700", color: NAVY },
  settingSubtitle: { marginTop: 1, fontSize: 10, lineHeight: 13, color: MUTED },
  rightWrap: { flexDirection: "row", alignItems: "center", gap: 5 },
  valueText: { color: BLUE, fontWeight: "700", fontSize: 10 },
  logoutBtn: {
    marginTop: 8,
    marginBottom: 4,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFD7D7",
    backgroundColor: "#FFF5F5",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },
  logoutText: { color: "#FF4D4D", fontWeight: "700", fontSize: 13 },
});