import { useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";

const BLUE = "#1A56DB";
const RED = "#DC2626";

type Step = { n: number; title: string; points: string[]; img: any };

const STEPS: Step[] = [
  {
    n: 1,
    title: "संदिग्ध खाना खाना बंद करें",
    points: [
      "जिस खाने से परेशानी शुरू हुई है, उसे तुरंत बंद करें",
      "बचा हुआ खाना फेंक दें और दूसरों को भी खाने से रोकें",
    ],
    img: require("../assets/images/food-stop.png"),
  },
  {
    n: 2,
    title: "पानी और तरल पदार्थ लेते रहें",
    points: [
      "थोड़ा-थोड़ा करके बार-बार पानी पिएं",
      "ORS, नारियल पानी, दाल का पानी या clear soup लें",
    ],
    img: require("../assets/images/food-fluids.png"),
  },
  {
    n: 3,
    title: "आराम करें और सही स्थिति में रहें",
    points: [
      "शरीर को ठीक होने के लिए आराम चाहिए",
      "तुरंत लेटने की बजाय बैठकर या करवट लेकर आराम करें",
    ],
    img: require("../assets/images/food-rest.png"),
  },
  {
    n: 4,
    title: "ठोस खाना कुछ समय के लिए न खाएँ",
    points: [
      "उल्टी बंद होने तक ठोस खाना न खाएं",
      "फिर हल्का खाना शुरू करें — केला, उबले आलू, दाल, crackers",
    ],
    img: require("../assets/images/food-light.png"),
  },
  {
    n: 5,
    title: "इन चीज़ों से बचें",
    points: [
      "तला-भुना, ज्यादा मसालेदार, दूध से बनी चीज़ें, caffeine और alcohol",
      "fizzy drinks (कोल्ड ड्रिंक) न पिएं",
    ],
    img: require("../assets/images/food-avoid.png"),
  },
  {
    n: 6,
    title: "बिना डॉक्टर की सलाह दवा न लें",
    points: [
      "खुद से anti-nausea या anti-diarrhea दवा न लें",
      "इनसे गंभीर side effects हो सकते हैं",
    ],
    img: require("../assets/images/food-medicine.png"),
  },
  {
    n: 7,
    title: "खतरे के लक्षण पर तुरंत डॉक्टर से संपर्क करें",
    points: [
      "बार-बार उल्टी, पानी न रुकना, खून आना",
      "तेज़ बुखार, बहुत कम पेशाब, चक्कर आना",
      "बुजुर्ग / छोटे बच्चे / गर्भवती / बीमार व्यक्ति को परेशानी हो तो तुरंत doctor को दिखाएं",
    ],
    img: require("../assets/images/food-doctor.png"),
  },
];

const REMEMBER = [
  "शांत रहें, तरल पदार्थ लेते रहें",
  "यह मार्गदर्शन केवल आपातकालीन सहायता के लिए है",
  "जरूरत पड़ने पर तुरंत मेडिकल सहायता लें",
];

export default function FoodPoisoning() {
  const router = useRouter();
  const [speaking, setSpeaking] = useState(false);
  const [rate] = useState(1);   // Normal speed

  const stopAll = () => {
    Speech.stop();
    setSpeaking(false);
  };

  const fullText = () => {
    const parts = ["फूड पॉइजनिंग — आपातकालीन मार्गदर्शन। सही समय पर सही कदम आपकी जान बचा सकते हैं।"];
    STEPS.forEach((s) => parts.push(`चरण ${s.n}। ${s.title}।`, ...s.points));
    parts.push("याद रखें।", ...REMEMBER);
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
            <Ionicons name="restaurant" size={28} color={RED} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              <Text style={{ color: "#1A1A2E" }}>FOOD </Text>
              <Text style={{ color: RED }}>POISONING</Text>
            </Text>
            <Text style={styles.subtitle}>— आपातकालीन मार्गदर्शन —</Text>
          </View>
        </View>
        <Text style={styles.desc}>
          सही समय पर सही कदम आपकी जान बचा सकते हैं।{"\n"}
          इन निर्देशों का पालन करें और जरूरत पड़ने पर तुरंत मेडिकल सहायता लें।
        </Text>

        {/* LISTEN ALL */}
        <Pressable onPress={listenAll} style={[styles.listenBtn, speaking && { backgroundColor: "#991B1B" }]}>
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
                <Ionicons name="volume-high" size={14} color={BLUE} />
              </Pressable>
            </View>
          </View>
        ))}

        {/* REMEMBER */}
        <View style={styles.rememberBox}>
          <View style={styles.rememberHead}>
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            <Text style={styles.rememberTitle}>ध्यान रखें / याद रखें</Text>
          </View>
          {REMEMBER.map((d, i) => (
            <Text key={i} style={styles.rememberText}>✓ {d}</Text>
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
  headerIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800", letterSpacing: 0.5 },
  subtitle: { fontSize: 12, color: RED, fontWeight: "700", marginTop: 2 },
  desc: { fontSize: 12, color: "#6B7280", textAlign: "center", lineHeight: 18, marginBottom: 14 },
  listenBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: RED, borderRadius: 14, paddingVertical: 14, marginBottom: 16 },
  listenText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", letterSpacing: 0.5 },
  card: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EEF1F5",
    borderRadius: 14, padding: 12, marginBottom: 10,
  },
  badge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 2, backgroundColor: BLUE },
  badgeText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  stepTitle: { fontSize: 13, fontWeight: "800", color: "#1A1A2E" },
  stepPoint: { fontSize: 11, color: "#6B7280", lineHeight: 17, marginTop: 3 },
  cardRight: { alignItems: "center", gap: 6 },
  stepImg: { width: 84, height: 84, borderRadius: 12 },
  stepSpeak: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  rememberBox: { backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#BBF7D0", borderRadius: 14, padding: 14, marginTop: 10 },
  rememberHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  rememberTitle: { fontSize: 14, fontWeight: "800", color: "#14532D" },
  rememberText: { fontSize: 11.5, color: "#166534", lineHeight: 18, marginLeft: 4 },
  footer: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#EFF6FF", borderRadius: 14, padding: 14, marginTop: 12 },
  footerIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: BLUE, alignItems: "center", justifyContent: "center" },
  footerText: { flex: 1, fontSize: 11, color: "#1E3A8A", lineHeight: 16, fontWeight: "600" },
});