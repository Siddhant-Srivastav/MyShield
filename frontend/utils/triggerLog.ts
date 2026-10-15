import AsyncStorage from "@react-native-async-storage/async-storage";

export type TriggerLogEntry = {
  timestamp: string;
  trigger_type: "lock_hold" | "volume" | "in_app";
  status: "sent" | "cancelled";
  seconds_elapsed?: number;
};

const KEY = "trigger_logs";

export async function logTrigger(entry: TriggerLogEntry) {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const logs: TriggerLogEntry[] = raw ? JSON.parse(raw) : [];
    logs.push(entry);
    await AsyncStorage.setItem(KEY, JSON.stringify(logs.slice(-200)));

    // Backend par bhi bhejo (Step 5 me endpoint banega; tab tak silent fail)
    try {
      await fetch("https://myshield-api.onrender.com/api/pilot/trigger-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch {}
  } catch (e) {
    console.log("logTrigger error:", e);
  }
}

export async function getTriggerLogs(): Promise<TriggerLogEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}