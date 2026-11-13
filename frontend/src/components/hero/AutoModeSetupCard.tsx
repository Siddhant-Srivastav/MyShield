import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

export default function AutoModeSetupCard() {
  const pauseNow = async () => {
    try {
      await FileSystem.writeAsStringAsync(
        `${FileSystem.documentDirectory}volume_trigger_selfdisable`,
        "1"
      );
      await AsyncStorage.setItem("payment_mode", "1");
      Alert.alert(
        "⏸️ Trigger Pause ho raha hai",
        "3-5 second me Volume Trigger band ho jayega.\n\nAb payment app kholo — koi accessibility warning NAHI aayegi."
      );
    } catch (e) {
      Alert.alert("Error", String(e));
    }
  };

  const resumeNow = async () => {
    try {
      await AsyncStorage.setItem("payment_mode", "0");
      Alert.alert(
        "🛡️ Trigger Resume",
        "Accessibility page khul raha hai — 'MyShield Volume Trigger' ko ON kar do. Bas!"
      );
      await Linking.sendIntent("android.settings.ACCESSIBILITY_SETTINGS");
    } catch (e) {
      try { await Linking.openSettings(); } catch (e2) {}
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>💳 Payment Mode</Text>

      <TouchableOpacity style={[styles.btn, { backgroundColor: "#DC2626" }]} onPress={pauseNow}>
        <Text style={styles.btnText}>⏸️ Payment se pehle PAUSE karo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, { backgroundColor: "#16A34A" }]} onPress={resumeNow}>
        <Text style={styles.btnText}>🛡️ Payment ke baad RESUME karo</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        Flow: PAUSE → 5 sec ruko → payment app kholo (warning nahi aayegi) → payment karo → wapas aao → RESUME → trigger ON.
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
  title: { fontSize: 15, fontWeight: "800", color: "#166534", marginBottom: 10 },
  btn: { borderRadius: 12, paddingVertical: 13, alignItems: "center", marginBottom: 8 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  hint: { fontSize: 12, color: "#166534", fontStyle: "italic", marginTop: 4, lineHeight: 17 },
});