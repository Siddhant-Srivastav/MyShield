import { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import HeroBackground from "@/src/components/hero/HeroBackground";

const BLUE = "#1A56DB";
const NAVY = "#1A1A2E";
const MUTED = "#6B7280";
const PILL_BORDER = "#D6E4FF";

export default function PhotoUpload() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [uri, setUri] = useState<string | null>(null);

  const ensurePermission = async () => {
    const current = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) {
      Alert.alert(
        "Photo access needed",
        "Please enable Photos access for MyShield in Settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ],
      );
      return false;
    }
    const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return req.granted;
  };

  const pickImage = async () => {
    const ok = await ensurePermission();
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
      selectionLimit: 1,
    });
    if (!result.canceled && result.assets[0]) {
      setUri(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.root} testID="photo-upload-screen">
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      <HeroBackground heightFraction={0.24} shieldSize={60}>
        <SafeAreaView edges={["top"]} style={styles.heroOverlay} pointerEvents="box-none">
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            testID="photo-back-btn"
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
        </SafeAreaView>
      </HeroBackground>

      <View
        style={[
          styles.content,
          { paddingBottom: insets.bottom + 12 },
        ]}
      >
        <Text style={styles.title} testID="photo-title">
          <Text style={styles.titleDark}>Add Your </Text>
          <Text style={styles.titleBlue}>Photo</Text>
        </Text>
        <Text style={styles.subtitle}>
          This photo helps emergency responders{"\n"}identify you quickly.
        </Text>

        {/* Photo container */}
        <View style={styles.photoBox} testID="photo-box">
          <View style={styles.pill}>
            <Text style={styles.pillText}>Add your single photo only</Text>
          </View>

          <View style={[styles.cornerBtn, styles.cornerLeft]}>
            <Ionicons name="flash" size={16} color="#FFFFFF" />
          </View>
          <View style={[styles.cornerBtn, styles.cornerRight]}>
            <Ionicons name="images" size={16} color="#FFFFFF" />
          </View>

          {uri ? (
            <Image source={{ uri }} style={styles.preview} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder} testID="photo-placeholder">
              <View style={styles.dashedOval}>
                <Ionicons name="person" size={120} color="#3F3F46" />
              </View>
            </View>
          )}
        </View>

        {/* Buttons */}
        {!uri ? (
          <Pressable
            onPress={pickImage}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
            testID="photo-add-btn"
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Add</Text>
          </Pressable>
        ) : (
          <View style={styles.btnRow}>
            <Pressable
              onPress={() => {
                setUri(null);
                pickImage();
              }}
              style={({ pressed }) => [
                styles.retakeBtn,
                pressed && { opacity: 0.85 },
              ]}
              testID="photo-retake-btn"
            >
              <MaterialCommunityIcons name="refresh" size={18} color={BLUE} />
              <Text style={styles.retakeText}>Retake</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/emergency-contacts")}
              style={({ pressed }) => [
                styles.continueBtn,
                pressed && { opacity: 0.9 },
              ]}
              testID="photo-continue-btn"
            >
              <Text style={styles.continueText}>Continue</Text>
              <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        )}

        <View style={styles.security}>
          <Ionicons name="lock-closed" size={14} color={MUTED} />
          <Text style={styles.securityText}>
            Your photo is securely stored and will only be{"\n"}used for emergency identification.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F4F7FA" },
  heroOverlay: { flex: 1, paddingHorizontal: 16 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  content: { flex: 1, paddingHorizontal: 20, paddingTop: 4 },
  title: { textAlign: "center" },
  titleDark: { fontSize: 26, fontWeight: "700", color: NAVY },
  titleBlue: { fontSize: 26, fontWeight: "700", color: BLUE },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: MUTED,
    textAlign: "center",
    lineHeight: 18,
  },

  photoBox: {
    marginTop: 14,
    width: "100%",
    height: 320,
    backgroundColor: "#000000",
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  pill: {
    position: "absolute",
    top: 14,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 2,
  },
  pillText: { color: "#FFFFFF", fontSize: 11, fontWeight: "500" },
  cornerBtn: {
    position: "absolute",
    top: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  cornerLeft: { left: 14 },
  cornerRight: { right: 14 },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dashedOval: {
    width: 220,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
    overflow: "hidden",
  },
  preview: { width: "100%", height: "100%" },

  primaryBtn: {
    marginTop: 16,
    height: 56,
    backgroundColor: BLUE,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
  },

  btnRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },
  retakeBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: PILL_BORDER,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  retakeText: { color: BLUE, fontSize: 15, fontWeight: "700", marginLeft: 6 },
  continueBtn: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    backgroundColor: BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  continueText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700", marginRight: 4 },

  security: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 8,
  },
  securityText: {
    color: MUTED,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
    marginLeft: 6,
    ...(Platform.OS === "web" ? { maxWidth: 280 } : {}),
  },
});
