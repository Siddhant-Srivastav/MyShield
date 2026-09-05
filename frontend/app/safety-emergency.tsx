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

const API_URL = "https://myshield-api.onrender.com";

export default function SafetyEmergency() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string }>();
  const [userId, setUserId] = useState(params.userId || "");
  const [status, setStatus] = useState<"sending" | "sent" | "failed">("sending");
  const activated = useRef(false);

  // User ID lo (params ya AsyncStorage se)
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

  // Ek baar emergency trigger karo
  useEffect(() => {
    if (!userId || activated.current) return;
    activated.current = true;
    trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const trigger = async () => {
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== "granted") {
        setStatus("failed");
        Alert.alert(
          "Location Permission Needed",
          "Please allow location access so we can send your live location to contacts."
        );
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const res = await fetch(`${API_URL}/api/emergency/safety`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("sent");
      } else {
        setStatus("failed");
        Alert.alert("Alert Failed", data.message || "Could not send emergency alert.");
      }
    } catch (e) {
      setStatus("failed");
      Alert.alert("Connection Error", "Unable to reach server. Check backend is running.");
    }
  };

  const cancelAlert = async () => {
    try {
      await fetch(`${API_URL}/api/emergency/cancel/${userId}`, { method: "POST" });
    } catch (e) {}
    router.back();
  };

  const sent = status === "sent";

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
          <Ionicons name="shield-checkmark" size={22} color="#1A56DB" />
          <View>
            <Text style={styles.logoTitle}>MyShield</Text>
            <Text style={styles.logoSub}>Your Safety, Our Mission</Text>
          </View>
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* RED BANNER */}
      <View style={styles.bannerWrap}>
        <LinearGradient
          colors={["#EF4444", "#B91C1C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.sirenBubble}>
            <MaterialCommunityIcons name="alarm-light" size={22} color="#DC2626" />
          </View>
          <Text style={styles.bannerTitle}>SAFETY EMERGENCY ACTIVATED</Text>
          <Text style={styles.bannerSub}>Help is on the way. Stay calm, you are protected.</Text>
        </LinearGradient>
      </View>

      {/* STATUS SECTION */}
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
            {status === "sending" ? (
              <ActivityIndicator size="small" color="#16A34A" />
            ) : (
              <View style={[styles.checkBubble, !sent && { backgroundColor: "#FEE2E2" }]}>
                <Ionicons
                  name={sent ? "checkmark" : "close"}
                  size={14}
                  color={sent ? "#FFFFFF" : "#DC2626"}
                />
              </View>
            )}
          </View>
        ))}

        {/* INFO BOX */}
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

      {/* CANCEL BUTTON */}
      <View style={styles.bottom}>
        <Pressable onPress={cancelAlert} style={styles.cancelBtn}>
          <View style={styles.cancelIcon}>
            <Ionicons name="close" size={16} color="#DC2626" />
          </View>
          <Text style={styles.cancelText}>CANCEL ALERT</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoTitle: { fontSize: 16, fontWeight: "800", color: "#1A56DB" },
  logoSub: { fontSize: 9, color: "#6B7280" },
  bannerWrap: { paddingHorizontal: 14 },
  banner: {
    borderRadius: 18,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  sirenBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  bannerSub: {
    color: "#FECACA",
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },
  content: { paddingHorizontal: 14, paddingTop: 14 },
  sectionHead: { marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#1A1A2E" },
  sectionUnderline: {
    width: 34,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#DC2626",
    marginTop: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEF1F5",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 13, fontWeight: "800", color: "#1A1A2E" },
  cardSub: { fontSize: 10, color: "#6B7280", marginTop: 2 },
  checkBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1A56DB",
    alignItems: "center",
    justifyContent: "center",
  },
  infoTitle: { fontSize: 11, fontWeight: "800", color: "#1E3A8A" },
  infoSub: { fontSize: 10, color: "#6B7280", marginTop: 2 },
  bottom: { paddingHorizontal: 14, paddingBottom: 20, paddingTop: 8 },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    borderRadius: 14,
    height: 52,
    gap: 10,
  },
  cancelIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },
});