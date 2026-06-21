import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import HeroBackground from "@/src/components/hero/HeroBackground";
import { storage } from "@/src/utils/storage";

const BLUE = "#1A56DB";
const NAVY = "#1A1A2E";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";

type Lang = {
  code: string;
  native: string;
  english: string;
  badge: string; // short native badge text
  bg: string;
  fg: string;
};

const LANGUAGES: Lang[] = [
  { code: "en", native: "English", english: "English", badge: "EN", bg: "#DBEAFE", fg: "#1A56DB" },
  { code: "hi", native: "हिंदी", english: "Hindi", badge: "हिं", bg: "#DCFCE7", fg: "#15803D" },
  { code: "mr", native: "मराठी", english: "Marathi", badge: "मरा", bg: "#FFE4D5", fg: "#C2410C" },
  { code: "ta", native: "தமிழ்", english: "Tamil", badge: "த", bg: "#D1FAE5", fg: "#047857" },
  { code: "gu", native: "ગુજરાતી", english: "Gujarati", badge: "ગુ", bg: "#EDE9FE", fg: "#6D28D9" },
  { code: "te", native: "తెలుగు", english: "Telugu", badge: "తె", bg: "#FCE7F3", fg: "#9D174D" },
  { code: "bn", native: "বাংলা", english: "Bengali", badge: "বা", bg: "#FEE2E2", fg: "#B91C1C" },
  { code: "kn", native: "ಕನ್ನಡ", english: "Kannada", badge: "ಕ", bg: "#FFEDD5", fg: "#C2410C" },
  { code: "ml", native: "മലയാളം", english: "Malayalam", badge: "മ", bg: "#DCFCE7", fg: "#166534" },
  { code: "pa", native: "ਪੰਜਾਬੀ", english: "Punjabi", badge: "ਪ", bg: "#DBEAFE", fg: "#1D4ED8" },
  { code: "or", native: "ଓଡ଼ିଆ", english: "Odia", badge: "ଓ", bg: "#FCE7F3", fg: "#BE185D" },
  { code: "as", native: "অসমীয়া", english: "Assamese", badge: "অ", bg: "#D1FAE5", fg: "#047857" },
  { code: "ne", native: "नेपाली", english: "Nepali", badge: "ने", bg: "#EDE9FE", fg: "#6D28D9" },
  { code: "sa", native: "संस्कृतम्", english: "Sanskrit", badge: "सं", bg: "#DBEAFE", fg: "#1D4ED8" },
  { code: "kok", native: "कोंकणी", english: "Konkani", badge: "कों", bg: "#DCFCE7", fg: "#166534" },
  { code: "mai", native: "मैथिली", english: "Maithili", badge: "मै", bg: "#FFEDD5", fg: "#C2410C" },
  { code: "ur", native: "اردو", english: "Urdu", badge: "ا", bg: "#FEE2E2", fg: "#B91C1C" },
  { code: "ks", native: "کٲشُر", english: "Kashmiri", badge: "का", bg: "#EDE9FE", fg: "#6D28D9" },
  { code: "sd", native: "سنڌي", english: "Sindhi", badge: "س", bg: "#DBEAFE", fg: "#1D4ED8" },
  { code: "mni", native: "ꯃꯤꯇꯩꯂꯣꯟ", english: "Manipuri", badge: "ꯃ", bg: "#FCE7F3", fg: "#9D174D" },
  { code: "brx", native: "बड़ो", english: "Bodo", badge: "ब", bg: "#DCFCE7", fg: "#15803D" },
  { code: "doi", native: "डोगरी", english: "Dogri", badge: "डो", bg: "#FFE4D5", fg: "#C2410C" },
  { code: "sat", native: "ᱥᱟᱱᱛᱟᱲᱤ", english: "Santali", badge: "ᱥ", bg: "#D1FAE5", fg: "#047857" },
  { code: "tcy", native: "ತುಳು", english: "Tulu", badge: "ತು", bg: "#EDE9FE", fg: "#6D28D9" },
];

const STEPS = [
  { id: 1, label: "Basic Details" },
  { id: 2, label: "Photo" },
  { id: 3, label: "Emergency" },
  { id: 4, label: "Language" },
  { id: 5, label: "Permissions" },
];
const ACTIVE_STEP = 4;

