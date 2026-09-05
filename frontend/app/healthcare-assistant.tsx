import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const NAVY = "#1A1A2E";
const BLUE = "#1A56DB";
const MUTED = "#6B7280";

type Disease = {
  id: string;
  title: string;
  subtitle: string;
  colors: [string, string];
  iconType: "mci" | "fa5";
  icon: string;
  route?: string;
  params?: Record<string, string>;   // ⬅️ NAYA: extra params (jaise id)
};

// ============ MAIN DISEASES (as per Figma) ============
const MAIN_DISEASES: Disease[] = [
  { id: "heart", title: "Heart Attack", subtitle: "Chest pain, heaviness, shortness of breath", colors: ["#FF5E7E", "#E62E5C"], iconType: "mci", icon: "heart-pulse", route: "/guidelines" },
  { id: "paralysis", title: "Paralysis", subtitle: "Sudden weakness or loss of muscle control", colors: ["#A855F7", "#7E22CE"], iconType: "fa5", icon: "brain", route: "/paralysis" },
  { id: "stroke", title: "Brain Stroke", subtitle: "Sudden numbness, confusion, trouble speaking", colors: ["#FB923C", "#EA580C"], iconType: "fa5", icon: "brain", route: "/brain-stroke" },
{ id: "kidney", title: "Kidney Failure", subtitle: "Swelling, fatigue, low urine output", colors: ["#4ADE80", "#16A34A"], iconType: "mci", icon: "water", route: "/kidney-failure" },
  { id: "stone", title: "Kidney Stone Pain", subtitle: "Severe pain in side or lower back, burning urination", colors: ["#2DD4BF", "#0D9488"], iconType: "mci", icon: "water-outline" },
  // ⬇️ SNAKE BITE: route + params add kiya
  { id: "snake", title: "Snake Bite", subtitle: "Pain, swelling, poisoning symptoms", colors: ["#34D399", "#059669"], iconType: "mci", icon: "snake", route: "/snake-bite" },
  { id: "asthma", title: "Asthma Attack", subtitle: "Breathing difficulty, wheezing, tight chest", colors: ["#60A5FA", "#2563EB"], iconType: "mci", icon: "lungs", route: "/asthma" },
  { id: "fracture", title: "Fracture", subtitle: "Severe pain, swelling, unable to move", colors: ["#FBBF24", "#D97706"], iconType: "fa5", icon: "bone", route: "/fracture" },
];

// ============ EXTRA DISEASES (shown on "View All" — replace with your final list later) ============
const EXTRA_DISEASES: Disease[] = [
  { id: "fever", title: "High Fever", subtitle: "High temperature, chills, body ache", colors: ["#F87171", "#DC2626"], iconType: "mci", icon: "thermometer" },
  { id: "choking", title: "Choking", subtitle: "Blocked airway, cannot breathe", colors: ["#38BDF8", "#0369A1"], iconType: "mci", icon: "alert-circle", route: "/choking-guidelines" },
  { id: "heatstroke", title: "Heat Stroke", subtitle: "Dizziness, hot skin, confusion", colors: ["#FACC15", "#CA8A04"], iconType: "mci", icon: "weather-sunny", route: "/heat-stroke" },
 { id: "poisoning", title: "Food Poisoning", subtitle: "Vomiting, cramps, diarrhea", colors: ["#4ADE80", "#15803D"], iconType: "mci", icon: "food-apple", route: "/food-poisoning" },
];

// ============ WAVEFORM (animated while listening) ============
function Waveform({ active }: { active: boolean }) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (active) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1.7, duration: 320, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.6, duration: 320, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
    anim.setValue(1);
  }, [active, anim]);

  const heights = [10, 16, 24, 32, 24, 34, 24, 32, 24, 16, 10];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
      {heights.map((h, i) => (
        <Animated.View
          key={i}
          style={{
            width: 3,
            height: h,
            borderRadius: 2,
            backgroundColor: active ? "#2563EB" : "#C3CFEC",
            transform: [{ scaleY: active ? anim : 1 }],
          }}
        />
      ))}
    </View>
  );
}

