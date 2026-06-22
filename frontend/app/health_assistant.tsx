import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useMemo } from "react";
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

const diseases = [
  {
    title: "Heart Attack",
    subtitle: "Chest pain, heaviness,\nshortness of breath",
    color: "#FF3B6A",
    icon: "heart",
    route: "/heart-attack",
  },
  {
    title: "Paralysis",
    subtitle: "Sudden weakness or\nloss of muscle control",
    color: "#9333EA",
    icon: "brain",
  },
  {
    title: "Brain Stroke",
    subtitle: "Sudden numbness,\nconfusion, trouble speaking",
    color: "#F97316",
    icon: "brain",
  },
  {
    title: "Kidney Failure",
    subtitle: "Swelling, fatigue,\nlow urine output",
    color: "#22C55E",
    icon: "medkit",
  },
  {
    title: "Kidney Stone Pain",
    subtitle: "Severe pain in side or\nlower back, nausea",
    color: "#14B8A6",
    icon: "water",
  },
  {
    title: "Snake Bite",
    subtitle: "Pain, swelling,\npoisoning symptoms",
    color: "#10B981",
    icon: "paw",
  },
  {
    title: "Asthma Attack",
    subtitle: "Breathing difficulty,\nwheezing, tight chest",
    color: "#3B82F6",
    icon: "lungs",
  },
  {
    title: "Fracture",
    subtitle: "Severe pain, swelling,\nunable to move",
    color: "#F59E0B",
    icon: "bone",
  },
];

export default function HealthAssistantScreen() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();

  const heroHeight = useMemo(() => Math.round(height * 0.18), [height]);
  const heroWidth = Math.min(width, 600);

  const waveHeight = 36;
  const wavePath = `M0,${waveHeight} Q${heroWidth / 2},0 ${heroWidth},${waveHeight} L${heroWidth},${waveHeight} L0,${waveHeight} Z`;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      {/* HERO */}
      <View style={[styles.hero, { height: heroHeight }]}>
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

        <View style={[styles.skylineWrap, { bottom: waveHeight - 4 }]}>
          <Svg width={heroWidth} height={55} viewBox="0 0 375 55">
            <Path d={SKYLINE_PATH} fill="#061525" opacity={0.85} />
          </Svg>
        </View>

        <SafeAreaView edges={["top"]} style={styles.heroSafe}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>

          <View style={styles.logoWrap}>
            <Image
              source={require("../assets/images/myshield-shield-white.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>

        <View style={styles.waveWrap}>
          <Svg width={heroWidth} height={waveHeight}>
            <Path d={wavePath} fill="#F4F7FA" />
          </Svg>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.heading}>Health Assistant</Text>

        <Text style={styles.subtitle}>
          Select a condition or speak to search
        </Text>

        {/* Voice Card */}
        <View style={styles.voiceCard}>
          <View style={styles.voiceCircle}>
            <Ionicons name="mic" size={42} color="#FFFFFF" />
          </View>

          <Text style={styles.voiceTitle}>
            Speak your symptoms or disease
          </Text>

          <Text style={styles.voiceSub}>
            Tap the mic and speak (e.g. "Fever", "Diabetes")
          </Text>
        </View>

        {/* Section Header */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Major Diseases</Text>

          <Text style={styles.viewAll}>View All</Text>
        </View>

        {/* Disease Grid */}
        <View style={styles.grid}>
          {diseases.map((item, index) => {
            const isHeart = item.title === "Heart Attack";

            return (
              <Pressable
                key={index}
                onPress={() => {
                  if (isHeart && item.route) {
                    router.push(item.route as any);
                  }
                }}
                style={({ pressed }) => [
                  styles.card,
                  pressed && isHeart && { opacity: 0.9 },
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: item.color },
                  ]}
                >
                  {item.icon === "lungs" ? (
                    <FontAwesome5
                      name="lungs"
                      size={26}
                      color="#FFFFFF"
                    />
                  ) : item.icon === "bone" ? (
                    <FontAwesome5
                      name="bone"
                      size={26}
                      color="#FFFFFF"
                    />
                  ) : (
                    <Ionicons
                      name={item.icon as any}
                      size={28}
                      color="#FFFFFF"
                    />
                  )}
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>

                <Text style={styles.cardSub}>{item.subtitle}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Privacy Box */}
        <View style={styles.privacyBox}>
          <View style={styles.lockBubble}>
            <Ionicons name="shield-checkmark" size={22} color="#1A56DB" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.privacyTitle}>
              Your Privacy is Important
            </Text>

            <Text style={styles.privacyText}>
              We only use this information to provide safety features.
              Your data is encrypted and never shared with anyone.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#1A56DB"
          />
        </View>
      </ScrollView>
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

  backBtn: {
    position: "absolute",
    left: 16,
    top: 8,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    zIndex: 10,
  },

  logoWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 56,
    height: 56,
    tintColor: "#FFFFFF",
  },

  waveWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },

  heading: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
    color: "#1A1A2E",
  },

  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 13,
    marginTop: 6,
    marginBottom: 18,
  },

  voiceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 18,
  },

  voiceCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#1A56DB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#1A56DB",
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },

  voiceTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1A1A2E",
  },

  voiceSub: {
    textAlign: "center",
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 18,
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A2E",
  },

  viewAll: {
    color: "#1A56DB",
    fontWeight: "700",
    fontSize: 13,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },

  iconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  cardTitle: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1A2E",
  },

  cardSub: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },

  privacyBox: {
    marginTop: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  lockBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  privacyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1A56DB",
  },

  privacyText: {
    fontSize: 11,
    color: "#4B5563",
    marginTop: 4,
    lineHeight: 16,
  },
});
