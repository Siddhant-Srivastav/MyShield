import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const NAVY = "#0B1E3F";
const BLUE = "#1A56DB";
const MUTED = "#6B7280";
const RED = "#DC2626";
const LIGHT_RED = "#FEE2E2";
const LIGHT_BLUE = "#EEF4FF";
const GREEN = "#16A34A";

function PulseRing({
  delay,
  size,
  color = "rgba(220,38,38,0.35)",
}: {
  delay: number;
  size: number;
  color?: string;
}) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.4,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.5, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [delay, scale, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

export default function MedicalEmergency() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showToast, setShowToast] = useState(false);
  const [seconds, setSeconds] = useState(8);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const cancelAlert = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      router.replace("/home");
    }, 1400);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]} testID="medical-emergency-screen">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.replace("/home")}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          testID="medical-back-btn"
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

      <View style={styles.body}>
        {/* Red activated card */}
        <LinearGradient
          colors={["#EF4444", "#B91C1C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.redCard}
        >
          <View style={styles.crossBubble}>
            <MaterialCommunityIcons name="medical-bag" size={20} color={RED} />
          </View>
          <Text style={styles.redTitle}>MEDICAL EMERGENCY ACTIVATED</Text>
          <Text style={styles.redSub}>
            Stay calm. Emergency medical services are being contacted.
          </Text>
        </LinearGradient>

        {/* Live status */}
        <Text style={styles.sectionTitle}>LIVE STATUS</Text>
        <View style={styles.statusCard} testID="live-status-card">
          <View style={styles.phoneBubble}>
            <Ionicons name="call" size={18} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>Calling Ambulance Service (104)</Text>
            <Text style={styles.statusSub}>Your call is being connected...</Text>
          </View>
        </View>

        {/* Calling block */}
        <View style={styles.callBlock}>
          <Text style={styles.callerLabel}>Calling Ambulance Helpline</Text>
          <Text style={styles.callerNumber}>104</Text>

          <View style={styles.callBtnWrap}>
            <PulseRing delay={0} size={150} />
            <PulseRing delay={600} size={150} />
            <PulseRing delay={1200} size={150} />
            <View style={styles.callBtn}>
              <Ionicons name="call" size={28} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.duration}>
            Call Duration: {mm}:{ss}
          </Text>
          <View style={styles.callingRow}>
            <View style={styles.greenDot} />
            <Text style={styles.callingText}>Calling...</Text>
          </View>
        </View>

        {/* Cancel button */}
        <Pressable
          onPress={cancelAlert}
          style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.85 }]}
          testID="cancel-emergency-btn"
        >
          <View style={styles.cancelCircle}>
            <Ionicons name="close" size={14} color={RED} />
          </View>
          <Text style={styles.cancelText}>CANCEL EMERGENCY</Text>
        </Pressable>

        {/* Info box */}
        <View style={styles.infoBox} testID="medical-info-box">
          <View style={styles.infoIcon}>
            <Ionicons name="lock-closed" size={14} color={BLUE} />
          </View>
          <Text style={styles.infoText}>
            Please keep your phone nearby and stay connected while emergency services are responding.
          </Text>
        </View>
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
    height: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { width: 36, height: 36, alignItems: "flex-start", justifyContent: "center" },
  backBtnPlaceholder: { width: 36, height: 36 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoShield: { width: 26, height: 26 },
  logoText: { fontSize: 18, fontWeight: "800" },
  logoTag: { fontSize: 9, color: MUTED, marginTop: -2 },

  body: { flex: 1, paddingHorizontal: 16 },

  redCard: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  crossBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  redTitle: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.4,
    lineHeight: 22,
  },
  redSub: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 14,
    opacity: 0.95,
  },

  sectionTitle: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "800",
    color: NAVY,
    letterSpacing: 0.5,
  },
  statusCard: {
    marginTop: 6,
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
  phoneBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
  },
  statusTitle: { fontSize: 13, fontWeight: "800", color: NAVY },
  statusSub: { fontSize: 11, color: MUTED, marginTop: 1 },

  callBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  callerLabel: { fontSize: 13, fontWeight: "700", color: NAVY },
  callerNumber: {
    fontSize: 52,
    fontWeight: "900",
    color: RED,
    letterSpacing: 1,
    marginTop: 0,
    marginBottom: 4,
  },
  callBtnWrap: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 2,
  },
  callBtn: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: RED,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  duration: { marginTop: 6, fontSize: 13, fontWeight: "700", color: NAVY },
  callingRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN },
  callingText: { fontSize: 12, color: MUTED, marginLeft: 6 },

  cancelBtn: {
    marginTop: 6,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: RED,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  cancelCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: RED,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { color: RED, fontSize: 14, fontWeight: "800", letterSpacing: 0.5 },

  infoBox: {
    marginTop: 8,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LIGHT_BLUE,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: { flex: 1, fontSize: 11, color: NAVY, lineHeight: 15 },

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

// Silence the unused LIGHT_RED warning (kept for potential future use of the inner light-red bubble).
void LIGHT_RED;
