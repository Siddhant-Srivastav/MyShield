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
  { id: 1, text: "Turant hospital pahunchें और Nephrologist (kidney specialist) से consult करें।", emoji: "🏥" },
  { id: 2, text: "Ulti ya matti ho रही hai तो, patient को seedha ना लिटाएं, side main turn karके लिटाएं।", emoji: "🛌" },
  { id: 3, text: "Paani aur anya taral padarth (fluids) का सेवन तुरंत बंद करें, doctor की सलाह के बिना।", emoji: "🚱" },
  { id: 4, text: "Koi bhi painkiller, खासकर NSAIDs (जैसे ibuprofen, diclofenac, naproxen), बिल्कुल ना लें।", emoji: "💊" },
  { id: 5, text: "High Potassium वाले foods से परहेज़ करें, क्योंकि ये kidney पर extra load डालते हैं। जैसे: केला, संतरा, नारियल पानी, टमाटर, आलू, पालक, सूखे मेवे, राजमा, चना, एवोकाडो, अनार।", emoji: "🍌" },
  { id: 6, text: "Rogi के पेशाब की मात्रा और रंग पर ध्यान दें, ये बहुत important जानकारी होती है।", emoji: "🧪" },
  { id: 7, text: "Rogi को mentally support करें, use शांत रखें और अकेला ना छोड़ें।", emoji: "🤝" },
  { id: 8, text: "Rogi का blood pressure (BP) regular monitoring करें और use stable रखें।", emoji: "🩸" },
];

const SPEECH_TEXT =
  "Acute kidney failure आपातकालीन मार्गदर्शन। " +
  guidelines.map((g) => g.text).join(" ") +
  " यह मार्गदर्शन अस्थायी आपातकालीन सहायता है और पेशेवर चिकित्सा उपचार का विकल्प नहीं है।";

export default function KidneyFailureScreen() {
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
          <View style={styles.kidneyCircle}>
            <Text style={styles.kidneyEmoji}>🫘</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>Acute Kidney Failure</Text>
            <Text style={styles.headingHindi}>आपातकालीन मार्गदर्शन</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          हर second important है। सही कदम उठाने से जीवन बच सकता है
          और kidney को नुकसान से बचाया जा सकता है।
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
  kidneyCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  kidneyEmoji: { fontSize: 30 },
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