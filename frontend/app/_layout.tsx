import { Stack, router } from "expo-router";
import notifee, { EventType } from "@notifee/react-native";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { AppState, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";

import { useIconFonts } from "@/src/hooks/use-icon-fonts";
import { isProtectionEnabled, enableProtection } from "../utils/protectionService";

// Prevent auto hide
SplashScreen.preventAutoHideAsync();

// Global Status Bar
StatusBar.setBarStyle("dark-content");
StatusBar.setBackgroundColor("#F4F7FA");
StatusBar.setTranslucent(false);

export default function RootLayout() {
  const [loaded, error] = useIconFonts();
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    if (loaded || error) {
      // UI paint hone ka wait karo, phir splash hatao (Flash rokne ke liye)
      setTimeout(() => {
        SplashScreen.hideAsync();
        setIsAppReady(true);
      }, 100);
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

  // ===== AppState listener (Optimized) =====
  useEffect(() => {
    let isAppActive = false;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && !isAppActive) {
        isAppActive = true;
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

  // ❌ CRITICAL FIX: Kabhi bhi 'null' return mat karo! Solid background return karo.
  if (!loaded && !error) {
    return <View style={{ flex: 1, backgroundColor: '#F4F7FA' }} />;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <View style={{ flex: 1, backgroundColor: '#F4F7FA' }}>
        <Stack 
          screenOptions={{ 
            headerShown: false, 
            animation: 'none',
            contentStyle: { backgroundColor: '#F4F7FA' } // Route change flash rokne ke liye
          }} 
        />
      </View>
    </SafeAreaProvider>
  );
}