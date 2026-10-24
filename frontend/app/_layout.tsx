import { Stack, router } from "expo-router";
import notifee, { EventType } from "@notifee/react-native";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { AppState, StatusBar, StyleSheet, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";

import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { isProtectionEnabled, enableProtection } from "../utils/protectionService";

// Keep the native splash visible from cold start until icon fonts register.
SplashScreen.preventAutoHideAsync();

// Global status bar style (ek baar set, har screen par apply)
StatusBar.setBarStyle("dark-content");
StatusBar.setBackgroundColor("#F4F7FA");

export default function RootLayout() {
  const [loaded, error] = useIconFonts();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
      setIsReady(true);
    }
  }, [loaded, error]);

  // ===== MyShield Lock Alert routing =====
  useEffect(() => {
    const boot = async () => {
      try {
        const initial = await notifee.getInitialNotification();
        if (initial?.pressAction?.id === "alert") {
          router.replace("/lock-alert/hold");
          return;
        }
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

  // ===== AppState listener (optimized — baar-baar call nahi hoga) =====
  useEffect(() => {
    let isAppActive = false;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && !isAppActive) {
        isAppActive = true;
        // 500ms debounce — flicker rokne ke liye
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          try {
            if (await isProtectionEnabled()) {
              await enableProtection();
            }
          } catch {}
        }, 500);
      } else if (state !== "active") {
        isAppActive = false;
        if (debounceTimer) {
          clearTimeout(debounceTimer);
          debounceTimer = null;
        }
      }
    });

    return () => {
      sub.remove();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, []);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <KeyboardProvider>
        <View style={styles.root}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F4F7FA",
  },
});