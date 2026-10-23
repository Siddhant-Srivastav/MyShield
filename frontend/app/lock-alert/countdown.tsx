import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Vibration,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { logTrigger } from "../../utils/triggerLog";
import { useLocalSearchParams } from "expo-router";

const COUNTDOWN_SECONDS = 10;
const API_URL = "https://myshield-api.onrender.com";

type Status = "counting" | "sending" | "sent" | "cancelled";

export default function CountdownScreen() {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const params = useLocalSearchParams<{ trigger?: string }>();
  const triggerType = params.trigger === "volume" ? "volume" : "lock_hold";
  const [status, setStatus] = useState<Status>("counting");
  const secondsRef = useRef(COUNTDOWN_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef(Date.now());
  const doneRef = useRef(false);

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const exitToLock = () => {
    BackHandler.exitApp(); // app band → phone wapas lock screen par
  };

  // ===== v1 Safety Emergency logic (same backend endpoint) =====
  async function sendAlert() {
    if (doneRef.current) return;
    doneRef.current = true;
    stopTimer();
    Vibration.cancel();
    setStatus("sending");
    const elapsed = COUNTDOWN_SECONDS - secondsRef.current;

    // Location lo (8 sec max wait)
    let lat = 0;
    let lon = 0;
    try {
      const pos = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<null>((res) => setTimeout(() => res(null), 8000)),
      ]);
      const finalPos = pos ?? (await Location.getLastKnownPositionAsync());
      if (finalPos) {
        lat = finalPos.coords.latitude;
        lon = finalPos.coords.longitude;
      }
    } catch (e) {
      console.log("Location error:", e);
    }

    // User id
    let userId = "";
    try {
      const raw = await AsyncStorage.getItem("user");
      if (raw) userId = JSON.parse(raw).id || "";
    } catch {}

    // v1 alert trigger — contacts ko email + location
    try {
      await fetch(`${API_URL}/api/emergency/safety`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, latitude: lat, longitude: lon }),
      });
    } catch (e) {
      console.log("Alert send error:", e);
    }

    await logTrigger({
      timestamp: new Date().toISOString(),
      trigger_type: triggerType,
      status: "sent",
      seconds_elapsed: elapsed,
    });

    setStatus("sent");
    Vibration.vibrate([0, 120, 80, 120]);
    setTimeout(exitToLock, 4000);
  }

  async function cancelAlert() {
    if (doneRef.current) return;
    doneRef.current = true;
    stopTimer();
    Vibration.cancel();
    const elapsed = COUNTDOWN_SECONDS - secondsRef.current;
    await logTrigger({
      timestamp: new Date().toISOString(),
      trigger_type: triggerType,
      status: "cancelled",
      seconds_elapsed: elapsed,
    });
    setStatus("cancelled");
    setTimeout(exitToLock, 2500);
  }

  useEffect(() => {
    // Silent vibration loop (koi sound nahi)
    Vibration.vibrate([0, 400, 800], true);

    intervalRef.current = setInterval(() => {
      secondsRef.current -= 1;
      setSecondsLeft(secondsRef.current);
      if (secondsRef.current <= 0) {
        sendAlert();
      }
    }, 1000);

    return () => {
      stopTimer();
      Vibration.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#7F1D1D" />

      {status === "counting" && (
        <>
          <Text style={styles.title}>🚨 EMERGENCY ALERT</Text>
          <Text style={styles.sub}>
            {COUNTDOWN_SECONDS} second me alert bhej di jayegi
          </Text>

          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{secondsLeft}</Text>
          </View>

          <Pressable style={styles.cancelBtn} onPress={cancelAlert}>
            <Ionicons name="close-circle" size={26} color="#FFFFFF" />
            <Text style={styles.cancelText}>CANCEL ALERT</Text>
          </Pressable>

          <Pressable style={styles.sendNowBtn} onPress={sendAlert}>
            <Ionicons name="flash" size={18} color="#7F1D1D" />
            <Text style={styles.sendNowText}>Send Now</Text>
          </Pressable>
        </>
      )}

      {status === "sending" && (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.centerTitle}>Alert bheji ja rahi hai...</Text>
        </View>
      )}

      {status === "sent" && (
        <View style={styles.centerBox}>
          <Ionicons name="checkmark-circle" size={90} color="#22C55E" />
          <Text style={styles.centerTitle}>Alert Sent!</Text>
          <Text style={styles.centerSub}>
            Contacts ko location + details bhej di gayi hain
          </Text>
        </View>
      )}

      {status === "cancelled" && (
        <View style={styles.centerBox}>
          <Ionicons name="close-circle" size={90} color="#9CA3AF" />
          <Text style={styles.centerTitle}>Alert Cancelled</Text>
          <Text style={styles.centerSub}>Koi alert nahi bheji gayi</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#7F1D1D",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 18,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
  },
  sub: {
    color: "#FECACA",
    fontSize: 14,
    textAlign: "center",
    marginTop: -8,
  },
  timerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    marginVertical: 8,
  },
  timerText: {
    color: "#FFFFFF",
    fontSize: 72,
    fontWeight: "900",
  },
  cancelBtn: {
    width: "100%",
    height: 64,
    borderRadius: 16,
    backgroundColor: "#DC2626",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  cancelText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
  },
  sendNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
  },
  sendNowText: {
    color: "#7F1D1D",
    fontSize: 15,
    fontWeight: "800",
  },
  centerBox: { alignItems: "center", gap: 10 },
  centerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  centerSub: {
    color: "#FECACA",
    fontSize: 13,
    textAlign: "center",
  },
});