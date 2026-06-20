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
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";

import HeroBackground from "@/src/components/hero/HeroBackground";

export default function Welcome() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const heroFraction = useMemo(() => 0.38, []);

  return (
    <View style={styles.root} testID="welcome-screen">
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      <HeroBackground heightFraction={heroFraction} shieldSize={80} />

      <SafeAreaView edges={["bottom"]} style={styles.bottom} testID="welcome-bottom">
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
              icon={<MaterialCommunityIcons name="shield-check" size={24} color="#1A56DB" />}
              label="PROTECT"
              sub={"We keep\nyou safe"}
              testID="feature-protect"
            />
            <FeatureColumn
              circleBg="#FFF0F0"
              color="#DC2626"
              icon={<MaterialCommunityIcons name="alarm-light" size={24} color="#DC2626" />}
              label="RESPOND"
              sub={"We act\nimmediately"}
              testID="feature-respond"
            />
            <FeatureColumn
              circleBg="#F0FFF4"
              color="#16A34A"
              icon={<MaterialCommunityIcons name="heart-pulse" size={24} color="#16A34A" />}
              label="SAVE"
              sub={"We help\nsave lives"}
              testID="feature-save"
            />
          </View>

          <Pressable
            onPress={() => router.push("/login")}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
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
            style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.9 }]}
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
              <Text style={styles.securityText}>Your data is secure with us.</Text>
            </View>
            <Text style={styles.securityTrust}>Privacy • Security • Trust</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function FeatureColumn({
  circleBg, color, icon, label, sub, testID,
}: {
  circleBg: string; color: string; icon: React.ReactNode; label: string; sub: string; testID: string;
}) {
  return (
    <View style={styles.feature} testID={testID}>
      <View style={[styles.featureCircle, { backgroundColor: circleBg }]}>{icon}</View>
      <Text style={[styles.featureLabel, { color }]}>{label}</Text>
      <Text style={styles.featureSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F4F7FA" },
  bottom: { flex: 1, backgroundColor: "#F4F7FA" },
  bottomInner: { flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 },
  heading: { textAlign: "center", marginTop: 4 },
  headingDark: { fontSize: 22, fontWeight: "700", color: "#1A1A2E" },
  headingBlue: { fontSize: 22, fontWeight: "700", color: "#1A56DB" },
  subtitle: { marginTop: 8, fontSize: 11, color: "#6B7280", textAlign: "center", lineHeight: 16 },
  features: { flexDirection: "row", justifyContent: "space-evenly", marginTop: 12 },
  feature: { alignItems: "center", width: 96 },
  featureCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  featureLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  featureSub: { fontSize: 10, color: "#6B7280", textAlign: "center", marginTop: 4, lineHeight: 13 },
  primaryBtn: { marginTop: 14, height: 50, backgroundColor: "#1A3A6C", borderRadius: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  primaryBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700", marginLeft: 12 },
  secondaryBtn: { marginTop: 10, height: 50, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 2, borderColor: "#1A56DB", paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  secondaryBtnText: { color: "#1A56DB", fontSize: 15, fontWeight: "700", marginLeft: 12 },
  btnLeft: { flexDirection: "row", alignItems: "center" },
  btnIconBubble: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  btnBubbleImg: { width: 22, height: 22 },
  security: { marginTop: 10, alignItems: "center" },
  securityRow: { flexDirection: "row", alignItems: "center" },
  securityText: { color: "#6B7280", fontSize: 12, marginLeft: 6 },
  securityTrust: { color: "#1A56DB", fontSize: 11, marginTop: 4 },
});
