import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import notifee from "@notifee/react-native";
import * as FileSystem from "expo-file-system/legacy";
import {
  enableProtection,
  disableProtection,
  isProtectionEnabled,
} from "../utils/protectionService";
import { getTriggerLogs } from "../utils/triggerLog";
import type { TriggerLogEntry } from "../utils/triggerLog";

const VOL_FILE = () => `${FileSystem.documentDirectory}volume_trigger_enabled`;
const STATUS_FILE = () => `${FileSystem.documentDirectory}volume_trigger_status`;

async function readVolEnabled(): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(VOL_FILE());
    if (!info.exists) return false;
    return (await FileSystem.readAsStringAsync(VOL_FILE())).trim() === "1";
  } catch {
    return false;
  }
}

async function readServiceStatus(): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(STATUS_FILE());
    if (!info.exists) return false;
    return (await FileSystem.readAsStringAsync(STATUS_FILE())).trim() === "on";
  } catch {
    return false;
  }
}

async function openAccessibilitySettings() {
  try {
    await Linking.sendIntent("android.settings.ACCESSIBILITY_SETTINGS");
  } catch {
    try {
      await Linking.openURL(
        "intent:#Intent;action=android.settings.ACCESSIBILITY_SETTINGS;end"
      );
    } catch {}
  }
}

