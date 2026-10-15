import notifee, { AndroidImportance, AndroidVisibility } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

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
    sound: undefined, // 🔇 silent alert
    visibility: AndroidVisibility.PUBLIC, // lock screen par full content
  });

  await notifee.displayNotification({
    id: NOTIF_ID,
    title: "🛡️ MyShield Protection ON",
    body: "Emergency me ALERT dabao — bina unlock",
    data: { type: "protection-alert" },
    android: {
      channelId: CHANNEL_ID,
      ongoing: true, // user swipe se nahi hat sakti
      autoCancel: false,
      visibility: AndroidVisibility.PUBLIC,
      asForegroundService: true, // background me zinda rahe
      color: "#DC2626",
      actions: [
        {
          title: "🚨 ALERT",
          pressAction: {
            id: "alert",
            launchActivity: "default", // app kholo (lock ke upar)
          },
        },
      ],
    },
  });

  await AsyncStorage.setItem(PROTECTION_KEY, "1");
  return true;
}

// ---------- DISABLE ----------
export async function disableProtection(): Promise<void> {
  await notifee.cancelNotification(NOTIF_ID);
  await AsyncStorage.setItem(PROTECTION_KEY, "0");
}