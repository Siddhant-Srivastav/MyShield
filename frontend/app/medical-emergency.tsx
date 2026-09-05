import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://myshield-api.onrender.com"; // Phase 2 me Render URL

export default function MedicalEmergency() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string }>();
  const [userId, setUserId] = useState(params.userId || "");
  const [countdown, setCountdown] = useState(30);
  const [phase, setPhase] = useState<"window" | "sent">("window");
  const activated = useRef(false);

  useEffect(() => {
    (async () => {
      if (!userId) {
        try {
          const raw = await AsyncStorage.getItem("user");
          if (raw) setUserId(JSON.parse(raw).id);
        } catch (e) {}
      }
    })();
  }, []);

  useEffect(() => {
    if (!userId || activated.current) return;
    activated.current = true;
    activate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const activate = async () => {
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      let lat = 0, lon = 0;
      if (perm === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        lat = loc.coords.latitude;
        lon = loc.coords.longitude;
      }
      await fetch(`${API_URL}/api/emergency/medical`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, latitude: lat, longitude: lon }),
      });
    } catch (e) {
      Alert.alert("Connection Error", "Server se connect nahi ho paya.");
    }
  };

  useEffect(() => {
    if (phase !== "window") return;
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          setPhase("sent");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const cancelAlert = async () => {
    const inWindow = countdown > 0;
    setPhase("sent");
    try {
      await fetch(`${API_URL}/api/emergency/cancel/${userId}`, { method: "POST" });
    } catch (e) {}
    Alert.alert(
      "Alert Cancelled ✅",
      inWindow
        ? "30-second window me cancel ho gaya — koi email nahi gayi."
        : "Emergency cancel ho gayi — escalation ruk gayi."
    );
    router.back();
  };

  const STATUS_CARDS = [
    { icon: "map-marker", title: "Last known location", sub: "Your location has been detected" },
    { icon: "message-alert", title: "Emergency email sent", sub: "Alerts sent to your emergency contacts" },
    { icon: "crosshairs-gps", title: "GPS tracking active", sub: "Live location tracking is active" },
    { icon: "account-alert", title: "Alerting emergency contacts", sub: "Your contacts are being notified" },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#1A1A2E" />
        </Pressable>
        <View style={styles.logoRow}>
          <Ionicons name="shield-checkmark" size={22} color="#16A34A" />
          <View>
            <Text style={styles.logoTitle}>MyShield</Text>
            <Text style={styles.logoSub}>Your Safety, Our Mission</Text>
          </View>
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* GREEN BANNER */}
      <View style={styles.bannerWrap}>
        <LinearGradient colors={["#16A34A", "#166534"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
          <View style={styles.sirenBubble}>
            <MaterialCommunityIcons name="medical-bag" size={22} color="#16A34A" />
          </View>
          <Text style={styles.bannerTitle}>MEDICAL EMERGENCY ACTIVATED</Text>
          <Text style={styles.bannerSub}>Help is on the way. Stay calm, you are protected.</Text>
        </LinearGradient>
      </View>

      {phase === "window" ? (
        /* 30-SEC WINDOW */
        <View style={styles.windowWrap}>
          <View style={styles.windowCard}>
            <Text style={styles.windowTitle}>ALERT EMAILS WILL BE SENT IN</Text>
            <View style={styles.timerBubble}>
              <Text style={styles.timerText}>{countdown}</Text>
            </View>
            <Text style={styles.windowSec}>seconds</Text>
            <Text style={styles.windowNote}>
              Cancel within 30 seconds to stop the alert. Otherwise your photo,
              live location & emergency email will be sent to all contacts.
            </Text>
            <Pressable onPress={cancelAlert} style={styles.cancelNowBtn}>
              <Ionicons name="close-circle" size={18} color="#FFFFFF" />
              <Text style={styles.cancelNowText}>CANCEL ALERT</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        /* STATUS */
        <View style={styles.content}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>EMERGENCY STATUS</Text>
            <View style={styles.sectionUnderline} />
          </View>

          {STATUS_CARDS.map((c, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardIcon}>
                <MaterialCommunityIcons name={c.icon as any} size={20} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{c.title}</Text>
                <Text style={styles.cardSub}>{c.sub}</Text>
              </View>
              <View style={styles.checkBubble}>
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              </View>
            </View>
          ))}

          <View style={styles.infoBox}>
            <View style={styles.infoIcon}>
              <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>We are sharing your location in real-time.</Text>
              <Text style={styles.infoSub}>Do not close the app while emergency is active.</Text>
            </View>
          </View>
        </View>
      )}

      {/* BOTTOM: DEMO NOTICE + CANCEL */}
      <View style={styles.bottom}>
        {/* ⬇️ NAYA: DEMO NOTICE */}
        <View style={styles.demoNotice}>
          <Ionicons name="information-circle" size={16} color="#92400E" />
          <Text style={styles.demoNoticeText}>
            This feature is not working now — this is only for demo.
          </Text>
        </View>

        <Pressable onPress={cancelAlert} style={styles.cancelBtn}>
          <View style={styles.cancelIcon}>
            <Ionicons name="close" size={16} color="#16A34A" />
          </View>
          <Text style={styles.cancelText}>CANCEL ALERT</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 8 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoTitle: { fontSize: 16, fontWeight: "800", color: "#16A34A" },
  logoSub: { fontSize: 9, color: "#6B7280" },
  bannerWrap: { paddingHorizontal: 14 },
  banner: { borderRadius: 18, alignItems: "center", paddingVertical: 20, paddingHorizontal: 16 },
  sirenBubble: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  bannerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800", textAlign: "center", letterSpacing: 0.5 },
  bannerSub: { color: "#DCFCE7", fontSize: 11, textAlign: "center", marginTop: 4 },
  windowWrap: { paddingHorizontal: 14, paddingTop: 16 },
  windowCard: { backgroundColor: "#F0FDF4", borderWidth: 2, borderColor: "#16A34A", borderRadius: 18, alignItems: "center", padding: 20 },
  windowTitle: { fontSize: 13, fontWeight: "800", color: "#14532D", letterSpacing: 0.5 },
  timerBubble: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#16A34A", alignItems: "center", justifyContent: "center", marginTop: 12 },
  timerText: { fontSize: 40, fontWeight: "800", color: "#FFFFFF" },
  windowSec: { fontSize: 12, color: "#14532D", fontWeight: "700", marginTop: 6 },
  windowNote: { fontSize: 11, color: "#6B7280", textAlign: "center", marginTop: 12, lineHeight: 16 },
  cancelNowBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#16A34A", borderRadius: 14, paddingVertical: 14, width: "100%", marginTop: 16 },
  cancelNowText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },
  content: { paddingHorizontal: 14, paddingTop: 14 },
  sectionHead: { marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#1A1A2E" },
  sectionUnderline: { width: 34, height: 3, borderRadius: 2, backgroundColor: "#16A34A", marginTop: 4 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EEF1F5", borderRadius: 14, padding: 12, marginBottom: 10, gap: 10 },
  cardIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 13, fontWeight: "800", color: "#1A1A2E" },
  cardSub: { fontSize: 10, color: "#6B7280", marginTop: 2 },
  checkBubble: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#16A34A", alignItems: "center", justifyContent: "center" },
  infoBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#EFF6FF", borderRadius: 14, padding: 12, gap: 10 },
  infoIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#1A56DB", alignItems: "center", justifyContent: "center" },
  infoTitle: { fontSize: 11, fontWeight: "800", color: "#1E3A8A" },
  infoSub: { fontSize: 10, color: "#6B7280", marginTop: 2 },
  bottom: { paddingHorizontal: 14, paddingBottom: 20, paddingTop: 8 },
  demoNotice: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEF3C7", borderWidth: 1, borderColor: "#FCD34D",
    borderRadius: 12, padding: 10, marginBottom: 10,
  },
  demoNoticeText: { flex: 1, fontSize: 11.5, fontWeight: "700", color: "#92400E" },
  cancelBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#16A34A", borderRadius: 14, height: 52, gap: 10 },
  cancelIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  cancelText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },
});