export default function ProtectionScreen() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [batteryRestricted, setBatteryRestricted] = useState(false);
  const [logs, setLogs] = useState<TriggerLogEntry[]>([]);
  const [volumeOn, setVolumeOn] = useState(false);
  const [accessibilityOn, setAccessibilityOn] = useState(false);

  const refresh = useCallback(async () => {
    setEnabled(await isProtectionEnabled());
    setLogs(await getTriggerLogs());
    setVolumeOn(await readVolEnabled());
    setAccessibilityOn(await readServiceStatus());
    try {
      setBatteryRestricted(await notifee.isBatteryOptimizationEnabled());
    } catch {}
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleToggle(value: boolean) {
    if (busy) return;
    setBusy(true);
    try {
      if (value) {
        const ok = await enableProtection();
        if (!ok) {
          Alert.alert(
            "Permission chahiye",
            "Lock screen alert ke liye notification permission zaroori hai.",
            [
              { text: "Baad me", style: "cancel" },
              { text: "Settings", onPress: () => Linking.openSettings() },
            ]
          );
          setEnabled(false);
        } else {
          setEnabled(true);
          try {
            const restricted = await notifee.isBatteryOptimizationEnabled();
            setBatteryRestricted(restricted);
            if (restricted) {
              Alert.alert(
                "Battery optimization ON hai",
                "MyShield background me mar sakti hai. MyShield ko 'Unrestricted' karo.",
                [
                  { text: "Baad me", style: "cancel" },
                  {
                    text: "Settings kholo",
                    onPress: () => notifee.openBatteryOptimizationSettings(),
                  },
                ]
              );
            }
          } catch {}
        }
      } else {
        await disableProtection();
        setEnabled(false);
      }
    } catch (e) {
      console.log("Protection toggle error:", e);
    } finally {
      setBusy(false);
      refresh();
    }
  }

  async function handleVolumeToggle(value: boolean) {
    try {
      await FileSystem.writeAsStringAsync(VOL_FILE(), value ? "1" : "0");
      setVolumeOn(value);
      if (value) {
        const on = await readServiceStatus();
        setAccessibilityOn(on);
        if (!on) {
          Alert.alert(
            "Accessibility enable karo",
            "Volume trigger ke liye: Phone Settings → Accessibility → 'MyShield Volume Trigger' → ON karo.",
            [
              { text: "Baad me", style: "cancel" },
              { text: "Settings kholo", onPress: openAccessibilitySettings },
            ]
          );
        }
      }
    } catch (e) {
      console.log("Volume toggle error:", e);
    }
    refresh();
  }

  const recentLogs = logs.slice(-10).reverse();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#1A1A2E" />
        </Pressable>
        <Text style={styles.headerTitle}>Lock Screen Protection</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status card */}
        <View style={[styles.statusCard, enabled ? styles.statusOn : styles.statusOff]}>
          <View style={styles.statusRow}>
            <Ionicons
              name={enabled ? "shield-checkmark" : "shield-outline"}
              size={34}
              color={enabled ? "#16A34A" : "#9CA3AF"}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.statusTitle}>
                {enabled ? "Protection ON" : "Protection OFF"}
              </Text>
              <Text style={styles.statusSub}>
                {enabled
                  ? "Lock screen par ALERT button active hai"
                  : "Toggle ON karo — lock screen par alert button milega"}
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={handleToggle}
              disabled={busy}
              trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
              thumbColor={enabled ? "#16A34A" : "#F9FAFB"}
            />
          </View>
        </View>

        {/* ===== VOLUME TRIGGER (NAYA) ===== */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Ionicons name="volume-high" size={26} color="#1A56DB" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.statusTitle}>Volume Trigger (Beta)</Text>
              <Text style={styles.statusSub}>
                Volume button 3 baar tez dabao → alert shuru (lock par bhi)
              </Text>
            </View>
            <Switch
              value={volumeOn}
              onValueChange={handleVolumeToggle}
              trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
              thumbColor={volumeOn ? "#1A56DB" : "#F9FAFB"}
            />
          </View>

          {volumeOn && !accessibilityOn && (
            <Pressable style={styles.warnCard} onPress={openAccessibilitySettings}>
              <Ionicons name="accessibility" size={20} color="#B45309" />
              <Text style={styles.warnText}>
                Accessibility service OFF hai — tap karke settings kholo:
                "MyShield Volume Trigger" ko ON karo
              </Text>
            </Pressable>
          )}

          {volumeOn && accessibilityOn && (
            <View style={styles.okRow}>
              <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
              <Text style={styles.okText}>
                Service active — 3 fast volume presses = alert
              </Text>
            </View>
          )}
        </View>

        {/* How it works */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kaise kaam karega?</Text>
          <View style={styles.bulletRow}>
            <Ionicons name="lock-closed" size={16} color="#1A56DB" />
            <Text style={styles.bullet}>
              Phone locked hone par bhi notification me 🚨 ALERT button dikhega
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="hand-left" size={16} color="#1A56DB" />
            <Text style={styles.bullet}>
              ALERT tap karo → shield ko 1.5 sec hold karo (galti se trigger nahi hoga)
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="volume-high" size={16} color="#1A56DB" />
            <Text style={styles.bullet}>
              Ya volume button 3 baar tez dabao — countdown shuru ho jayegi
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="timer" size={16} color="#1A56DB" />
            <Text style={styles.bullet}>
              10 second cancel window milega — phir alert contacts ko chali jayegi
            </Text>
          </View>
        </View>

        {/* Battery warning */}
        {batteryRestricted && (
          <Pressable
            style={styles.warnCard}
            onPress={() => notifee.openBatteryOptimizationSettings()}
          >
            <Ionicons name="battery-dead" size={20} color="#B45309" />
            <Text style={styles.warnText}>
              Battery optimization ON hai — MyShield background me mar sakti hai. Tap
              karke "Unrestricted" karo.
            </Text>
          </Pressable>
        )}

        <Pressable style={styles.guideRow} onPress={() => Linking.openSettings()}>
          <Ionicons name="notifications" size={18} color="#6B7280" />
          <Text style={styles.guideText}>App notification settings kholo</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </Pressable>

        {/* Pilot logs */}
        <Text style={styles.logsTitle}>Pilot Trigger Logs (last 10)</Text>
        {recentLogs.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.bullet}>Abhi koi trigger nahi hua.</Text>
          </View>
        ) : (
          recentLogs.map((log, i) => (
            <View key={i} style={styles.logRow}>
              <Ionicons
                name={log.status === "sent" ? "checkmark-circle" : "close-circle"}
                size={18}
                color={log.status === "sent" ? "#16A34A" : "#9CA3AF"}
              />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.logMain}>
                  {log.status === "sent" ? "ALERT SENT" : "CANCELLED"} • {log.trigger_type}
                </Text>
                <Text style={styles.logSub}>
                  {new Date(log.timestamp).toLocaleString()}
                  {log.seconds_elapsed != null ? ` • ${log.seconds_elapsed}s` : ""}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F4F7FA" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: "#FFFFFF",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
    color: "#1A1A2E",
  },
  content: { padding: 16, paddingBottom: 40 },
  statusCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
  statusOn: { backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#BBF7D0" },
  statusOff: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB" },
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  statusSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEF1F5",
  },
  cardTitle: { fontSize: 14, fontWeight: "800", color: "#111827", marginBottom: 8 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8, gap: 8 },
  bullet: { flex: 1, fontSize: 12, color: "#4B5563", lineHeight: 18 },
  warnCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  warnText: { flex: 1, fontSize: 12, color: "#92400E", lineHeight: 17 },
  okRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  okText: { flex: 1, fontSize: 12, color: "#16A34A", fontWeight: "700" },
  guideRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEF1F5",
  },
  guideText: { flex: 1, fontSize: 13, color: "#374151", fontWeight: "600" },
  logsTitle: { fontSize: 14, fontWeight: "800", color: "#111827", marginBottom: 8 },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#EEF1F5",
  },
  logMain: { fontSize: 12, fontWeight: "700", color: "#111827" },
  logSub: { fontSize: 10, color: "#6B7280", marginTop: 2 },
});