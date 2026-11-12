import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";

const ADB_CMD = "adb shell pm grant com.myshield.app android.permission.WRITE_SECURE_SETTINGS";

export default function AutoModeSetupCard() {
  const showCmd = () => {
    // Android par Alert ka text long-press karke copy ho sakta hai — koi Clipboard import nahi chahiye
    Alert.alert("ADB Command", ADB_CMD + "\n\n(is text ko long-press karke copy karo)");
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>⚡ Auto-Mode Setup (sirf 1 baar)</Text>

      <Text style={styles.line}>👉 Step 1: PC se ADB grant (optional, 1-tap magic ke liye)</Text>
      <TouchableOpacity onPress={showCmd}>
        <Text style={styles.cmd}>📋 Command dekhne ke liye tap karo</Text>
      </TouchableOpacity>

      <Text style={[styles.line, { marginTop: 10 }]}>👉 Step 2: Usage Access allow karo</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          try {
            Linking.openURL("android.settings.USAGE_ACCESS_SETTINGS");
          } catch (e) {}
        }}
      >
        <Text style={styles.btnText}>Usage Access kholo</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        Setup ke baad: payment app kholo = trigger auto-OFF, wapas aao = notification se ON.
        Bina setup ke bhi app poori tarah kaam karegi (ALERT button mode).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  title: { fontSize: 15, fontWeight: "800", color: "#166534", marginBottom: 8 },
  line: { fontSize: 13, color: "#374151", marginBottom: 6 },
  cmd: { color: "#1D4ED8", textDecorationLine: "underline", fontSize: 13 },
  btn: { backgroundColor: "#16A34A", borderRadius: 12, paddingVertical: 12, alignItems: "center", marginBottom: 8 },
  btnText: { color: "#fff", fontWeight: "700" },
  hint: { fontSize: 12, color: "#166534", fontStyle: "italic" },
});