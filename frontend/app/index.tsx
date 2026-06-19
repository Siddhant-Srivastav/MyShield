import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useRouter } from "expo-router";

const NAVY = "#1E3A5F";
const BLUE = "#4A90D9";
const MUTED = "#6B7280";
const LOGO_SIZE = 180;

export default function SplashScreen() {
  const router = useRouter();
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(0.9)).current;
  const pulseOpacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.35,
            duration: 1400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 0.9,
            duration: 600,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.45,
            duration: 600,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    pulse.start();

    const timer = setTimeout(() => {
      router.replace("/home");
    }, 6000);

    return () => {
      clearTimeout(timer);
      pulse.stop();
    };
  }, [logoOpacity, textOpacity, pulseScale, pulseOpacity, router]);

  return (
    <View style={styles.container} testID="splash-screen">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View
        style={[styles.logoBlock, { opacity: logoOpacity }]}
        testID="splash-logo"
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pulse,
            {
              opacity: pulseOpacity,
              transform: [{ scale: pulseScale }],
            },
          ]}
          testID="splash-logo-pulse"
        />
        <Image
          source={require("../assets/images/myshield-shield.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text
        style={[styles.brand, { opacity: textOpacity }]}
        testID="splash-brand"
      >
        MyShield
      </Animated.Text>

      <Animated.Text
        style={[styles.eyebrow, { opacity: textOpacity }]}
        testID="splash-eyebrow"
      >
        EMERGENCY RESPONSE & SAFETY
      </Animated.Text>

      <Animated.Text
        style={[styles.tagline, { opacity: textOpacity }]}
        testID="splash-tagline"
      >
        Emergency Help When Every Second Matters
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoBlock: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "absolute",
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: BLUE,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  brand: {
    marginTop: 24,
    fontSize: 32,
    fontWeight: "700",
    color: NAVY,
    textAlign: "center",
  },
  eyebrow: {
    marginTop: 8,
    fontSize: 12,
    color: BLUE,
    letterSpacing: 3,
    fontWeight: "600",
    textAlign: "center",
  },
  tagline: {
    marginTop: 16,
    fontSize: 14,
    color: MUTED,
    textAlign: "center",
    fontWeight: "400",
  },
});
