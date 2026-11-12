import notifee, { AndroidImportance, AndroidVisibility } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, Vibration, Linking } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

const PROTECTION_KEY = "protection_enabled";
const NOTIF_SHOWN_KEY = "notif_already_shown";
const PAYMENT_MODE_KEY = "payment_mode";
export const CHANNEL_ID = "myshield-protection";
export const NOTIF_ID = "myshield-protection-active";

// ---------- Permission ----------
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= 1;
}

// ---------- State ----------
export async function isProtectionEnabled(): Promise<boolean> {
  const v = await AsyncStorage.getItem(PROTECTION_KEY);
  return v === "1";
}

// ---------- ENABLE: persistent lock-screen notification ----------
export async function enableProtection(): Promise<boolean> {
  if (Platform.OS !== "android") return false;

  const ok = await requestNotificationPermission();
  if (!ok) return false;

  // Notification already shown hai to dobara post mat karo (spam fix)
  const alreadyShown = await AsyncStorage.getItem(NOTIF_SHOWN_KEY);
  if (alreadyShown === "1") {
    await AsyncStorage.setItem(PROTECTION_KEY, "1");
    try {
      await FileSystem.writeAsStringAsync(
        `${FileSystem.documentDirectory}protection_enabled_native`,
        "1"
      );
    } catch {}
    return true;
  }

  // Channel sirf ek baar banao
  const channels = await notifee.getChannels();
  const channelExists = channels.some((ch) => ch.id === CHANNEL_ID);
  if (!channelExists) {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: "MyShield Protection",
      description: "Lock screen emergency trigger",
      importance: AndroidImportance.DEFAULT,
      vibration: false,
      visibility: AndroidVisibility.PUBLIC,
    });
  }

  // Ek baar chhota vibration feedback
  Vibration.vibrate(200);

  await notifee.displayNotification({
    id: NOTIF_ID,
    title: "🛡️ MyShield Protection ON",
    body: "Emergency me ALERT dabao — bina unlock",
    data: { type: "protection-alert" },
    android: {
      channelId: CHANNEL_ID,
      ongoing: true,
      autoCancel: false,
      visibility: AndroidVisibility.PUBLIC,
      asForegroundService: true,
      color: "#DC2626",
      actions: [
        {
          title: "🚨 ALERT",
          pressAction: {
            id: "alert",
            launchActivity: "default",
          },
        },
      ],
    },
  });

  await AsyncStorage.setItem(PROTECTION_KEY, "1");
  await AsyncStorage.setItem(NOTIF_SHOWN_KEY, "1");

  try {
    await FileSystem.writeAsStringAsync(
      `${FileSystem.documentDirectory}protection_enabled_native`,
      "1"
    );
  } catch {}

  return true;
}

// ---------- DISABLE ----------
export async function disableProtection(): Promise<void> {
  await notifee.cancelNotification(NOTIF_ID);
  await AsyncStorage.setItem(PROTECTION_KEY, "0");
  await AsyncStorage.removeItem(NOTIF_SHOWN_KEY);

  try {
    await FileSystem.writeAsStringAsync(
      `${FileSystem.documentDirectory}protection_enabled_native`,
      "0"
    );
  } catch {}
}

// ---------- PAYMENT MODE (UPI/Banking apps ke liye) ----------
export async function enterPaymentMode(): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(
      `${FileSystem.documentDirectory}volume_trigger_selfdisable`,
      "1"
    );
  } catch {}
  await AsyncStorage.setItem(PAYMENT_MODE_KEY, "1");
}

export async function exitPaymentMode(): Promise<void> {
  await AsyncStorage.setItem(PAYMENT_MODE_KEY, "0");
  await openAccessibilitySettings();
}

export async function isPaymentMode(): Promise<boolean> {
  return (await AsyncStorage.getItem(PAYMENT_MODE_KEY)) === "1";
}

// ---------- Native trigger status (watchdog/auto-pause se) ----------
export async function isTriggerPausedNative(): Promise<boolean> {
  try {
    const s = await FileSystem.readAsStringAsync(
      `${FileSystem.documentDirectory}volume_trigger_status`
    );
    return s.trim() === "paused" || s.trim() === "off";
  } catch {
    return false;
  }
}

// ---------- Custom finance apps add karna ----------
export async function addFinanceApp(pkg: string): Promise<void> {
  try {
    const f = `${FileSystem.documentDirectory}finance_apps_extra`;
    let cur = "";
    try {
      cur = await FileSystem.readAsStringAsync(f);
    } catch {}
    if (!cur.includes(pkg)) {
      cur = cur ? cur + "," + pkg : pkg;
      await FileSystem.writeAsStringAsync(f, cur);
    }
  } catch {}
}

// ---------- Settings helpers (sendIntent = sahi tarika) ----------
export async function openAccessibilitySettings(): Promise<void> {
  try {
    await Linking.sendIntent("android.settings.ACCESSIBILITY_SETTINGS");
  } catch {
    try {
      await Linking.openSettings();
    } catch {}
  }
}

export async function openUsageAccessSettings(): Promise<void> {
  try {
    await Linking.sendIntent("android.settings.USAGE_ACCESS_SETTINGS");
  } catch {
    try {
      await Linking.openSettings();
    } catch {}
  }
}