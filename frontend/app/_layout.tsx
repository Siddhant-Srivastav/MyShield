import { Stack, router } from "expo-router";
import notifee, { EventType } from "@notifee/react-native";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { isProtectionEnabled, enableProtection } from "../utils/protectionService";

// Keep the native splash visible from cold start until icon fonts register.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useIconFonts();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // ===== MyShield Lock Alert routing =====
  useEffect(() => {
    const boot = async () => {
      try {
        // App killed thi aur notification ALERT se khuli
        const initial = await notifee.getInitialNotification();
        if (initial?.pressAction?.id === "alert") {
          router.replace("/lock-alert/hold");
          return;
        }
        // Protection ON thi par notification mari hui (reboot/OEM kill) → wapas lao
        if (await isProtectionEnabled()) {
          await enableProtection();
        }
      } catch (e) {
        console.log("Notifee boot error:", e);
      }
    };

    boot();

    const unsub = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.ACTION_PRESS && detail.pressAction?.id === "alert") {
        router.replace("/lock-alert/hold");
      }
    });

    return () => unsub();
  }, []);

  // If the CDN is unreachable we fall through on error rather than wedging
  // the app — icons will tofu, but the app still boots.
  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}