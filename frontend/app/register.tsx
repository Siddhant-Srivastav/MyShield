import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const STAR_POSITIONS: [number, number][] = [
  [8, 12], [15, 8], [22, 18], [28, 6], [35, 14],
  [42, 9], [48, 20], [55, 7], [62, 15], [68, 5],
  [75, 11], [82, 19], [88, 8], [92, 16], [5, 25],
  [18, 30], [32, 22], [45, 28], [58, 24], [71, 30],
  [85, 23], [12, 35], [38, 38], [65, 33], [90, 36],
];

const SKYLINE_PATH =
  "M0,55 L0,35 L15,35 L15,25 L25,25 L25,30 L35,30 L35,15 L40,15 L40,30 L50,30 L50,20 L55,20 L55,30 L65,30 L65,10 L70,10 L70,5 L75,5 L75,10 L80,10 L80,30 L90,30 L90,22 L95,22 L95,18 L100,18 L100,22 L110,22 L110,30 L120,30 L120,25 L130,25 L130,15 L135,15 L135,25 L145,25 L145,30 L155,30 L155,20 L165,20 L165,12 L170,12 L170,8 L175,8 L175,12 L180,12 L180,20 L190,20 L190,28 L200,28 L200,18 L205,18 L205,28 L215,28 L215,22 L225,22 L225,30 L235,30 L235,15 L240,15 L240,30 L250,30 L250,25 L260,25 L260,30 L270,30 L270,20 L278,20 L278,12 L283,12 L283,20 L290,20 L290,30 L300,30 L300,25 L310,25 L310,30 L320,30 L320,18 L325,18 L325,30 L335,30 L335,22 L345,22 L345,30 L355,30 L355,35 L375,35 L375,55 Z";

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const heroHeight = useMemo(() => Math.round(height * 0.30), [height]);
  const heroWidth = Math.min(width, 600);
  const waveHeight = 40;
  const wavePath = `M0,${waveHeight} Q${heroWidth / 2},0 ${heroWidth},${waveHeight} L${heroWidth},${waveHeight} L0,${waveHeight} Z`;

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  return (
    <View style={styles.root} testID="register-screen">
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View style={[styles.hero, { height: heroHeight }]} testID="register-hero">
          <LinearGradient
            colors={["#0A1628", "#1A3A6C"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {STAR_POSITIONS.map(([leftPct, topPct], i) => (
            <View
              key={`star-${i}`}
              style={[styles.star, { left: `${leftPct}%`, top: `${topPct}%` }]}
            />
          ))}

          <View pointerEvents="none" style={[styles.skylineWrap, { bottom: waveHeight - 4 }]}>
            <Svg width={heroWidth} height={55} viewBox="0 0 375 55">
              <Path d={SKYLINE_PATH} fill="#061525" opacity={0.85} />
            </Svg>
          </View>

          <SafeAreaView edges={["top"]} style={styles.heroSafe} pointerEvents="box-none">
            <Pressable
              onPress={() => router.back()}
              hitSlop={12}
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
              testID="register-back-btn"
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </Pressable>

            <View style={styles.shieldWrap} pointerEvents="none">
              <Image
                source={require("../assets/images/myshield-shield-white.png")}
                style={styles.shield}
                resizeMode="contain"
              />
            </View>
          </SafeAreaView>

          <View pointerEvents="none" style={styles.waveWrap}>
            <Svg width={heroWidth} height={waveHeight}>
              <Path d={wavePath} fill="#F4F7FA" />
            </Svg>
          </View>
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <Text style={styles.heading} testID="register-heading">
            <Text style={styles.headingDark}>Create Your </Text>
            <Text style={styles.headingBlue}>Account</Text>
          </Text>
          <Text style={styles.subtitle}>
            Join MyShield and help us protect,{"\n"}respond and save lives.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.input}>
              <Ionicons name="person" size={20} color="#1A56DB" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                style={styles.inputText}
                autoCapitalize="words"
                returnKeyType="next"
                testID="register-name-input"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.mobileRow}>
              <View style={styles.ccBox}>
                <MaterialCommunityIcons name="cellphone" size={18} color="#1A56DB" />
                <Text style={styles.cc}>+91</Text>
                <Ionicons name="chevron-down" size={12} color="#1A56DB" />
              </View>
              <View style={styles.numberBox}>
                <TextInput
                  value={mobile}
                  onChangeText={setMobile}
                  placeholder="Enter your mobile number"
                  placeholderTextColor="#9CA3AF"
                  style={styles.numberInput}
                  keyboardType="phone-pad"
                  returnKeyType="done"
                  maxLength={10}
                  testID="register-mobile-input"
                />
              </View>
            </View>
          </View>

          <View style={styles.privacy} testID="register-privacy">
            <View style={styles.lockBubble}>
              <Ionicons name="lock-closed" size={16} color="#1A56DB" />
            </View>
            <Text style={styles.privacyText}>
              We respect your privacy. Your information{"\n"}is safe and secure with us.
            </Text>
          </View>

          <Pressable
            onPress={() => {
              /* placeholder: hook into auth later */
            }}
            style={({ pressed }) => [styles.continueBtn, pressed && { opacity: 0.9 }]}
            testID="register-continue-btn"
          >
            <View style={styles.btnLeft}>
              <View style={styles.btnIconBubble}>
                <Image
                  source={require("../assets/images/myshield-shield.png")}
                  style={styles.btnBubbleImg}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.continueBtnText}>Continue</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable
              onPress={() => router.replace("/login")}
              hitSlop={8}
              testID="register-login-link"
            >
              <Text style={styles.footerLink}>Login Now</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F4F7FA" },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  hero: { width: "100%", overflow: "hidden", position: "relative" },
  heroSafe: { flex: 1, alignItems: "center", paddingTop: 4 },
  star: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#FFFFFF",
    opacity: 0.7,
  },
  skylineWrap: { position: "absolute", left: 0, right: 0 },
  backBtn: {
    position: "absolute",
    left: 16,
    top: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  shieldWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
  },
  shield: { width: 55, height: 55, tintColor: "#FFFFFF" },
  waveWrap: { position: "absolute", left: 0, right: 0, bottom: -1 },

  content: { paddingHorizontal: 24, paddingTop: 8, width: "100%" },
  heading: { textAlign: "center", marginTop: 4 },
  headingDark: { fontSize: 22, fontWeight: "800", color: "#1A1A2E" },
  headingBlue: { fontSize: 22, fontWeight: "800", color: "#1A56DB" },
  subtitle: {
    marginTop: 4,
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 16,
  },

  field: { marginTop: 10 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 6,
  },
  input: {
    height: 46,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  mobileRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    overflow: "hidden",
  },
  ccBox: {
    width: 68,
    height: 46,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    gap: 2,
  },
  numberBox: {
    flex: 1,
    minWidth: 0,
    height: 46,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    justifyContent: "center",
    overflow: "hidden",
  },
  numberInput: {
    width: "100%",
    fontSize: 12,
    color: "#1A1A2E",
    padding: 0,
  },
  cc: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 13,
    color: "#1A1A2E",
    marginLeft: 10,
    padding: 0,
  },

  privacy: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  lockBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  privacyText: {
    flex: 1,
    fontSize: 10,
    color: "#6B7280",
    lineHeight: 14,
  },

  continueBtn: {
    marginTop: 14,
    height: 48,
    backgroundColor: "#1A56DB",
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  btnLeft: { flexDirection: "row", alignItems: "center" },
  btnIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  btnBubbleImg: { width: 22, height: 22 },
  continueBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 10,
  },

  footer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { color: "#6B7280", fontSize: 13 },
  footerLink: { color: "#1A56DB", fontSize: 13, fontWeight: "700" },
});
