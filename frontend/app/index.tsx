import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useRouter } from "expo-router";

const NAVY = "#1E3A5F";
const BLUE = "#4A90D9";

export default function SplashScreen() {
  const router = useRouter();
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

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

    const timer = setTimeout(() => {
      router.replace("/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, [logoOpacity, textOpacity, router]);

  return (
    <View style={styles.container} testID="splash-screen">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.center}>
        <Animated.View
          style={[styles.logoWrap, { opacity: logoOpacity }]}
          testID="splash-logo"
        >
          <Image
            source={require("../assets/images/myshield-logo-clean.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoWrap: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  eyebrow: {
    marginTop: 12,
    fontSize: 11,
    color: NAVY,
    textAlign: "center",
    letterSpacing: 3,
    fontWeight: "600",
  },
  tagline: {
    marginTop: 28,
    fontSize: 15,
    color: BLUE,
    textAlign: "center",
    fontWeight: "500",
  },
});
