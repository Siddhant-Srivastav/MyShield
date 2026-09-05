import { useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";

const BLUE = "#1A56DB";
const RED = "#DC2626";
const PURPLE = "#7C3AED";

type Step = { n: number; title: string; points: string[]; img: any };

const ADULT_STEPS: Step[] = [
  {
    n: 1,
    title: "पहले स्थिति पहचानें — क्या व्यक्ति खांस पा रहा है?",
    points: [
      "अगर व्यक्ति जोर से खांस रहा है, तो सांस ले सकता है",
      "उसे जोर से खांसने दें, रोके नहीं",
      "पीठ पर जोर से धक्का न दें",
      "उसके पास रहें और निगरानी रखें कि स्थिति खराब तो नहीं हो रही",
    ],
    img: require("../assets/images/choking-recognize.png"),
  },
  {
    n: 2,
    title: "अगर खांस, बोल या सांस नहीं ले पा रहा है",
    points: [
      "यह गंभीर स्थिति है (complete choking)",
      "तुरंत एम्बुलेंस के लिए कॉल करें (किसी से बोलें)",
      "अगर अकेले हैं तो खुद emergency call करें",
      "अगर हो सके तो तुरंत hospital लेकर जाएं",
    ],
    img: require("../assets/images/choking-recognize.png"),
  },
  {
    n: 3,
    title: "पीठ पर 5 बार धक्की दें (Back Blows)",
    points: [
      "व्यक्ति को आगे की ओर झुकाएं",
      "एक हाथ से उसकी छाती को सहारा दें",
      "दूसरे हाथ की हथेली से पीठ पर जोरदार धक्के दें (कंधों के बीच)",
      "हर धक्की के बाद देखें कि वस्तु निकली या नहीं",
    ],
    img: require("../assets/images/choking-back-blows.png"),
  },
  {
    n: 4,
    title: "अगर अब भी नहीं निकला — 5 बार पेट पर झटके दें (Heimlich Maneuver)",
    points: [
      "व्यक्ति के पीछे खड़े हो जाएं",
      "अपनी मुट्ठी बांधें और नाभि के थोड़ा ऊपर रखें",
      "दूसरे हाथ से मुट्ठी को पकड़ें",
      "अंदर और ऊपर की ओर झटके दें (J motion)",
      "हर झटके के बाद देखें कि वस्तु निकली या नहीं",
    ],
    img: require("../assets/images/choking-heimlich.png"),
  },
  {
    n: 5,
    title: "5 धक्की + 5 झटके दोहराएं",
    points: ["जब तक वस्तु निकल न जाए या व्यक्ति सांस न ले सके"],
    img: require("../assets/images/choking-heimlich.png"),
  },
  {
    n: 6,
    title: "अगर व्यक्ति बेहोश हो जाए",
    points: [
      "उसे सीधी सतह पर लेटा दें",
      "अगर सांस नहीं चल रही है तो CPR शुरू करें (30 दबाव + 2 सांस)",
      "अगर CPR नहीं जानते तो केवल chest compressions दें",
      "तुरंत hospital / emergency call करें",
      "मुंह में वस्तु दिखे तो निकालें, वरना उंगली न डालें",
    ],
    img: require("../assets/images/choking-cpr.png"),
  },
  {
    n: 7,
    title: "विशेष परिस्थितियां",
    points: [
      "गर्भवती महिला या बहुत मोटे व्यक्ति को पेट पर झटके नहीं — छाती पर झटके (chest thrusts) दें",
      "अगर आप अकेले हैं और आपका गला रुके तो खुद Heimlich करें — कुर्सी के किनारे या मेज़ के सहारे पेट पर ऊपर की ओर दबाव दें",
    ],
    img: require("../assets/images/choking-heimlich.png"),
  },
];

const INFANT_STEPS: Step[] = [
  {
    n: 1,
    title: "पहले स्थिति पहचानें — क्या बच्चा खांस या रो पा रहा है?",
    points: [
      "अगर बच्चा खांस या रो पा रहा है तो सांस ले रहा है",
      "उसे खांसने/रोने दें",
      "उसे अकेला न छोड़ें",
    ],
    img: require("../assets/images/choking-infant-back.png"),
  },
  {
    n: 2,
    title: "अगर रो/खांस नहीं पा रहा है",
    points: ["यह गंभीर स्थिति है", "तुरंत ambulance बुलाएं और hospital लेकर जाएं"],
    img: require("../assets/images/choking-infant-back.png"),
  },
  {
    n: 3,
    title: "पीठ पर 5 बार धक्की दें",
    points: [
      "बच्चे को एक बांह पर उल्टा (face-down) लिटाएं",
      "सिर को नीचे रखें और सिर/गर्दन को सहारा दें",
      "दूसरे हाथ की हथेली की जड़ से कंधों के बीच 5 धक्की दें",
      "हर धक्की के बाद देखें कि वस्तु निकली या नहीं",
    ],
    img: require("../assets/images/choking-infant-back.png"),
  },
  {
    n: 4,
    title: "छाती पर 5 बार दबाव दें",
    points: [
      "बच्चे को सीधा (face-up) लिटाएं, सिर को सहारा दें",
      "दो उंगलियां छाती के बीच (निप्पल लाइन के ठीक नीचे) रखें",
      "5 बार दबाव दें (लगभग 1.5 इंच गहरा)",
      "हर दबाव के बाद देखें",
    ],
    img: require("../assets/images/choking-infant-chest.png"),
  },
  {
    n: 5,
    title: "5 धक्की + 5 दबाव दोहराएं",
    points: ["जब तक वस्तु न निकले या बच्चा रोने-खांसने लगे"],
    img: require("../assets/images/choking-infant-chest.png"),
  },
  {
    n: 6,
    title: "अगर बच्चा बेहोश हो जाए",
    points: [
      "Infant CPR शुरू करें (30 दबाव + 2 सांस)",
      "तुरंत hospital ले जाएं",
      "मुंह में वस्तु दिखे तो निकालें, अंधी उंगली न डालें",
    ],
    img: require("../assets/images/choking-cpr.png"),
  },
];

const DONTS = [
  "बच्चे/व्यक्ति को पानी न पिलाएं",
  "मुंह में अंधी उंगली न डालें",
  "खाने की चीज़ें न दें",
];

const REMEMBER = [
  "शांत रहें, तुरंत मदद बुलाएं",
  "यह मार्गदर्शन केवल आपातकालीन सहायता के लिए है",
  "First aid प्रशिक्षण लेना फायदेमंद है",
];

export default function ChokingGuidelines() {
  const router = useRouter();
  const [speaking, setSpeaking] = useState(false);   // ⬅️ FIXED: false (boolean)
  const [rate] = useState(0.75);   // ⬅️ Normal speed (0.5 = slow, 1 = normal, 1.5 = fast)

  const stopAll = () => {
    Speech.stop();
    setSpeaking(false);
  };

  const fullText = () => {
    const parts = ["चोकिंग फर्स्ट एड। दम घुटना — आपातकालीन मार्गदर्शन। सही समय पर सही कदम किसी की जान बचा सकते हैं।"];
    parts.push("एक साल से बड़े बच्चों और वयस्कों के लिए।");
    ADULT_STEPS.forEach((s) => parts.push(`चरण ${s.n}। ${s.title}।`, ...s.points));
    parts.push("एक साल से छोटे बच्चों के लिए।");
    INFANT_STEPS.forEach((s) => parts.push(`चरण ${s.n}। ${s.title}।`, ...s.points));
    parts.push("ये बातें न करें।", ...DONTS);
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
      rate,   // ⬅️ ADDED: speed setting
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const listenStep = (s: Step) => {
    stopAll();
    Speech.speak(`${s.title}। ${s.points.join("। ")}`, {
      language: "hi-IN",
      rate,   // ⬅️ ADDED: speed setting
    });
  };

  const StepCard = ({ s, color }: { s: Step; color: string }) => (
    <View style={styles.card}>
      <View style={[styles.badge, { backgroundColor: color }]}>
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
          <Ionicons name="volume-high" size={14} color={color} />
        </Pressable>
      </View>
    </View>
  );

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
            <Ionicons name="alert-circle" size={28} color={RED} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              <Text style={{ color: "#1A1A2E" }}>CHOKING </Text>
              <Text style={{ color: RED }}>FIRST AID</Text>
            </Text>
            <Text style={styles.subtitle}>— दम घुटना – आपातकालीन मार्गदर्शन —</Text>
          </View>
        </View>
        <Text style={styles.desc}>
          सही समय पर सही कदम किसी की जान बचा सकते हैं।{"\n"}
          घबराएं नहीं, इन निर्देशों का पालन करें और तुरंत मेडिकल सहायता लें।
        </Text>

        {/* LISTEN ALL */}
        <Pressable onPress={listenAll} style={[styles.listenBtn, speaking && { backgroundColor: "#991B1B" }]}>
          <Ionicons name={speaking ? "stop" : "volume-high"} size={20} color="#FFFFFF" />
          <Text style={styles.listenText}>{speaking ? "SUNNA BAND KARO" : "🔊 PURI GUIDELINE SUNO"}</Text>
        </Pressable>

        {/* ADULTS */}
        <View style={[styles.band, { backgroundColor: BLUE }]}>
          <Text style={styles.bandText}>1 साल से बड़े बच्चों और वयस्कों के लिए (Adults & Children 1+ Year)</Text>
        </View>
        {ADULT_STEPS.map((s) => (
          <StepCard key={`a${s.n}`} s={s} color={BLUE} />
        ))}

        {/* INFANTS */}
        <View style={[styles.band, { backgroundColor: PURPLE, marginTop: 16 }]}>
          <Text style={styles.bandText}>1 साल से छोटे बच्चों के लिए (Infants Under 1 Year)</Text>
        </View>
        {INFANT_STEPS.map((s) => (
          <StepCard key={`i${s.n}`} s={s} color={PURPLE} />
        ))}

        {/* DON'TS */}
        <View style={styles.dontsBox}>
          <View style={styles.dontsHead}>
            <Ionicons name="close-circle" size={18} color="#FFFFFF" />
            <Text style={styles.dontsTitle}>ये बातें न करें</Text>
          </View>
          {DONTS.map((d, i) => (
            <Text key={i} style={styles.dontsText}>✕ {d}</Text>
          ))}
        </View>

        {/* REMEMBER */}
        <View style={styles.rememberBox}>
          <View style={styles.dontsHead}>
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            <Text style={[styles.dontsTitle, { color: "#14532D" }]}>ध्यान रखें / याद रखें</Text>
          </View>
          {REMEMBER.map((d, i) => (
            <Text key={i} style={[styles.dontsText, { color: "#166534" }]}>✓ {d}</Text>
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
  band: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 12, alignItems: "center" },
  bandText: { color: "#FFFFFF", fontSize: 12.5, fontWeight: "800", textAlign: "center" },
  card: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EEF1F5",
    borderRadius: 14, padding: 12, marginBottom: 10,
  },
  badge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 2 },
  badgeText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  stepTitle: { fontSize: 13, fontWeight: "800", color: "#1A1A2E" },
  stepPoint: { fontSize: 11, color: "#6B7280", lineHeight: 17, marginTop: 3 },
  cardRight: { alignItems: "center", gap: 6 },
  stepImg: { width: 84, height: 84, borderRadius: 12 },
  stepSpeak: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  dontsBox: { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", borderRadius: 14, padding: 14, marginTop: 16 },
  rememberBox: { backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#BBF7D0", borderRadius: 14, padding: 14, marginTop: 10 },
  dontsHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  dontsTitle: { fontSize: 14, fontWeight: "800", color: "#991B1B" },
  dontsText: { fontSize: 11.5, color: "#991B1B", lineHeight: 18, marginLeft: 4 },
  footer: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#EFF6FF", borderRadius: 14, padding: 14, marginTop: 12 },
  footerIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: BLUE, alignItems: "center", justifyContent: "center" },
  footerText: { flex: 1, fontSize: 11, color: "#1E3A8A", lineHeight: 16, fontWeight: "600" },
});