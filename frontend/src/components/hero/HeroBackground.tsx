import { useMemo } from "react";
import {
  Image,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

const STAR_POSITIONS: [number, number][] = [
  [8, 12], [15, 8], [22, 18], [28, 6], [35, 14],
  [42, 9], [48, 20], [55, 7], [62, 15], [68, 5],
  [75, 11], [82, 19], [88, 8], [92, 16], [5, 25],
  [18, 30], [32, 22], [45, 28], [58, 24], [71, 30],
  [85, 23], [12, 35], [38, 38], [65, 33], [90, 36],
];

const SKYLINE_PATH =
  "M0,55 L0,35 L15,35 L15,25 L25,25 L25,30 L35,30 L35,15 L40,15 L40,30 L50,30 L50,20 L55,20 L55,30 L65,30 L65,10 L70,10 L70,5 L75,5 L75,10 L80,10 L80,30 L90,30 L90,22 L95,22 L95,18 L100,18 L100,22 L110,22 L110,30 L120,30 L120,25 L130,25 L130,15 L135,15 L135,25 L145,25 L145,30 L155,30 L155,20 L165,20 L165,12 L170,12 L170,8 L175,8 L175,12 L180,12 L180,20 L190,20 L190,28 L200,28 L200,18 L205,18 L205,28 L215,28 L215,22 L225,22 L225,30 L235,30 L235,15 L240,15 L240,30 L250,30 L250,25 L260,25 L260,30 L270,30 L270,20 L278,20 L278,12 L283,12 L283,20 L290,20 L290,30 L300,30 L300,25 L310,25 L310,30 L320,30 L320,18 L325,18 L325,30 L335,30 L335,22 L345,22 L345,30 L355,30 L355,35 L375,35 L375,55 Z";

type Props = {
  heightFraction?: number; // 0..1 of screen height
  shieldSize?: number;
  showShield?: boolean;
  children?: React.ReactNode; // overlay content (e.g., back button)
};

export default function HeroBackground({
  heightFraction = 0.38,
  shieldSize = 80,
  showShield = true,
  children,
}: Props) {
  const { width, height } = useWindowDimensions();
  const heroHeight = useMemo(
    () => Math.round(height * heightFraction),
    [height, heightFraction],
  );
  const heroWidth = Math.min(width, 600);
  const waveHeight = 40;
  const wavePath = `M0,${waveHeight} Q${heroWidth / 2},0 ${heroWidth},${waveHeight} L${heroWidth},${waveHeight} L0,${waveHeight} Z`;

  return (
    <View style={[styles.hero, { height: heroHeight }]} testID="hero-bg">
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

      <View
        pointerEvents="none"
        style={[styles.skylineWrap, { bottom: waveHeight - 4 }]}
      >
        <Svg width={heroWidth} height={55} viewBox="0 0 375 55">
          <Path d={SKYLINE_PATH} fill="#061525" opacity={0.85} />
        </Svg>
      </View>

      {showShield && (
        <View style={styles.shieldCenter} pointerEvents="none">
          <Image
            source={require("../../../assets/images/myshield-shield-white.png")}
            style={{ width: shieldSize, height: shieldSize, tintColor: "#FFFFFF" }}
            resizeMode="contain"
          />
        </View>
      )}

      {children}

      <View pointerEvents="none" style={styles.waveWrap}>
        <Svg width={heroWidth} height={waveHeight}>
          <Path d={wavePath} fill="#F4F7FA" />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: "100%", overflow: "hidden", position: "relative" },
  star: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#FFFFFF",
    opacity: 0.7,
  },
  skylineWrap: { position: "absolute", left: 0, right: 0 },
  shieldCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  waveWrap: { position: "absolute", left: 0, right: 0, bottom: -1 },
});
