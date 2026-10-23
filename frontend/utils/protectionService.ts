import notifee, { AndroidImportance, AndroidVisibility } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";   // ⬅️ NAYA

const PROTECTION_KEY = "protection_enabled";
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

  await notifee.createChannel({
    id: CHANNEL_ID,
    name: "MyShield Protection",
    description: "Lock screen emergency trigger",
    importance: AndroidImportance.HIGH,
    vibration: true,
    sound: undefined,
    visibility: AndroidVisibility.PUBLIC,
  });

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

  // ⬇️ NAYA: native boot receiver ke liye flag file
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

  // ⬇️ NAYA: native boot receiver ko batao ki protection OFF hai
  try {
    await FileSystem.writeAsStringAsync(
      `${FileSystem.documentDirectory}protection_enabled_native`,
      "0"
    );
  } catch {}
}