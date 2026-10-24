import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
  Vibration,
  StatusBar,
  Image,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

const HOLD_DURATION = 1500;
const RING_SIZE = 260;
const RING_STROKE = 10;
const INNER = RING_SIZE - RING_STROKE;
const CIRCUMFERENCE = Math.PI * INNER;
const BUTTON_SIZE = 190;

export default function HoldScreen() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      animRef.current?.stop();
    };
  }, []);

  const resetHold = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    animRef.current?.stop();
    progress.setValue(0);
    setIsHolding(false);
  };

  const startHold = () => {
    if (completed) return;
    setIsHolding(true);
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_DURATION,
      useNativeDriver: false,
    });
    animRef.current = anim;
    anim.start();

    timerRef.current = setTimeout(() => {
      setCompleted(true);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        Vibration.vibrate([0, 80, 60, 80]);
      }
      router.replace("/lock-alert/countdown");
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    if (completed) return;
    resetHold();
  };

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <View style={styles.root}>

      {/* Top: Logo + Title */}
      <View style={styles.top}>
        <Image
          source={require("../../assets/images/myshield-shield.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>MyShield</Text>
        <Text style={styles.sub}>Emergency Alert</Text>
      </View>

      {/* Center: Green HOLD button with ring */}
      <View style={styles.center}>
        <Pressable
          onPressIn={startHold}
          onPressOut={cancelHold}
          style={styles.holdTarget}
          delayLongPress={100000}
        >
          <Svg
            width={RING_SIZE}
            height={RING_SIZE}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          >
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={INNER / 2}
              stroke="#E5E7EB"
              strokeWidth={RING_STROKE}
              fill="none"
            />
            <AnimatedCircle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={INNER / 2}
              stroke="#16A34A"
              strokeWidth={RING_STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              rotation="-90"
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            />
          </Svg>

          <View style={[styles.holdButton, isHolding && styles.holdButtonActive]}>
            <Text style={styles.holdText}>
              {isHolding ? "HOLD..." : "HOLD"}
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Bottom */}
      <View style={styles.bottom}>
        <Text style={styles.instruction}>
          Button ko 1.5 second hold karo
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.cancelBtn}>
          <Ionicons name="close" size={18} color="#6B7280" />
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 50,
  },
  top: { alignItems: "center" },
  logo: { width: 56, height: 56 },
  title: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "900",
    color: "#1A1A2E",
    letterSpacing: 0.5,
  },
  sub: { marginTop: 2, fontSize: 13, color: "#6B7280" },
  center: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  holdTarget: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  holdButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#16A34A",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  holdButtonActive: {
    backgroundColor: "#15803D",
    transform: [{ scale: 0.96 }],
  },
  holdText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 2,
  },
  bottom: { alignItems: "center", gap: 14 },
  instruction: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  cancelText: { color: "#6B7280", fontSize: 13, fontWeight: "600" },
});