import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking, Clipboard, Alert } from "react-native";
import { PermissionsAndroid } from "react-native";

export default function AutoModeSetupCard() {
  const [adbOk, setAdbOk] = useState(false);

  useEffect(() => {
    PermissionsAndroid.check("android.permission.WRITE_SECURE_SETTINGS" as any).then(setAdbOk);
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.title}> Auto-Mode Setup (1 baar)</Text>
      <Text style={styles.line}>
        {adbOk ? "✅" : "❌"} Step 1: PC se ADB grant {"\n"}
        <Text style={styles.cmd} onPress={() => { Clipboard.setString("adb shell pm grant com.myshield.app android.permission.WRITE_SECURE_SETTINGS"); Alert.alert("Command copy ho gayi!"); }}>
          (command copy karne ke liye tap karo)
        </Text>
      </Text>
      <Text style={styles.line}>👉 Step 2: Usage Access allow karo</Text>
      <TouchableOpacity style={styles.btn} onPress={() => Linking.openURL("android.settings.USAGE_ACCESS_SETTINGS")}>
        <Text style={styles.btnText}>Usage Access kholo</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>Dono complete hone ke baad: payment app = auto-OFF, wapas aao = notification se 1-TAP ON. Settings me jaana nahi padega!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#F0FDF4", borderRadius: 16, padding: 16, marginHorizontal: 16, marginVertical: 8, borderWidth: 1, borderColor: "#BBF7D0" },
  title: { fontSize: 15, fontWeight: "800", color: "#166534", marginBottom: 8 },
  line: { fontSize: 13, color: "#374151", marginBottom: 8 },
  cmd: { color: "#1D4ED8", textDecorationLine: "underline" },
  btn: { backgroundColor: "#16A34A", borderRadius: 12, paddingVertical: 12, alignItems: "center", marginBottom: 8 },
  btnText: { color: "#fff", fontWeight: "700" },
  hint: { fontSize: 12, color: "#166534", fontStyle: "italic" },
});