export default function HealthcareAssistant() {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const [listening, setListening] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const listenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (listenTimer.current) clearTimeout(listenTimer.current);
    };
  }, []);

  const diseases = showAll ? [...MAIN_DISEASES, ...EXTRA_DISEASES] : MAIN_DISEASES;

  // ============ OPEN GUIDANCE FOR A DISEASE (UPDATED) ============
  const openGuidance = (d: Disease, speak = false) => {
    if (d.route) {
      // Merge disease-specific params + speak flag
      const params = {
        ...(d.params || {}),
        speak: speak ? "true" : "false",
      };
      router.push({
        pathname: d.route as any,
        params,
      });
    } else {
      Alert.alert(d.title, `Guidelines for "${d.title}" will be added soon.`);
    }
  };

  // ============ MIC ============
  const toggleMic = () => {
    if (listening) {
      if (listenTimer.current) clearTimeout(listenTimer.current);
      setListening(false);
      return;
    }
    setListening(true);
    listenTimer.current = setTimeout(() => {
      setListening(false);
      setPickerVisible(true);
    }, 3500);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ===== TOP BAR with BACK button ===== */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="arrow-back" size={22} color={NAVY} />
        </Pressable>
        <Image
          source={require("../assets/images/myshield-shield.png")}
          style={styles.topLogo}
          resizeMode="contain"
        />
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* ===== TITLE ===== */}
        <Text style={styles.heading}>Health Assistant</Text>
        <Text style={styles.subtitle}>Select a condition or speak to search</Text>

        {/* ===== VOICE CARD ===== */}
        <View style={styles.voiceCard}>
          <Waveform active={listening} />
          <View style={styles.micWrap}>
            {listening && <View style={styles.micPulse} />}
            <Pressable
              onPress={toggleMic}
              style={({ pressed }) => [styles.micBtn, pressed && { opacity: 0.85 }]}
            >
              <LinearGradient
                colors={["#4A8DFF", "#1A56DB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.micGradient}
              >
                <Ionicons name="mic" size={26} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
          </View>
          <Waveform active={listening} />
          <Text style={styles.voiceTitle}>
            {listening ? "Listening... speak now" : "Speak your symptoms or disease"}
          </Text>
          <Text style={styles.voiceSub}>Tap the mic and speak (e.g. "Fever", "Diabetes")</Text>
        </View>

        {/* ===== SECTION HEADER ===== */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Major Diseases</Text>
          <Pressable onPress={() => setShowAll(!showAll)} hitSlop={10} style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>{showAll ? "Show Less" : "View All"}</Text>
            <Ionicons name="chevron-forward" size={14} color={BLUE} />
          </Pressable>
        </View>

        {/* ===== 3-COLUMN DISEASE GRID (clickable) ===== */}
        <View style={styles.grid}>
          {diseases.map((d) => (
            <Pressable
              key={d.id}
              onPress={() => openGuidance(d)}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
            >
              <LinearGradient colors={d.colors} style={styles.iconCircle}>
                {d.iconType === "fa5" ? (
                  <FontAwesome5 name={d.icon as any} size={24} color="#FFFFFF" />
                ) : (
                  <MaterialCommunityIcons name={d.icon as any} size={26} color="#FFFFFF" />
                )}
              </LinearGradient>
              <Text style={styles.cardTitle}>{d.title}</Text>
              <Text style={styles.cardSub}>{d.subtitle}</Text>
            </Pressable>
          ))}
        </View>

        {/* ===== PRIVACY BOX ===== */}
        <Pressable style={styles.privacyBox}>
          <View style={styles.lockBubble}>
            <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.privacyTitle}>Your Privacy is Important</Text>
            <Text style={styles.privacyText}>
              We only use this information to provide safety features. Your data is encrypted and
              never shared with anyone.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={BLUE} />
        </Pressable>
      </ScrollView>

      {/* ===== VOICE DEMO PICKER ===== */}
      <Modal transparent visible={pickerVisible} animationType="fade" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Voice Demo</Text>
            <Text style={styles.modalSub}>
              Real speech recognition will work in the final APK build. For now, tap the disease you spoke:
            </Text>
            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {diseases.map((d) => (
                <Pressable
                  key={d.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setPickerVisible(false);
                    openGuidance(d, true);   // 👈 voice flow → auto speak
                  }}
                >
                  <View style={[styles.modalDot, { backgroundColor: d.colors[1] }]} />
                  <Text style={styles.modalItemText}>{d.title}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.modalCancel} onPress={() => setPickerVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  backBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  topLogo: { width: 34, height: 34 },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  heading: { textAlign: "center", fontSize: 22, fontWeight: "800", color: "#1E3A8A", marginTop: 4 },
  subtitle: { textAlign: "center", fontSize: 12, color: MUTED, marginTop: 4, marginBottom: 14 },

  voiceCard: {
    backgroundColor: "#F5F8FF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E3EBFF",
    paddingHorizontal: 12,
    paddingVertical: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
  },
  micWrap: { width: 72, height: 72, alignItems: "center", justifyContent: "center" },
  micPulse: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(26,86,219,0.18)",
  },
  micBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: "hidden",
    shadowColor: "#1A56DB",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  micGradient: { flex: 1, alignItems: "center", justifyContent: "center" },
  voiceTitle: {
    width: "100%",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "800",
    color: "#1E3A8A",
    marginTop: 12,
  },
  voiceSub: { width: "100%", textAlign: "center", fontSize: 11, color: MUTED, marginTop: 3 },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: NAVY },
  viewAllBtn: { flexDirection: "row", alignItems: "center" },
  viewAllText: { color: BLUE, fontSize: 12, fontWeight: "700", marginRight: 2 },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: {
    width: "31.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  cardTitle: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "800",
    color: "#1E3A8A",
    marginBottom: 4,
  },
  cardSub: { textAlign: "center", fontSize: 9.5, color: MUTED, lineHeight: 13 },

  privacyBox: {
    marginTop: 6,
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  lockBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  privacyTitle: { fontSize: 13, fontWeight: "800", color: BLUE },
  privacyText: { fontSize: 10.5, color: "#4B5563", marginTop: 3, lineHeight: 15 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 },
  modalCard: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 18 },
  modalTitle: { fontSize: 16, fontWeight: "800", color: NAVY, textAlign: "center" },
  modalSub: { fontSize: 11, color: MUTED, textAlign: "center", marginTop: 4, marginBottom: 12, lineHeight: 15 },
  modalItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  modalDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  modalItemText: { fontSize: 13, fontWeight: "700", color: NAVY },
  modalCancel: { marginTop: 12, alignItems: "center", paddingVertical: 8 },
  modalCancelText: { color: BLUE, fontSize: 13, fontWeight: "700" },
});