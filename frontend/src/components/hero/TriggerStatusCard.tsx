import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";

export default function TriggerStatusCard() {
  const [showWarning, setShowWarning] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        let vol = "";
        let st = "missing";
        try {
          vol = (await FileSystem.readAsStringAsync(
            `${FileSystem.documentDirectory}volume_trigger_enabled`
          )).trim();
        } catch {}
        try {
          st = (await FileSystem.readAsStringAsync(
            `${FileSystem.documentDirectory}volume_trigger_status`
          )).trim();
        } catch {}
        setShowWarning(vol === "1" && st !== "on");
      })();
    }, [])
  );

  if (!showWarning) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>⚠️ Volume Trigger stopped</Text>
      <Text style={styles.sub}>
        The trigger service stopped (after an update, restart or battery restriction). Tap below and turn ON the trigger in Accessibility settings.
      </Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={async () => {
          try {
            await Linking.sendIntent("android.settings.ACCESSIBILITY_SETTINGS");
          } catch {
            try { await Linking.openSettings(); } catch {}
          }
        }}
      >
        <Text style={styles.btnText}>🔧 FIX Trigger</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FEF2F2", borderRadius: 16, padding: 16,
    marginHorizontal: 16, marginVertical: 8, borderWidth: 1, borderColor: "#FECACA",
  },
  title: { fontSize: 15, fontWeight: "800", color: "#991B1B", marginBottom: 6 },
  sub: { fontSize: 12, color: "#7F1D1D", marginBottom: 10, lineHeight: 17 },
  btn: { backgroundColor: "#DC2626", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" },
});