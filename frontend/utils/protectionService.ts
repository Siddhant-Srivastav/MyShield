import notifee, { AndroidImportance, AndroidVisibility } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, Vibration } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

const PROTECTION_KEY = "protection_enabled";
const NOTIF_SHOWN_KEY = "notif_already_shown";
export const CHANNEL_ID = "myshield-protection";
export const NOTIF_ID = "myshield-protection-active";

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= 1;
}

export async function isProtectionEnabled(): Promise<boolean> {
  const v = await AsyncStorage.getItem(PROTECTION_KEY);
  return v === "1";
}

export async function enableProtection(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  const ok = await requestNotificationPermission();
  if (!ok) return false;

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
          pressAction: { id: "alert", launchActivity: "default" },
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