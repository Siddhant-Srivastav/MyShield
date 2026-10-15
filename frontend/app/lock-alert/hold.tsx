import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
  Vibration,
  StatusBar,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

const HOLD_DURATION = 1500; // 1.5 seconds
const RING_SIZE = 280;
const RING_STROKE = 12;
const INNER = RING_SIZE - RING_STROKE;
const CIRCUMFERENCE = Math.PI * INNER;

export default function HoldScreen() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Screen khulte hi cleanup
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

    // Animate ring fill 0 → 1 over 1.5s
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_DURATION,
      useNativeDriver: false,
    });
    animRef.current = anim;
    anim.start();

    // 1.5s baad complete
    timerRef.current = setTimeout(() => {
      setCompleted(true);
      // Strong haptic
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        Vibration.vibrate([0, 80, 60, 80]);
      }
      // Countdown screen par jao
      router.replace("/lock-alert/countdown");
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    if (completed) return;
    resetHold();
  };

  // Ring progress 0..1 → strokeDashoffset (CIRCUMFERENCE → 0)
  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      {/* Top hint */}
      <View style={styles.topHint}>
        <Text style={styles.hintTitle}>Emergency Alert</Text>
        <Text style={styles.hintSub}>
          Shield ko {HOLD_DURATION / 1000} second hold karo
        </Text>
      </View>

      {/* Central hold target */}
      <View style={styles.center}>
        <Pressable
          onPressIn={startHold}
          onPressOut={cancelHold}
          style={({ pressed }) => [
            styles.holdTarget,
            pressed && { transform: [{ scale: 0.96 }] },
          ]}
          delayLongPress={100000} // long-press gesture block
        >
          {/* Background circle */}
          <View style={styles.innerDisc}>
            <Ionicons
              name="shield"
              size={100}
              color={isHolding ? "#FFFFFF" : "#DC2626"}
            />
            <Ionicons
              name="alert"
              size={36}
              color={isHolding ? "#FFFFFF" : "#DC2626"}
              style={styles.alertIcon}
            />
          </View>

          {/* Progress ring */}
          <Svg
            width={RING_SIZE}
            height={RING_SIZE}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          >
            {/* Track (grey background ring) */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={INNER / 2}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={RING_STROKE}
              fill="none"
            />
            {/* Progress ring (red fill) */}
            <AnimatedCircle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={INNER / 2}
              stroke="#DC2626"
              strokeWidth={RING_STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              rotation="-90"
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            />
          </Svg>
        </Pressable>
      </View>

      {/* Bottom instruction */}
      <View style={styles.bottomHint}>
        <Text style={styles.instruction}>
          {isHolding
            ? "🔴 Hold... release to cancel"
            : "Hold the shield to trigger alert"}
        </Text>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.cancelBtn}
        >
          <Ionicons name="close-circle" size={28} color="#9CA3AF" />
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Animated SVG Circle
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0A1628",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
  },
  topHint: { alignItems: "center" },
  hintTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  hintSub: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 6,
  },
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
  innerDisc: {
    width: RING_SIZE - RING_STROKE * 2 - 20,
    height: RING_SIZE - RING_STROKE * 2 - 20,
    borderRadius: (RING_SIZE - RING_STROKE * 2 - 20) / 2,
    backgroundColor: "rgba(220, 38, 38, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.4)",
  },
  alertIcon: {
    position: "absolute",
    bottom: 20,
  },
  bottomHint: { alignItems: "center", gap: 16 },
  instruction: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  cancelText: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
  },
});