import { useMemo } from "react";
import {
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
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

export default function Welcome() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const heroHeight = useMemo(() => Math.round(height * 0.42), [height]);
  const heroWidth = Math.min(width, 600);

  // Wave shape: convex dome at bottom of hero curving INTO bottom section
  // We draw a #F4F7FA (light) path overlapping the bottom of hero
  const waveHeight = 40;
  const wavePath = `M0,${waveHeight} Q${heroWidth / 2},0 ${heroWidth},${waveHeight} L${heroWidth},${waveHeight} L0,${waveHeight} Z`;

  return (
    <View style={styles.root} testID="welcome-screen">
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      {/* HERO */}
      <View style={[styles.hero, { height: heroHeight }]} testID="welcome-hero">
        <LinearGradient
          colors={["#0A1628", "#1A3A6C"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Stars */}
        {STAR_POSITIONS.map(([leftPct, topPct], i) => (
          <View
            key={`star-${i}`}
            style={[
              styles.star,
              { left: `${leftPct}%`, top: `${topPct}%` },
            ]}
          />
        ))}

        {/* City skyline */}
        <View
          pointerEvents="none"
          style={[styles.skylineWrap, { bottom: waveHeight - 4 }]}
        >
          <Svg width={heroWidth} height={55} viewBox="0 0 375 55">
            <Path d={SKYLINE_PATH} fill="#061525" opacity={0.85} />
          </Svg>
        </View>

        {/* Centered white shield */}
        <SafeAreaView
          edges={["top"]}
          style={styles.heroSafe}
          pointerEvents="none"
        >
          <View style={styles.shieldWrap} testID="welcome-shield">
            <Image
              source={require("../assets/images/myshield-shield-white.png")}
              style={styles.shield}
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>

        {/* Wave curve at bottom (drawn as light-color SVG overlap) */}
        <View pointerEvents="none" style={styles.waveWrap}>
          <Svg width={heroWidth} height={waveHeight}>
            <Path d={wavePath} fill="#F4F7FA" />
          </Svg>
        </View>
      </View>

      {/* BOTTOM CONTENT */}
      <SafeAreaView
        edges={["bottom"]}
        style={styles.bottom}
        testID="welcome-bottom"
      >
        <View style={styles.bottomInner}>
          <Text style={styles.heading} testID="welcome-heading">
            <Text style={styles.headingDark}>Welcome to </Text>
            <Text style={styles.headingBlue}>MyShield</Text>
          </Text>

          <Text style={styles.subtitle} testID="welcome-subtitle">
            Your safety is our mission.{"\n"}We protect, respond and save.
          </Text>

          <View style={styles.features} testID="welcome-features">
            <FeatureColumn
              circleBg="#EFF6FF"
              color="#1A56DB"
              icon={
                <MaterialCommunityIcons
                  name="shield-check"
                  size={26}
                  color="#1A56DB"
                />
              }
              label="PROTECT"
              sub={"We keep\nyou safe"}
              testID="feature-protect"
            />
            <FeatureColumn
              circleBg="#FFF0F0"
              color="#DC2626"
              icon={
                <MaterialCommunityIcons
                  name="alarm-light"
                  size={26}
                  color="#DC2626"
                />
              }
              label="RESPOND"
              sub={"We act\nimmediately"}
              testID="feature-respond"
            />
            <FeatureColumn
              circleBg="#F0FFF4"
              color="#16A34A"
              icon={
                <MaterialCommunityIcons
                  name="heart-pulse"
                  size={26}
                  color="#16A34A"
                />
              }
              label="SAVE"
              sub={"We help\nsave lives"}
              testID="feature-save"
            />
          </View>

          <Pressable
            onPress={() => router.push("/login")}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && { opacity: 0.9 },
            ]}
            testID="welcome-login-btn"
          >
            <View style={styles.btnLeft}>
              <View style={styles.btnIconBubble}>
                <Image
                  source={require("../assets/images/myshield-shield.png")}
                  style={styles.btnBubbleImg}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.primaryBtnText}>Login to Continue</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </Pressable>

          <Pressable
            onPress={() => router.push("/register")}
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && { opacity: 0.9 },
            ]}
            testID="welcome-register-btn"
          >
            <View style={styles.btnLeft}>
              <Ionicons name="person" size={20} color="#1A56DB" />
              <Text style={styles.secondaryBtnText}>Create New Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#1A56DB" />
          </Pressable>

          <View style={styles.security} testID="welcome-security">
            <View style={styles.securityRow}>
              <Ionicons name="lock-closed" size={14} color="#6B7280" />
              <Text style={styles.securityText}>
                Your data is secure with us.
              </Text>
            </View>
            <Text style={styles.securityTrust}>Privacy • Security • Trust</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function FeatureColumn({
  circleBg,
  color,
  icon,
  label,
  sub,
  testID,
}: {
  circleBg: string;
  color: string;
  icon: React.ReactNode;
  label: string;
  sub: string;
  testID: string;
}) {
  return (
    <View style={styles.feature} testID={testID}>
      <View style={[styles.featureCircle, { backgroundColor: circleBg }]}>
        {icon}
      </View>
      <Text style={[styles.featureLabel, { color }]}>{label}</Text>
      <Text style={styles.featureSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F4F7FA",
  },
  hero: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  heroSafe: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  star: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#FFFFFF",
    opacity: 0.7,
  },
  skylineWrap: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  shieldWrap: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  shield: {
    width: 80,
    height: 80,
    tintColor: "#FFFFFF",
  },
  waveWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
  },
  bottom: {
    flex: 1,
    backgroundColor: "#F4F7FA",
  },
  bottomInner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  heading: {
    textAlign: "center",
    marginTop: 4,
  },
  headingDark: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  headingBlue: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A56DB",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
  },
  feature: {
    alignItems: "center",
    width: 96,
  },
  featureCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  featureSub: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 13,
  },
  primaryBtn: {
    marginTop: 24,
    height: 56,
    backgroundColor: "#1A3A6C",
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 12,
  },
  secondaryBtn: {
    marginTop: 14,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1A56DB",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  secondaryBtnText: {
    color: "#1A56DB",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 12,
  },
  btnLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  btnBubbleImg: {
    width: 22,
    height: 22,
  },
  security: {
    marginTop: 14,
    alignItems: "center",
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  securityText: {
    color: "#6B7280",
    fontSize: 12,
    marginLeft: 6,
  },
  securityTrust: {
    color: "#1A56DB",
    fontSize: 11,
    marginTop: 4,
  },
});
