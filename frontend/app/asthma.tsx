import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";

const guidelines = [
  { id: 1, text: "Pursed-Lip Breathing (होंठ सिकोड़कर सांस छोड़ें): 2 सेकेंड नाक से सांस लें, फिर 4 सेकंड तक धीरे-धीरे मुंह से छोड़ें।", emoji: "🫁" },
  { id: 2, text: "Tripod Position (आगे झुककर बैठें): थोड़ा आगे झुककर दोनों हाथ घुटनों या टेबल पर टिकाएं।", emoji: "🪑" },
  { id: 3, text: "Warm Black Coffee / Tea (गर्म ब्लैक कॉफी या चाय): 1-2 कप हल्की गर्म ब्लैक कॉफी या चाय पिलाएं।", emoji: "☕" },
  { id: 4, text: "Trigger Elimination (ट्रिगर्स से तुरंत दूर करें): धुआं, अगरबत्ती, परफ्यूम, धूल, ठंडी हवा आदि से तुरंत दूर जाएं!", emoji: "🚭" },
  { id: 5, text: "Warm Mist / Steam (हल्की गर्म भाप का उपयोग): हल्की गर्म भाप या स्टीमी बाथरूम में बैठने से राहत मिलती है।", emoji: "🚿" },
];

const SPEECH_TEXT =
  "Asthma attack आपातकालीन मार्गदर्शन। " +
  guidelines.map((g) => g.text).join(" ") +
  " महत्वपूर्ण चेतावनी: साइलेंट चेस्ट। यदि सीटी जैसी आवाज़ अचानक बंद हो जाए और सांस बहुत कठिन हो रही हो, तो यह सुधार नहीं बल्कि वायुमार्ग पूरी तरह बंद होने का संकेत हो सकता है। तुरंत मेडिकल सहायता लें।" +
  " यह मार्गदर्शन अस्थायी आपातकालीन सहायता है और पेशेवर चिकित्सा उपचार का विकल्प नहीं है।";

export default function AsthmaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ speak?: string }>();
  const [speaking, setSpeaking] = useState(false);

  const stopSpeaking = () => {
    Speech.stop();
    setSpeaking(false);
  };

  const startSpeaking = () => {
    Speech.stop();
    setSpeaking(true);
    Speech.speak(SPEECH_TEXT, {
      language: "hi-IN",
      rate: 0.95,
      pitch: 1,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  useEffect(() => {
    if (params.speak === "true") {
      const t = setTimeout(() => startSpeaking(), 600);
      return () => {
        clearTimeout(t);
        Speech.stop();
      };
    }
    return () => Speech.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Back button */}
        <Pressable
          onPress={() => {
            stopSpeaking();
            router.back();
          }}
          hitSlop={10}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={20} color="#1A1A2E" />
        </Pressable>

        {/* Header */}
        <View style={styles.headingRow}>
          <View style={styles.asthmaCircle}>
            <Text style={styles.asthmaEmoji}>🌬️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>Asthma Attack</Text>
            <Text style={styles.headingHindi}>आपातकालीन मार्गदर्शन</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          सही प्राथमिक उपचार से आपकी जान बच सकती है।
          इन दिशानिर्देशों का पालन करें और तुरंत मेडिकल सहायता लें।
        </Text>

        {/* 🔊 Listen / Stop button */}
        <Pressable
          onPress={speaking ? stopSpeaking : startSpeaking}
          style={[styles.listenBtn, speaking && styles.listenBtnActive]}
        >
          <View
            style={[
              styles.listenIcon,
              speaking && { backgroundColor: "rgba(255,255,255,0.2)" },
            ]}
          >
            <Ionicons
              name={speaking ? "stop" : "volume-high"}
              size={20}
              color={speaking ? "#FFFFFF" : "#1A56DB"}
            />
          </View>
          <Text style={[styles.listenText, speaking && { color: "#FFFFFF" }]}>
            {speaking ? "Speaking… tap to stop" : "Listen to these guidelines"}
          </Text>
        </Pressable>

        {/* Guideline cards */}
        {guidelines.map((item) => (
          <View key={item.id} style={styles.guidelineCard}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>{item.id}</Text>
            </View>
            <Text style={styles.guidelineText}>{item.text}</Text>
            <Text style={styles.emoji}>{item.emoji}</Text>
          </View>
        ))}

        {/* ⚠️ Silent Chest warning */}
        <View style={styles.warningCard}>
          <View style={styles.warningIcon}>
            <Ionicons name="alert" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>
              महत्वपूर्ण चेतावनी: "साइलेंट चेस्ट"
            </Text>
            <Text style={styles.warningText}>
              यदि सीटी जैसी आवाज़ (Wheezing) अचानक बंद हो जाए और साँस बहुत
              कठिन हो रही हो, तो यह सुधार नहीं बल्कि वायुमार्ग पूरी तरह बंद
              होने का संकेत हो सकता है। तुरंत मेडिकल सहायता लें।
            </Text>
          </View>
        </View>

        {/* Bottom privacy box */}
        <View style={styles.bottomInfo}>
          <View style={styles.bottomShield}>
            <Ionicons name="shield-checkmark" size={22} color="#1A56DB" />
          </View>
          <Text style={styles.bottomText}>
            यह मार्गदर्शन अस्थायी आपातकालीन सहायता है और
            पेशेवर चिकित्सा उपचार का विकल्प नहीं है।
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 30 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  headingRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  asthmaCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  asthmaEmoji: { fontSize: 30 },
  heading: { fontSize: 24, fontWeight: "800", color: "#1A1A2E" },
  headingHindi: { fontSize: 16, fontWeight: "800", color: "#1A1A2E", marginTop: 2 },
  subtitle: {
    textAlign: "center",
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
    fontWeight: "600",
  },
  listenBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 10,
  },
  listenBtnActive: { backgroundColor: "#1A56DB" },
  listenIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  listenText: { fontSize: 13, fontWeight: "700", color: "#1A56DB" },
  guidelineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  numberCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  numberText: { color: "#1A56DB", fontSize: 16, fontWeight: "800" },
  guidelineText: {
    flex: 1,
    fontSize: 13,
    color: "#1A1A2E",
    fontWeight: "700",
    lineHeight: 20,
    paddingRight: 8,
  },
  emoji: { fontSize: 34 },
  warningCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  warningIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  warningTitle: { color: "#991B1B", fontSize: 13, fontWeight: "800", marginBottom: 4 },
  warningText: { color: "#991B1B", fontSize: 12, lineHeight: 18, fontWeight: "600" },
  bottomInfo: {
    marginTop: 6,
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  bottomShield: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bottomText: {
    flex: 1,
    color: "#1E3A8A",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
});