import { useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView, StatusBar,
  Vibration, Alert, Dimensions, Linking, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { BottomNav } from "./home";

// ============ DEMO DATA (sample red zones) ============
type Zone = { name: string; lat: number; lng: number; radiusKm: number };
type City = { name: string; lat: number; lng: number; zones: Zone[] };

const CITIES: City[] = [
  {
    name: "Jaipur", lat: 26.9124, lng: 75.7873,
    zones: [
      { name: "Murlipura", lat: 26.952, lng: 75.792, radiusKm: 1.6 },
      { name: "Jhotwara", lat: 26.938, lng: 75.735, radiusKm: 1.8 },
      { name: "Hathroi", lat: 26.918, lng: 75.798, radiusKm: 1.2 },
      { name: "Sanganer", lat: 26.816, lng: 75.795, radiusKm: 1.7 },
    ],
  },
  {
    name: "Delhi", lat: 28.6139, lng: 77.209,
    zones: [
      { name: "Seelampur", lat: 28.669, lng: 77.279, radiusKm: 2.0 },
      { name: "Bawana", lat: 28.766, lng: 77.034, radiusKm: 2.2 },
      { name: "Mundka", lat: 28.683, lng: 76.958, radiusKm: 1.9 },
      { name: "Welcome", lat: 28.651, lng: 77.281, radiusKm: 1.4 },
    ],
  },
  {
    name: "Mumbai", lat: 19.076, lng: 72.8777,
    zones: [
      { name: "Kurla", lat: 19.0728, lng: 72.8826, radiusKm: 1.6 },
      { name: "Govandi", lat: 19.042, lng: 72.931, radiusKm: 1.9 },
      { name: "Mankhurd", lat: 19.009, lng: 72.934, radiusKm: 1.5 },
      { name: "Dongri", lat: 18.956, lng: 72.831, radiusKm: 1.1 },
    ],
  },
  {
    name: "Ahmedabad", lat: 23.0225, lng: 72.5714,
    zones: [
      { name: "Sarkhej", lat: 22.981, lng: 72.509, radiusKm: 1.8 },
      { name: "Ramol", lat: 22.951, lng: 72.639, radiusKm: 1.7 },
      { name: "Vatva", lat: 22.991, lng: 72.631, radiusKm: 1.6 },
      { name: "Dani Limda", lat: 23.005, lng: 72.611, radiusKm: 1.2 },
    ],
  },
];

const RANGE_KM = 6;

function distKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export default function RouteGuidance() {
  const [user, setUser] = useState<Location.LocationObjectCoords | null>(null);
  const [mode, setMode] = useState<"me" | string>("me");
  const [locMsg, setLocMsg] = useState("");
  const alerted = useRef<Set<string>>(new Set());

  const size = Dimensions.get("window").width - 48;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocMsg("Location permission denied — city mode use karo.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setUser(loc.coords);
      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        (u) => setUser(u.coords)
      );
    })();
  }, []);

  const activeCity = useMemo(() => {
    if (mode !== "me" ) return CITIES.find((c) => c.name === mode)!;
    if (!user) return CITIES[0];
    return [...CITIES].sort(
      (a, b) => distKm(user.latitude, user.longitude, a.lat, a.lng) - distKm(user.latitude, user.longitude, b.lat, b.lng)
    )[0];
  }, [mode, user]);

  const center = mode === "me" && user ? { lat: user.latitude, lng: user.longitude } : { lat: activeCity.lat, lng: activeCity.lng };

  const zoneStats = activeCity.zones.map((z) => ({
    ...z,
    dist: user ? distKm(user.latitude, user.longitude, z.lat, z.lng) : null,
  }));
  const insideZone = user ? zoneStats.find((z) => z.dist! < z.radiusKm) : null;
  const nearZone = user ? zoneStats.find((z) => z.dist! < z.radiusKm + 1) : null;

  useEffect(() => {
    if (insideZone && !alerted.current.has(insideZone.name)) {
      alerted.current.add(insideZone.name);
      Vibration.vibrate([0, 400, 200, 400, 200, 400]);
      Alert.alert(
        "⚠️ HIGH CRIME AREA",
        `You are inside ${insideZone.name} (${activeCity.name}), a high-crime red zone. Please be careful and stay alert!`
      );
    }
  }, [insideZone, activeCity]);

  const toXY = (lat: number, lng: number) => {
    const kmX = (lng - center.lng) * 111 * Math.cos((center.lat * Math.PI) / 180);
    const kmY = (lat - center.lat) * 111;
    return {
      x: size / 2 + (kmX / RANGE_KM) * (size / 2),
      y: size / 2 - (kmY / RANGE_KM) * (size / 2),
    };
  };

  const userXY = user ? toXY(user.latitude, user.longitude) : null;
  const userOnRadar = userXY && userXY.x > -20 && userXY.x < size + 20 && userXY.y > -20 && userXY.y < size + 20;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="navigate" size={26} color="#FF4D4D" />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Route Guidance</Text>
            <Text style={styles.subtitle}>High-crime red zone radar (PUBG-style)</Text>
          </View>
        </View>

        {/* ⬇️ NAYA: DEMO NOTICE (header ke turant neeche) */}
        <View style={styles.demoNotice}>
          <Ionicons name="information-circle" size={16} color="#92400E" />
          <Text style={styles.demoNoticeText}>
            This feature is not working now — this is only for demo.
          </Text>
        </View>

        {/* Status banner */}
        {user ? (
          insideZone ? (
            <View style={[styles.banner, { backgroundColor: "#7F1D1D" }]}>
              <Text style={styles.bannerText}>⚠️ You are in {insideZone.name} — HIGH CRIME AREA. Please be careful!</Text>
            </View>
          ) : nearZone ? (
            <View style={[styles.banner, { backgroundColor: "#92400E" }]}>
              <Text style={styles.bannerText}>⚠️ Approaching {nearZone.name} red zone ({(nearZone.dist! - nearZone.radiusKm).toFixed(1)} km away). Drive carefully!</Text>
            </View>
          ) : (
            <View style={[styles.banner, { backgroundColor: "#14532D" }]}>
              <Text style={styles.bannerText}>✅ You are in a safe area. Stay alert!</Text>
            </View>
          )
        ) : (
          <View style={[styles.banner, { backgroundColor: "#1E3A8A" }]}>
            <Text style={styles.bannerText}>📡 {locMsg || "Getting your location..."}</Text>
          </View>
        )}

        {/* City chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          <Pressable style={[styles.chip, mode === "me" && styles.chipActive]} onPress={() => setMode("me")}>
            <Ionicons name="locate" size={14} color={mode === "me" ? "#0A1628" : "#93C5FD"} />
            <Text style={[styles.chipText, mode === "me" && styles.chipTextActive]}>My Location</Text>
          </Pressable>
          {CITIES.map((c) => (
            <Pressable key={c.name} style={[styles.chip, mode === c.name && styles.chipActive]} onPress={() => setMode(c.name)}>
              <Text style={[styles.chipText, mode === c.name && styles.chipTextActive]}>{c.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* RADAR */}
        <View style={[styles.radar, { width: size, height: size }]}>
          {[2, 4, 6].map((r) => (
            <View
              key={r}
              style={[
                styles.ring,
                { width: (r / RANGE_KM) * size, height: (r / RANGE_KM) * size, left: size / 2 - ((r / RANGE_KM) * size) / 2, top: size / 2 - ((r / RANGE_KM) * size) / 2 },
              ]}
            >
              <Text style={styles.ringLabel}>{r} km</Text>
            </View>
          ))}

          {activeCity.zones.map((z) => {
            const p = toXY(z.lat, z.lng);
            const d = (z.radiusKm / RANGE_KM) * size;
            return (
              <View key={z.name} style={[styles.zone, { width: d, height: d, left: p.x - d / 2, top: p.y - d / 2 }]}>
                <Text style={styles.zoneName}>{z.name}</Text>
              </View>
            );
          })}

          {userOnRadar && userXY && (
            <View style={[styles.userDot, { left: userXY.x - 8, top: userXY.y - 8 }]} />
          )}

          <Text style={styles.radarCity}>{activeCity.name} • {RANGE_KM} km range</Text>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: "rgba(255,77,77,0.5)" }]} />
            <Text style={styles.legendText}>High-crime red zone</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: "#3B82F6" }]} />
            <Text style={styles.legendText}>Your location</Text>
          </View>
        </View>

        {/* Nearby zones list */}
        <Text style={styles.listTitle}>🔴 Red Zones — {activeCity.name}</Text>
        {zoneStats
          .sort((a, b) => (a.dist ?? 999) - (b.dist ?? 999))
          .map((z) => (
            <View key={z.name} style={styles.zoneCard}>
              <View style={styles.zoneCardLeft}>
                <Ionicons name="warning" size={18} color="#FF4D4D" />
                <View>
                  <Text style={styles.zoneCardName}>{z.name}</Text>
                  <Text style={styles.zoneCardSub}>Radius: {z.radiusKm} km</Text>
                </View>
              </View>
              <Text style={[styles.zoneDist, z.dist !== null && z.dist < z.radiusKm && { color: "#FF4D4D" }]}>
                {z.dist === null ? "—" : z.dist < z.radiusKm ? "INSIDE!" : `${z.dist.toFixed(1)} km`}
              </Text>
            </View>
          ))}

        {/* Google Maps button */}
        <Pressable
          style={styles.mapsBtn}
          onPress={() =>
            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${activeCity.lat},${activeCity.lng}`)
          }
        >
          <Ionicons name="map" size={18} color="#FFFFFF" />
          <Text style={styles.mapsBtnText}>Open {activeCity.name} in Google Maps</Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          ⚠️ Demo data — sample zones for testing only. Production me real crime data API integrate hoga.
        </Text>
      </ScrollView>

      <BottomNav active="guidance" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A1628" },
  content: { padding: 16, paddingBottom: 24 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  subtitle: { fontSize: 11, color: "#93C5FD" },
  /* ⬇️ NAYA: DEMO NOTICE styles */
  demoNotice: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEF3C7", borderWidth: 1, borderColor: "#FCD34D",
    borderRadius: 12, padding: 10, marginBottom: 12,
  },
  demoNoticeText: { flex: 1, fontSize: 11.5, fontWeight: "700", color: "#92400E" },
  banner: { borderRadius: 12, padding: 12, marginBottom: 12 },
  bannerText: { color: "#FFFFFF", fontSize: 12.5, fontWeight: "700", textAlign: "center" },
  chips: { flexDirection: "row", marginBottom: 12 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: "#1E3A8A", marginRight: 8,
  },
  chipActive: { backgroundColor: "#93C5FD", borderColor: "#93C5FD" },
  chipText: { color: "#93C5FD", fontSize: 12, fontWeight: "700" },
  chipTextActive: { color: "#0A1628" },
  radar: {
    backgroundColor: "#061525", borderRadius: 20, overflow: "hidden",
    borderWidth: 1, borderColor: "#1E3A8A", alignSelf: "center",
  },
  ring: { position: "absolute", borderRadius: 9999, borderWidth: 1, borderColor: "rgba(59,130,246,0.25)" },
  ringLabel: { position: "absolute", top: 4, left: 8, fontSize: 9, color: "#3B82F6" },
  zone: {
    position: "absolute", borderRadius: 9999,
    backgroundColor: "rgba(255,77,77,0.28)", borderWidth: 2, borderColor: "#FF4D4D",
    alignItems: "center", justifyContent: "center",
  },
  zoneName: { color: "#FFC9C9", fontSize: 10, fontWeight: "800", textAlign: "center" },
  userDot: {
    position: "absolute", width: 16, height: 16, borderRadius: 8,
    backgroundColor: "#3B82F6", borderWidth: 3, borderColor: "#FFFFFF",
  },
  radarCity: { position: "absolute", bottom: 8, alignSelf: "center", fontSize: 10, color: "#93C5FD", fontWeight: "700" },
  legend: { flexDirection: "row", justifyContent: "center", gap: 20, marginTop: 12 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: "#9CA3AF", fontSize: 11 },
  listTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginTop: 18, marginBottom: 8 },
  zoneCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#101F35", borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: "#1E3A8A",
  },
  zoneCardLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  zoneCardName: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  zoneCardSub: { color: "#9CA3AF", fontSize: 10, marginTop: 1 },
  zoneDist: { color: "#93C5FD", fontSize: 13, fontWeight: "800" },
  mapsBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#1A56DB", borderRadius: 14, paddingVertical: 14, marginTop: 10,
  },
  mapsBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  disclaimer: { color: "#6B7280", fontSize: 10, textAlign: "center", marginTop: 12, lineHeight: 15 },
});