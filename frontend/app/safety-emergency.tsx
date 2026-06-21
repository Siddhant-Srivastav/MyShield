import { useState } from "react";
import {
  Image,
  Modal,
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
  FontAwesome5,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";

const NAVY = "#0B1E3F";
const BLUE = "#1A56DB";
const MUTED = "#6B7280";
const RED = "#DC2626";
const GREEN = "#16A34A";
const LIGHT_BLUE = "#EEF4FF";

const STATUS_ITEMS: {
  key: string;
  title: string;
  sub: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "location",
    title: "Last known location",
    sub: "Your location has been detected",
    icon: <Ionicons name="location-sharp" size={22} color={GREEN} />,
  },
  {
    key: "sms",
    title: "Emergency SMS sent",
    sub: "SMS alerts have been sent to your emergency contacts",
    icon: <Ionicons name="chatbubble" size={20} color={GREEN} />,
  },
  {
    key: "gps",
    title: "GPS tracking active",
    sub: "Live location tracking is active",
    icon: <FontAwesome5 name="satellite" size={18} color={GREEN} />,
  },
  {
    key: "contacts",
    title: "Alerting emergency contacts",
    sub: "Your contacts are being notified",
    icon: <Ionicons name="people" size={22} color={GREEN} />,
  },
];

export default function SafetyEmergency() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showToast, setShowToast] = useState(false);

  const cancelAlert = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      router.replace("/home");
    }, 1400);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]} testID="safety-emergency-screen">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.replace("/home")}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          testID="safety-back-btn"
        >
          <Ionicons name="arrow-back" size={22} color={NAVY} />
        </Pressable>

        <View style={styles.logoRow}>
          <Image
            source={require("../assets/images/myshield-shield.png")}
            style={styles.logoShield}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.logoText}>
              <Text style={{ color: NAVY }}>My</Text>
              <Text style={{ color: BLUE }}>Shield</Text>
            </Text>
            <Text style={styles.logoTag}>Your Safety, Our Mission</Text>
          </View>
        </View>

        <View style={styles.backBtnPlaceholder} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Red activated card */}
        <LinearGradient
          colors={["#EF4444", "#B91C1C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.redCard}
        >
          <MaterialCommunityIcons name="alarm-light" size={32} color="#FFFFFF" />
          <Text style={styles.redTitle}>SAFETY EMERGENCY ACTIVATED</Text>
          <Text style={styles.redSub}>
            Help is on the way. Stay calm, you are protected.
          </Text>
        </LinearGradient>

        {/* Section title */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>EMERGENCY STATUS</Text>
          <View style={styles.sectionUnderline} />
        </View>

        {/* Status cards */}
        <View style={styles.statusList}>
          {STATUS_ITEMS.map((s) => (
            <View key={s.key} style={styles.statusCard} testID={`status-${s.key}`}>
              <View style={styles.statusIconBubble}>{s.icon}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>{s.title}</Text>
                <Text style={styles.statusSub} numberOfLines={2}>{s.sub}</Text>
              </View>
              <View style={styles.statusCheck}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
            </View>
          ))}
        </View>

        {/* Info box */}
        <View style={styles.infoBox} testID="safety-info-box">
          <View style={styles.infoIcon}>
            <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>We are sharing your location in real-time.</Text>
            <Text style={styles.infoSub}>
              Do not close the app while emergency is active.
            </Text>
          </View>
        </View>
      </View>

      {/* Cancel Alert button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <Pressable
          onPress={cancelAlert}
          style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.9 }]}
          testID="cancel-alert-btn"
        >
          <View style={styles.cancelCircle}>
            <Ionicons name="close" size={16} color={RED} />
          </View>
          <Text style={styles.cancelText}>CANCEL ALERT</Text>
        </Pressable>
      </View>

      {/* Success toast */}
      <Modal visible={showToast} transparent animationType="fade">
        <View style={styles.toastWrap} pointerEvents="none">
          <View style={styles.toast} testID="cancel-success-toast">
            <View style={styles.toastIcon}>
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.toastText}>Alert cancelled successfully</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },

  topBar: {
    height: 52,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backBtnPlaceholder: { width: 36, height: 36 },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoShield: { width: 26, height: 26 },
  logoText: { fontSize: 18, fontWeight: "800" },
  logoTag: { fontSize: 9, color: MUTED, marginTop: -2 },

  body: { flex: 1, paddingHorizontal: 16 },

  redCard: {
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  redTitle: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.4,
    lineHeight: 26,
  },
  redSub: {
    marginTop: 6,
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },

  sectionHead: { marginTop: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: NAVY, letterSpacing: 0.5 },
  sectionUnderline: {
    marginTop: 3,
    width: 60,
    height: 2,
    borderRadius: 2,
    backgroundColor: RED,
  },

  statusList: { marginTop: 8, gap: 7 },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EEF1F5",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 10,
  },
  statusIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  statusTitle: { fontSize: 13, fontWeight: "800", color: NAVY },
  statusSub: { fontSize: 11, color: MUTED, marginTop: 1, lineHeight: 14 },
  statusCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  infoBox: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LIGHT_BLUE,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 10,
  },
  infoIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTitle: { color: NAVY, fontSize: 12, fontWeight: "800" },
  infoSub: { color: MUTED, fontSize: 11, marginTop: 1 },

  bottomBar: { paddingHorizontal: 16, paddingTop: 6 },
  cancelBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  cancelCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },

  toastWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  toastIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  toastText: { color: NAVY, fontSize: 14, fontWeight: "700" },
});
