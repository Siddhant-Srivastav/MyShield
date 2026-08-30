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
  { id: 1, text: "रोगी को किसी भी स्थिति में न हिलाएं, और उसे आराम की स्थिति में रहने दें।", emoji: "🛌" },
  { id: 2, text: "घायल हिस्से को स्थिर रखें (हिलाएं नहीं)।", emoji: "🦵" },
  { id: 3, text: "हड्डी को हिलाने या सीधा करने का प्रयास न करें।", emoji: "🦴" },
  { id: 4, text: "बर्फ की सिकाई करें (त्वचा पर सीधे नहीं, तौलिये में लपेटकर)।", emoji: "🧊" },
  { id: 5, text: "खुले घाव को साफ कपड़े या पट्टी से ढकें।", emoji: "🩹" },
  { id: 6, text: "यदि संभव हो, एक साधारण स्प्लिंट का उपयोग करें।", emoji: "🪵" },
  { id: 7, text: "रोगी को शांत और आश्वस्त रखें।", emoji: "🧘" },
  { id: 8, text: "रोगी को खाने या पीने के लिए कुछ न दें।", emoji: "🍽️" },
];

const SPEECH_TEXT =
  "Bone fracture, हड्डी टूटने का आपातकालीन मार्गदर्शन। " +
  guidelines.map((g) => g.text).join(" ") +
  " यह मार्गदर्शन अस्थायी आपातकालीन सहायता है और पेशेवर चिकित्सा उपचार का विकल्प नहीं है।";

export default function FractureScreen() {
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
          <View style={styles.fractureCircle}>
            <Text style={styles.fractureEmoji}>🦴</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>Bone Fracture</Text>
            <Text style={styles.headingHindi}>आपातकालीन मार्गदर्शन (हड्डी टूटना)</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          हर सेकंड कीमती है। सही कदम उठाने से जीवन बच सकता है
          और गंभीर नुकसान से बचा जा सकता है।
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
  fractureCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#D97706",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fractureEmoji: { fontSize: 30 },
  heading: { fontSize: 24, fontWeight: "800", color: "#1A1A2E" },
  headingHindi: { fontSize: 15, fontWeight: "800", color: "#1A1A2E", marginTop: 2 },
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