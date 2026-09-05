import { useEffect, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { BottomNav } from "./home";

const WEBSITE_URL = "https://myshield.ai.studio";
const SUPPORT_EMAIL = "myshield360@gmail.com";

export default function SettingsScreen() {
  const router = useRouter();
  const [locationOn, setLocationOn] = useState(true);
  const [langModal, setLangModal] = useState(false);
  const [locModal, setLocModal] = useState(false);
  const [helpModal, setHelpModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const val = await AsyncStorage.getItem("location_sharing");
        setLocationOn(val !== "off");
      } catch (e) {}
    })();
  }, []);

  const toggleLocation = async (value: boolean) => {
    setLocationOn(value);
    try {
      await AsyncStorage.setItem("location_sharing", value ? "on" : "off");
    } catch (e) {}
  };

  const openWebsite = () => Linking.openURL(WEBSITE_URL);
  const openEmail = () => Linking.openURL(`mailto:${SUPPORT_EMAIL}`);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      router.replace("/login");
    } catch (e) {}
  };

  const Row = ({
    icon, color, title, subtitle, right, onPress,
  }: {
    icon: any; color: string; title: string; subtitle: string;
    right?: string; onPress: () => void;
  }) => (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.rowIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={18} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{subtitle}</Text>
      </View>
      {right ? <Text style={styles.rowRight}>{right}</Text> : null}
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../assets/images/myshield-shield.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.heading}>Settings</Text>
          <Text style={styles.subtitle}>Manage your preferences and privacy.</Text>
        </View>

        {/* PREFERENCES */}
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.card}>
          <Row
            icon="language" color="#1A56DB"
            title="Change Language" subtitle="Choose your preferred language"
            right="English" onPress={() => setLangModal(true)}
          />
          <View style={styles.divider} />
          <Row
            icon="people" color="#2ECC71"
            title="Edit Contacts" subtitle="Add, remove or update emergency contacts"
            onPress={() => router.push("/contacts")}
          />
          <View style={styles.divider} />
          <Row
            icon="notifications" color="#B46BFF"
            title="Notification Settings" subtitle="Manage alert & notification preferences"
            onPress={() =>
              AlertInfo(
                "Notification Settings",
                "Emergency notifications are always ON for your safety. You cannot disable them."
              )
            }
          />
        </View>

        {/* PRIVACY & SECURITY */}
        <Text style={styles.sectionTitle}>PRIVACY & SECURITY</Text>
        <View style={styles.card}>
          <Row
            icon="shield-checkmark" color="#1A56DB"
            title="Privacy Settings" subtitle="Control data, permissions & privacy"
            onPress={() =>
              AlertInfo(
                "Privacy Settings",
                "Your data is encrypted and is only used during an emergency to alert your contacts."
              )
            }
          />
          <View style={styles.divider} />
          <Row
            icon="document-text" color="#FF6B2C"
            title="Data & Access" subtitle="Manage your data and app access"
            onPress={() =>
              AlertInfo(
                "Data & Access",
                "MyShield accesses your camera, photo and location only when needed for emergency assistance."
              )
            }
          />
          <View style={styles.divider} />
          <Row
            icon="location" color="#2ECC71"
            title="Location Sharing" subtitle="Manage location sharing preferences"
            right={locationOn ? "Always" : "Off"}
            onPress={() => setLocModal(true)}
          />
        </View>

        {/* OTHERS */}
        <Text style={styles.sectionTitle}>OTHERS</Text>
        <View style={styles.card}>
          <Row
            icon="help-circle" color="#1A56DB"
            title="Help & Support" subtitle="Get help and contact support"
            onPress={() => setHelpModal(true)}
          />
          <View style={styles.divider} />
          <Row
            icon="document-text" color="#2ECC71"
            title="Terms & Conditions" subtitle="Read our terms and conditions"
            onPress={openWebsite}
          />
          <View style={styles.divider} />
          <Row
            icon="information-circle" color="#9CA3AF"
            title="About MyShield" subtitle="App version and information"
            right="v1.0.0" onPress={openWebsite}
          />
        </View>

        {/* Logout */}
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>

      {/* ===== LANGUAGE MODAL ===== */}
      <Modal visible={langModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose Language</Text>
            <Pressable
              style={styles.langRow}
              onPress={() => setLangModal(false)}
            >
              <Text style={styles.langText}>English</Text>
              <Ionicons name="checkmark-circle" size={22} color="#1A56DB" />
            </Pressable>
            <Text style={styles.modalNote}>More languages coming soon!</Text>
            <Pressable style={styles.closeBtn} onPress={() => setLangModal(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ===== LOCATION MODAL ===== */}
      <Modal visible={locModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Location Sharing</Text>
            <Text style={styles.modalDesc}>
              Allow MyShield to share your live location with emergency contacts
              during an emergency.
            </Text>
            <View style={styles.locRow}>
              <View>
                <Text style={styles.locTitle}>{locationOn ? "Always" : "Off"}</Text>
                <Text style={styles.locSub}>
                  {locationOn
                    ? "Location will be shared in emergencies"
                    : "Location will NOT be shared"}
                </Text>
              </View>
              <Switch
                value={locationOn}
                onValueChange={toggleLocation}
                trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                thumbColor={locationOn ? "#1A56DB" : "#F4F3F4"}
              />
            </View>
            <Pressable style={styles.closeBtn} onPress={() => setLocModal(false)}>
              <Text style={styles.closeBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ===== HELP MODAL ===== */}
      <Modal visible={helpModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.helpIconBubble}>
              <Ionicons name="mail" size={26} color="#1A56DB" />
            </View>
            <Text style={styles.modalTitle}>Help & Support</Text>
            <Text style={styles.modalDesc}>
              For any query or help, you can send mail to{"\n"}
              <Text style={styles.emailText}>{SUPPORT_EMAIL}</Text>
            </Text>
            <Pressable style={styles.emailBtn} onPress={openEmail}>
              <Ionicons name="send" size={16} color="#FFFFFF" />
              <Text style={styles.emailBtnText}>Send Email</Text>
            </Pressable>
            <Pressable style={styles.closeBtn} onPress={() => setHelpModal(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <BottomNav active="settings" />
    </SafeAreaView>
  );
}

function AlertInfo(title: string, message: string) {
  // simple alert helper (Alert import needed)
  require("react-native").Alert.alert(title, message);
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F4F7FA" },
  content: { paddingBottom: 16 },
  header: { alignItems: "center", paddingVertical: 18 },
  logo: { width: 46, height: 46 },
  heading: { marginTop: 6, fontSize: 24, fontWeight: "800", color: "#111827" },
  subtitle: { marginTop: 2, fontSize: 12, color: "#6B7280" },
  sectionTitle: {
    fontSize: 11, fontWeight: "800", color: "#1A56DB",
    letterSpacing: 0.6, marginHorizontal: 20, marginBottom: 6, marginTop: 10,
  },
  card: {
    marginHorizontal: 16, backgroundColor: "#FFFFFF",
    borderRadius: 16, paddingHorizontal: 14,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 },
  rowIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  rowTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  rowSub: { fontSize: 10.5, color: "#6B7280", marginTop: 1 },
  rowRight: { fontSize: 12, color: "#1A56DB", fontWeight: "600", marginRight: 4 },
  divider: { height: 1, backgroundColor: "#F1F3F6", marginLeft: 48 },
  logoutBtn: {
    marginHorizontal: 16, marginTop: 18, backgroundColor: "#FEF2F2",
    borderRadius: 14, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  logoutText: { color: "#DC2626", fontSize: 14, fontWeight: "700" },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center", alignItems: "center",
  },
  modalCard: {
    width: "85%", backgroundColor: "#FFFFFF", borderRadius: 20,
    padding: 20, alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  modalDesc: {
    fontSize: 12.5, color: "#6B7280", textAlign: "center",
    lineHeight: 19, marginTop: 8,
  },
  modalNote: { fontSize: 11, color: "#9CA3AF", marginTop: 10 },
  langRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    width: "100%", backgroundColor: "#EEF4FF", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, marginTop: 14,
  },
  langText: { fontSize: 15, fontWeight: "700", color: "#1A56DB" },
  locRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    width: "100%", backgroundColor: "#F9FAFB", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, marginTop: 14,
  },
  locTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  locSub: { fontSize: 10.5, color: "#6B7280", marginTop: 2 },
  helpIconBubble: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: "#EEF4FF",
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  emailText: { color: "#1A56DB", fontWeight: "800" },
  emailBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#1A56DB", borderRadius: 12,
    paddingHorizontal: 22, paddingVertical: 12, marginTop: 14,
  },
  emailBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  closeBtn: {
    marginTop: 12, paddingHorizontal: 26, paddingVertical: 10,
    borderRadius: 12, backgroundColor: "#F3F4F6",
  },
  closeBtnText: { color: "#374151", fontSize: 13, fontWeight: "700" },
});