export default function LanguageSelection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string>("en");
  const [query, setQuery] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter(
      (l) => l.english.toLowerCase().includes(q) || l.native.includes(q),
    );
  }, [query]);

  const select = (code: string) => {
    setSelected(code);
    void storage.setItem("selectedLanguage", code);
  };

  return (
    <View style={styles.root} testID="language-selection-screen">
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      <HeroBackground heightFraction={0.11} shieldSize={44}>
        <SafeAreaView edges={["top"]} style={styles.heroOverlay} pointerEvents="box-none">
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            testID="lang-back-btn"
          >
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          </Pressable>
        </SafeAreaView>
      </HeroBackground>

      {/* Title row with info button */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>
          <Text style={styles.titleDark}>Choose Your </Text>
          <Text style={styles.titleBlue}>Language</Text>
        </Text>
        <Pressable
          onPress={() => setShowInfo(true)}
          hitSlop={10}
          style={styles.infoBtn}
          testID="lang-info-btn"
        >
          <Feather name="info" size={16} color={BLUE} />
        </Pressable>
      </View>

      {/* Search bar */}
      <View style={styles.search}>
        <Ionicons name="search" size={16} color={MUTED} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search Language"
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          testID="lang-search-input"
        />
      </View>

      {/* Language grid */}
      <ScrollView
        style={styles.grid}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.row2col}>
          {filtered.map((l) => {
            const active = selected === l.code;
            return (
              <Pressable
                key={l.code}
                onPress={() => select(l.code)}
                style={({ pressed }) => [
                  styles.langCard,
                  active && styles.langCardActive,
                  pressed && { opacity: 0.9 },
                ]}
                testID={`lang-${l.code}`}
              >
                <View style={[styles.langBadge, { backgroundColor: l.bg }]}>
                  <Text style={[styles.langBadgeText, { color: l.fg }]} numberOfLines={1}>
                    {l.badge}
                  </Text>
                </View>
                <View style={styles.langTextWrap}>
                  <Text style={styles.langNative} numberOfLines={1}>{l.native}</Text>
                  <Text style={styles.langEnglish} numberOfLines={1}>{l.english}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active ? <View style={styles.radioDot} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Continue button */}
      <Pressable
        onPress={() => router.push("/home")}
        style={({ pressed }) => [styles.continueBtn, pressed && { opacity: 0.9 }]}
        testID="lang-continue-btn"
      >
        <Text style={styles.continueText}>Continue</Text>
        <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
      </Pressable>

      {/* Bottom stepper */}
      <View
        style={[styles.stepper, { paddingBottom: Math.max(insets.bottom, 8) }]}
        testID="onboarding-stepper"
      >
        {STEPS.map((s) => {
          const completed = s.id < ACTIVE_STEP;
          const active = s.id === ACTIVE_STEP;
          return (
            <View key={s.id} style={styles.step}>
              <View
                style={[
                  styles.stepCircle,
                  completed && styles.stepDone,
                  active && styles.stepActive,
                  !completed && !active && styles.stepIdle,
                ]}
              >
                {completed ? (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                ) : (
                  <Text style={[styles.stepNum, active ? { color: "#FFFFFF" } : { color: "#9CA3AF" }]}>
                    {s.id}
                  </Text>
                )}
              </View>
              <Text style={[styles.stepLabel, active && { color: BLUE, fontWeight: "700" }]} numberOfLines={1}>
                {s.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Important Information modal */}
      <Modal visible={showInfo} animationType="slide" transparent onRequestClose={() => setShowInfo(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Important Information</Text>
              <Pressable onPress={() => setShowInfo(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color={NAVY} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.infoSection, { backgroundColor: "#EEF4FF" }]}>
                <Text style={[styles.infoHead, { color: BLUE }]}>महत्वपूर्ण जानकारी (Hindi)</Text>
                <InfoItem n={1} color={BLUE} title="Values Menu का चयन करें" body="आप अपने पसंदीदा भाषा का चयन करने के बाद नीचे दिए गए Continue बटन पर क्लिक करें और आपको अगले पृष्ठ में ले जाया जाएगा।" />
                <InfoItem n={2} color={BLUE} body="इस पृष्ठ को पूरा ध्यान से पढ़ें। सभी विकल्पों को समझना आवश्यक होगा ताकि आपको यह समझने में सहायता हो सके आगे क्या करना है।" />
                <InfoItem n={3} color={BLUE} body="यहाँ Language section सभी 24 भारतीय भाषाओं, मैन्युअल और शब्दकोश, ऐप और और Help का भी विकल्प देने के लिए प्रदर्शित है।" />
                <InfoItem n={4} color={BLUE} body="आप जहाँ भी जाएँ वहाँ Language बदलना आप कभी भी कर सकते हैं।" />
                <InfoItem n={5} color={BLUE} body="इस पेज पर उपलब्ध अतिरिक्त Language options में अपनी और भाषा चुनिये।" />
              </View>

              <View style={[styles.infoSection, { backgroundColor: "#ECFDF5" }]}>
                <Text style={[styles.infoHead, { color: "#047857" }]}>Important Information (English)</Text>
                <InfoItem n={1} color="#047857" title="Values Menu को चुनें" body="After Values Menu is selected you please find run up to under the app online and simply hit next." />
                <InfoItem n={2} color="#047857" body="The Values Menu shall work in the language you select. You need to spend little Values Menu to issue new language." />
                <InfoItem n={3} color="#047857" body="In wherever you see your selected menu name, the page name, resource entities, error by you and required to you alerts, help resources and comments, is to run and operate with language options from Settings > Language." />
                <InfoItem n={4} color="#047857" body="In Choosing the right language helps you get fast and smooth help in emergency situations." />
                <InfoItem n={5} color="#047857" body="In more language options on this page, please select your extra language." />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InfoItem({ n, color, title, body }: { n: number; color: string; title?: string; body: string }) {
  return (
    <View style={styles.infoItem}>
      <View style={[styles.infoNum, { backgroundColor: color }]}>
        <Text style={styles.infoNumText}>{n}</Text>
      </View>
      <View style={{ flex: 1 }}>
        {title ? <Text style={styles.infoItemTitle}>{title}</Text> : null}
        <Text style={styles.infoItemBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F4F7FA" },
  heroOverlay: { flex: 1, paddingHorizontal: 16 },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  titleRow: {
    paddingHorizontal: 16,
    paddingTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { textAlign: "center" },
  titleDark: { fontSize: 18, fontWeight: "800", color: NAVY },
  titleBlue: { fontSize: 18, fontWeight: "800", color: BLUE },
  infoBtn: {
    marginLeft: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  search: {
    marginTop: 8,
    marginHorizontal: 16,
    height: 38,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: NAVY, padding: 0 },

  grid: { flex: 1, marginTop: 6 },
  gridContent: { paddingHorizontal: 12, paddingBottom: 8 },
  row2col: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 6,
  },

  langCard: {
    width: "49%",
    height: 46,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  langCardActive: {
    borderColor: BLUE,
    backgroundColor: "#F5F8FF",
  },
  langBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  langBadgeText: { fontSize: 12, fontWeight: "800" },
  langTextWrap: { flex: 1, minWidth: 0 },
  langNative: { fontSize: 12, fontWeight: "700", color: NAVY },
  langEnglish: { fontSize: 10, color: MUTED, marginTop: 1 },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: BLUE },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BLUE,
  },

  continueBtn: {
    marginHorizontal: 16,
    marginTop: 6,
    height: 44,
    borderRadius: 12,
    backgroundColor: BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  continueText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700", marginRight: 4 },

  stepper: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 6,
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEF1F5",
  },
  step: { flex: 1, alignItems: "center" },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  stepDone: { backgroundColor: BLUE },
  stepActive: { backgroundColor: BLUE },
  stepIdle: { backgroundColor: "#E5E7EB" },
  stepNum: { fontSize: 11, fontWeight: "700" },
  stepLabel: { fontSize: 9, color: MUTED, textAlign: "center" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: NAVY },
  infoSection: { borderRadius: 12, padding: 12, marginBottom: 12 },
  infoHead: { fontSize: 14, fontWeight: "800", marginBottom: 8 },
  infoItem: { flexDirection: "row", gap: 8, marginBottom: 6 },
  infoNum: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  infoNumText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  infoItemTitle: { fontSize: 12, fontWeight: "700", color: NAVY },
  infoItemBody: { fontSize: 11, color: NAVY, lineHeight: 16 },
});
