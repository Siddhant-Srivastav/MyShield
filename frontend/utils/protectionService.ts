import notifee, { AndroidImportance, AndroidVisibility } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, Vibration } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

const PROTECTION_KEY = "protection_enabled";
const NOTIF_SHOWN_KEY = "notif_already_shown"; // ⬅️ NAYA: duplicate prevention
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

  // ⬇️ NAYA: Agar notification already shown hai, toh dobara mat post karo
  const alreadyShown = await AsyncStorage.getItem(NOTIF_SHOWN_KEY);
  if (alreadyShown === "1") {
    console.log("✅ Notification already shown, skipping duplicate");
    await AsyncStorage.setItem(PROTECTION_KEY, "1");
    return true;
  }

  // ⬇️ Channel sirf EK BAAR create karo (recreate mat karo)
  const channels = await notifee.getChannels();
  const channelExists = channels.some((ch) => ch.id === CHANNEL_ID);
  
  if (!channelExists) {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: "MyShield Protection",
      description: "Lock screen emergency trigger",
      importance: AndroidImportance.DEFAULT, // ⬅️ CHANGED: HIGH → DEFAULT (silent)
      vibration: false, // ⬅️ CHANGED: true → false (no vibration from channel)
      sound: undefined,
      visibility: AndroidVisibility.PUBLIC,
    });
  }

  // ⬇️ NAYA: Manual vibration SIRF PEHLI BAAR (jab protection ON hoti hai)
  Vibration.vibrate(200); // Ek chhota jhatka
  console.log("📳 Vibration triggered once");

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
  await AsyncStorage.setItem(NOTIF_SHOWN_KEY, "1"); // ⬅️ NAYA: mark as shown

  // ⬇️ Native boot receiver ke liye flag file
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
  await AsyncStorage.removeItem(NOTIF_SHOWN_KEY); // ⬅️ NAYA: reset flag (next time ON hone par vibration milegi)

  // ⬇️ Native boot receiver ko batao ki protection OFF hai
  try {
    await FileSystem.writeAsStringAsync(
      `${FileSystem.documentDirectory}protection_enabled_native`,
      "0"
    );
  } catch {}
}