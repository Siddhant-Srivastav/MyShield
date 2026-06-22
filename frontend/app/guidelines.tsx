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
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
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

const guidelines = [
  {
    id: 1,
    text: "Person को आराम से बैठाइए।",
    icon: "wheelchair",
  },
  {
    id: 2,
    text: "Heart पर pressure कम करने के लिए घुटनों को हल्का bend रखिए।",
    icon: "chair",
  },
  {
    id: 3,
    text: "सिर और shoulders को proper support दीजिए।",
    icon: "bed",
  },
  {
    id: 4,
    text: "Patient को calm रखिए और panic मत होने दीजिए।",
    icon: "meditation",
  },
  {
    id: 5,
    text: "Neck और chest के tight कपड़ों को loose कीजिए।",
    icon: "tshirt-crew",
  },
  {
    id: 6,
    text: "Patient के आस-पास भीड़ मत लगाइए ताकि उन्हें properly सांस लेने में दिक्कत ना हो।",
    icon: "account-group",
  },
  {
    id: 7,
    text: "धीरे और गहरी सांस लेने में help कीजिए।",
    icon: "lungs",
  },
];

export default function HeartAttackScreen() {
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
        {/* Heading */}
        <View style={styles.headingRow}>
          <View style={styles.heartCircle}>
            <Ionicons name="heart" size={28} color="#FFFFFF" />
          </View>

          <View>
            <Text style={styles.heading}>Heart Attack</Text>
            <Text style={styles.headingHindi}>आपातकालीन मार्गदर्शन</Text>
          </View>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          जब तक मेडिकल सहायता पहुँचती है, तब तक सुरक्षित रहने के लिए
          {"\n"}इन निर्देशों का पालन करें।
        </Text>

        {/* Guidelines */}
        {guidelines.map((item) => (
          <View key={item.id} style={styles.guidelineCard}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>{item.id}</Text>
            </View>

            <Text style={styles.guidelineText}>
              {item.text}
            </Text>

            <View style={styles.iconWrap}>
              {item.icon === "lungs" ? (
                <FontAwesome5
                  name="lungs"
                  size={32}
                  color="#EF4444"
                />
              ) : (
                <Ionicons
                  name={item.icon as any}
                  size={34}
                  color="#2563EB"
                />
              )}
            </View>
          </View>
        ))}

        {/* Bottom Privacy */}
        <View style={styles.bottomInfo}>
          <View style={styles.bottomShield}>
            <Ionicons
              name="shield-checkmark"
              size={22}
              color="#1A56DB"
            />
          </View>

          <Text style={styles.bottomText}>
            यह मार्गदर्शन अस्थायी आपातकालीन सहायता है और
            {"\n"}पेशेवर चिकित्सा उपचार का विकल्प नहीं है।
          </Text>
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
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 30,
  },

  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  heartCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FF2D55",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1A1A2E",
  },

  headingHindi: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A2E",
    marginTop: 2,
  },

  subtitle: {
    textAlign: "center",
    color: "#4B5563",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 18,
    fontWeight: "600",
  },

  guidelineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  numberCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  numberText: {
    color: "#1A56DB",
    fontSize: 18,
    fontWeight: "800",
  },

  guidelineText: {
    flex: 1,
    fontSize: 14,
    color: "#1A1A2E",
    fontWeight: "700",
    lineHeight: 21,
    paddingRight: 10,
  },

  iconWrap: {
    width: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomInfo: {
    marginTop: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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

