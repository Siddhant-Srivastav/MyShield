import { useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";

const BLUE = "#1A56DB";
const RED = "#DC2626";
const ORANGE = "#EA580C";

type Step = { n: number; title: string; points: string[]; img: any };

const STEPS: Step[] = [
  {
    n: 1,
    title: "तुरंत ठंडी जगह पर ले जाएं",
    points: [
      "व्यक्ति को छाया या AC जगह पर लेटाएं",
      "कपड़े ढीले करें और पंखा/हवा की व्यवस्था करें",
      "भीड़ हटा दें",
    ],
    img: require("../assets/images/heat-shade.png"),
  },
  {
    n: 2,
    title: "अनावश्यक कपड़े हटाएँ",
    points: [
      "टोपी, जैकेट, स्वेटर, टाइट कपड़े आदि हटा दें",
      "शरीर को हवा लगने दें",
    ],
    img: require("../assets/images/heat-clothes.png"),
  },
  {
    n: 3,
    title: "ठंडा पानी डालें और हवा करें",
    points: [
      "शरीर पर ठंडा पानी डालें या गीला कपड़ा रखें",
      "पंखे से हवा करें ताकि ठंडक मिले",
    ],
    img: require("../assets/images/heat-water.png"),
  },
  {
    n: 4,
    title: "ठंडे पानी/ice packs लगाएँ",
    points: [
      "गर्दन, बगल (armpits) और जांघों के बीच (groin) पर ठंडी पट्टी/ice packs लगाएं",
    ],
    img: require("../assets/images/heat-ice.png"),
  },
  {
    n: 5,
    title: "यदि होश में है तो ठंडा पानी/ORS दें",
    points: [
      "अगर व्यक्ति होश में है तो थोड़ा-थोड़ा ठंडा पानी पिलाएं",
      "ORS या नमक-चीनी वाला पानी भी दे सकते हैं",
      "बहुत तेज़ी से न पिलाएं",
    ],
    img: require("../assets/images/heat-ors.png"),
  },
  {
    n: 6,
    title: "लगातार ध्यान रखें",
    points: [
      "व्यक्ति को अकेला न छोड़ें, उसकी स्थिति पर नज़र रखें",
      "सांस और होश की जांच करते रहें",
    ],
    img: require("../assets/images/heat-monitor.png"),
  },
  {
    n: 7,
    title: "बेहोश हो जाए तो CPR दें",
    points: [
      "यदि व्यक्ति बेहोश हो और सांस न ले तो CPR शुरू करें",
      "जल्द से जल्द hospital ले जाएं",
    ],
    img: require("../assets/images/heat-cpr.png"),
  },
  {
    n: 8,
    title: "जल्दी मेडिकल सहायता लें",
    points: [
      "Heat stroke एक medical emergency है",
      "तुरंत ambulance बुलाएं या नज़दीकी hospital जाएं / MyShield App का उपयोग करें",
    ],
    img: require("../assets/images/heat-hospital.png"),
  },
];

const DONTS = [
  "बुखार की दवा (जैसे paracetamol) न दें",
  "बेहोश व्यक्ति को पानी न पिलाएं",
  "शराब या caffeine न दें",
  "व्यक्ति को गर्म जगह पर न रखें",
  "देरी न करें — तुरंत मेडिकल मदद लें",
];

export default function HeatStroke() {
  const router = useRouter();
  const [speaking, setSpeaking] = useState(false);
  const [rate] = useState(1);   // Normal speed

  const stopAll = () => {
    Speech.stop();
    setSpeaking(false);
  };

  const fullText = () => {
    const parts = ["हीट स्ट्रोक — आपातकालीन मार्गदर्शन। हीट स्ट्रोक एक गंभीर स्थिति है और जानलेवा हो सकती है। तुरंत निर्देशों का पालन करें।"];
    STEPS.forEach((s) => parts.push(`चरण ${s.n}। ${s.title}।`, ...s.points));
    parts.push("ये गलतियाँ न करें।", ...DONTS);
    return parts.join(" ");
  };

  const listenAll = () => {
    if (speaking) {
      stopAll();
      return;
    }
    setSpeaking(true);
    Speech.speak(fullText(), {
      language: "hi-IN",
      rate,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const listenStep = (s: Step) => {
    stopAll();
    Speech.speak(`${s.title}। ${s.points.join("। ")}`, { language: "hi-IN", rate });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Pressable onPress={() => { stopAll(); router.back(); }} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={20} color="#1A1A2E" />
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="sunny" size={28} color={ORANGE} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              <Text style={{ color: "#1A1A2E" }}>HEAT </Text>
              <Text style={{ color: ORANGE }}>STROKE</Text>
            </Text>
            <Text style={styles.subtitle}>— आपातकालीन मार्गदर्शन —</Text>
          </View>
        </View>
        <Text style={styles.desc}>
          Heat stroke एक गंभीर स्थिति है और जानलेवा हो सकती है।{"\n"}
          इन निर्देशों का तुरंत पालन करें और जल्द से जल्द मेडिकल सहायता लें।
        </Text>

        {/* LISTEN ALL */}
        <Pressable onPress={listenAll} style={[styles.listenBtn, speaking && { backgroundColor: "#9A3412" }]}>
          <Ionicons name={speaking ? "stop" : "volume-high"} size={20} color="#FFFFFF" />
          <Text style={styles.listenText}>{speaking ? "SUNNA BAND KARO" : "🔊 PURI GUIDELINE SUNO"}</Text>
        </Pressable>

        {/* STEPS WITH VISUALS */}
        {STEPS.map((s) => (
          <View key={s.n} style={styles.card}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{s.n}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              {s.points.map((p, i) => (
                <Text key={i} style={styles.stepPoint}>• {p}</Text>
              ))}
            </View>
            <View style={styles.cardRight}>
              <Image source={s.img} style={styles.stepImg} resizeMode="cover" />
              <Pressable onPress={() => listenStep(s)} style={styles.stepSpeak}>
                <Ionicons name="volume-high" size={14} color={ORANGE} />
              </Pressable>
            </View>
          </View>
        ))}

        {/* DON'TS */}
        <View style={styles.dontsBox}>
          <View style={styles.dontsHead}>
            <Ionicons name="close-circle" size={18} color="#FFFFFF" />
            <Text style={styles.dontsTitle}>ये गलतियाँ न करें</Text>
          </View>
          {DONTS.map((d, i) => (
            <Text key={i} style={styles.dontsText}>✕ {d}</Text>
          ))}
        </View>

        {/* FOOTER — NO 112 */}
        <View style={styles.footer}>
          <View style={styles.footerIcon}>
            <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.footerText}>
            यह मार्गदर्शन अस्थायी आपातकालीन सहायता के लिए है और विशेषज्ञ चिकित्सा उपचार का विकल्प नहीं है।
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  backBtn: { paddingHorizontal: 16, paddingVertical: 10, width: 52 },
  content: { paddingHorizontal: 16, paddingBottom: 30 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  headerIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#FFEDD5", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800", letterSpacing: 0.5 },
  subtitle: { fontSize: 12, color: ORANGE, fontWeight: "700", marginTop: 2 },
  desc: { fontSize: 12, color: "#6B7280", textAlign: "center", lineHeight: 18, marginBottom: 14 },
  listenBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: ORANGE, borderRadius: 14, paddingVertical: 14, marginBottom: 16 },
  listenText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", letterSpacing: 0.5 },
  card: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EEF1F5",
    borderRadius: 14, padding: 12, marginBottom: 10,
  },
  badge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 2, backgroundColor: ORANGE },
  badgeText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  stepTitle: { fontSize: 13, fontWeight: "800", color: "#1A1A2E" },
  stepPoint: { fontSize: 11, color: "#6B7280", lineHeight: 17, marginTop: 3 },
  cardRight: { alignItems: "center", gap: 6 },
  stepImg: { width: 84, height: 84, borderRadius: 12 },
  stepSpeak: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  dontsBox: { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", borderRadius: 14, padding: 14, marginTop: 16 },
  dontsHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  dontsTitle: { fontSize: 14, fontWeight: "800", color: "#991B1B" },
  dontsText: { fontSize: 11.5, color: "#991B1B", lineHeight: 18, marginLeft: 4 },
  footer: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#EFF6FF", borderRadius: 14, padding: 14, marginTop: 12 },
  footerIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: BLUE, alignItems: "center", justifyContent: "center" },
  footerText: { flex: 1, fontSize: 11, color: "#1E3A8A", lineHeight: 16, fontWeight: "600" },
});