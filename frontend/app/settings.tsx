import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import {
  Ionicons,
  MaterialIcons,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useMemo } from "react";
import { useRouter } from "expo-router";

const STAR_POSITIONS: [number, number][] = [
  [8, 12], [15, 8], [22, 18], [28, 6], [35, 14],
  [42, 9], [48, 20], [55, 7], [62, 15], [68, 5],
  [75, 11], [82, 19], [88, 8], [92, 16], [5, 25],
  [18, 30], [32, 22], [45, 28], [58, 24], [71, 30],
  [85, 23], [12, 35], [38, 38], [65, 33], [90, 36],
];

const SKYLINE_PATH =
  "M0,55 L0,35 L15,35 L15,25 L25,25 L25,30 L35,30 L35,15 L40,15 L40,30 L50,30 L50,20 L55,20 L55,30 L65,30 L65,10 L70,10 L70,5 L75,5 L75,10 L80,10 L80,30 L90,30 L90,22 L95,22 L95,18 L100,18 L100,22 L110,22 L110,30 L120,30 L120,25 L130,25 L130,15 L135,15 L135,25 L145,25 L145,30 L155,30 L155,20 L165,20 L165,12 L170,12 L170,8 L175,8 L175,12 L180,12 L180,20 L190,20 L190,28 L200,28 L200,18 L205,18 L205,28 L215,28 L215,22 L225,22 L225,30 L235,30 L235,15 L240,15 L240,30 L250,30 L250,25 L260,25 L260,30 L270,30 L270,20 L278,20 L278,12 L283,12 L283,20 L290,20 L290,30 L300,30 L300,25 L310,25 L310,30 L320,30 L320,18 L325,18 L325,30 L335,30 L335,22 L345,22 L345,30 L355,30 L355,35 L375,35 L375,55 Z";

const preferenceItems = [
  {
    title: "Change Language",
    subtitle: "Choose your preferred language",
    icon: "language",
    color: "#1565FF",
    value: "English",
  },
  {
    title: "Edit Contacts",
    subtitle: "Add, remove or update your emergency contacts",
    icon: "people",
    color: "#16C02B",
  },
  {
    title: "Notification Settings",
    subtitle: "Manage your alert and notification preferences",
    icon: "notifications",
    color: "#8B3DFF",
  },
];

const privacyItems = [
  {
    title: "Privacy Settings",
    subtitle: "Control your data, permissions and privacy preferences",
    icon: "shield-lock",
    color: "#1565FF",
    type: "MaterialCommunityIcons",
  },
  {
    title: "Data & Access",
    subtitle: "Manage your data and app access",
    icon: "lock",
    color: "#FF8A00",
  },
  {
    title: "Location Sharing",
    subtitle: "Manage your location sharing preferences",
    icon: "location-sharp",
    color: "#16CDB5",
    value: "Always On",
  },
];

const otherItems = [
  {
    title: "Help & Support",
    subtitle: "Get help and contact support",
    icon: "help-circle",
    color: "#4B7CFF",
  },
  {
    title: "Terms & Conditions",
    subtitle: "Read our terms and conditions",
    icon: "document-text",
    color: "#5DCB2A",
  },
  {
    title: "About MyShield",
    subtitle: "App version and information",
    icon: "information-circle",
    color: "#9CA3AF",
    value: "v1.0.0",
  },
];

export default function SettingsScreen() {
  const router = useRouter();

  const { height, width } = useWindowDimensions();

  const heroHeight = useMemo(() => Math.round(height * 0.18), [height]);

  const heroWidth = Math.min(width, 600);

  const waveHeight = 36;

  const wavePath = `M0,${waveHeight} Q${heroWidth / 2},0 ${heroWidth},${waveHeight} L${heroWidth},${waveHeight} L0,${waveHeight} Z`;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      {/* HERO */}
      <View style={[styles.hero, { height: heroHeight }]}>
        <LinearGradient
          colors={["#0A1628", "#1A3A6C"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {STAR_POSITIONS.map(([leftPct, topPct], i) => (
          <View
            key={`star-${i}`}
            style={[styles.star, { left: `${leftPct}%`, top: `${topPct}%` }]}
          />
        ))}

        <View style={[styles.skylineWrap, { bottom: waveHeight - 4 }]}>
          <Svg width={heroWidth} height={55} viewBox="0 0 375 55">
            <Path d={SKYLINE_PATH} fill="#061525" opacity={0.85} />
          </Svg>
        </View>

        <SafeAreaView edges={["top"]} style={styles.heroSafe}>
          <View style={styles.logoWrap}>
            <Image
              source={require("../assets/images/myshield-shield-white.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>

        <View style={styles.waveWrap}>
          <Svg width={heroWidth} height={waveHeight}>
            <Path d={wavePath} fill="#F4F7FA" />
          </Svg>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* PREFERENCES */}
        <Text style={styles.sectionTitle}>
          PREFERENCES
        </Text>

        <View style={styles.card}>
          {preferenceItems.map((item, index) => (
            <Pressable key={index} style={styles.settingRow}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: item.color },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.textWrap}>
                <Text style={styles.settingTitle}>
                  {item.title}
                </Text>

                <Text style={styles.settingSubtitle}>
                  {item.subtitle}
                </Text>
              </View>

              <View style={styles.rightWrap}>
                {item.value ? (
                  <Text style={styles.valueText}>
                    {item.value}
                  </Text>
                ) : null}

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#8A8FA3"
                />
              </View>
            </Pressable>
          ))}
        </View>

        {/* PRIVACY */}
        <Text style={styles.sectionTitle}>
          PRIVACY & SECURITY
        </Text>

        <View style={styles.card}>
          {privacyItems.map((item, index) => (
            <Pressable key={index} style={styles.settingRow}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: item.color },
                ]}
              >
                {item.type === "MaterialCommunityIcons" ? (
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={22}
                    color="#FFFFFF"
                  />
                ) : (
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color="#FFFFFF"
                  />
                )}
              </View>

              <View style={styles.textWrap}>
                <Text style={styles.settingTitle}>
                  {item.title}
                </Text>

                <Text style={styles.settingSubtitle}>
                  {item.subtitle}
                </Text>
              </View>

              <View style={styles.rightWrap}>
                {item.value ? (
                  <Text style={styles.valueText}>
                    {item.value}
                  </Text>
                ) : null}

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#8A8FA3"
                />
              </View>
            </Pressable>
          ))}
        </View>

        {/* OTHERS */}
        <Text style={styles.sectionTitle}>
          OTHERS
        </Text>

        <View style={styles.card}>
          {otherItems.map((item, index) => (
            <Pressable key={index} style={styles.settingRow}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: item.color },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.textWrap}>
                <Text style={styles.settingTitle}>
                  {item.title}
                </Text>

                <Text style={styles.settingSubtitle}>
                  {item.subtitle}
                </Text>
              </View>

              <View style={styles.rightWrap}>
                {item.value ? (
                  <Text style={styles.valueText}>
                    {item.value}
                  </Text>
                ) : null}

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#8A8FA3"
                />
              </View>
            </Pressable>
          ))}
        </View>

        {/* LOGOUT */}
        <Pressable style={styles.logoutBtn}>
          <MaterialIcons
            name="logout"
            size={22}
            color="#FF4D4D"
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </Pressable>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/home")}
        >
          <Ionicons
            name="home-outline"
            size={24}
            color="#8A8FA3"
          />

          <Text style={styles.navText}>
            Home
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/guidance")}
        >
          <Ionicons
            name="compass-outline"
            size={24}
            color="#8A8FA3"
          />

          <Text style={styles.navText}>
            Guidance
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/emergency-contacts")}
        >
          <Ionicons
            name="people-outline"
            size={24}
            color="#8A8FA3"
          />

          <Text style={styles.navText}>
            Contacts
          </Text>
        </Pressable>

        <View style={styles.navItem}>
          <Ionicons
            name="settings"
            size={24}
            color="#1565FF"
          />

          <Text style={styles.activeNavText}>
            Settings
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F4F7FA",
  },

  hero: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },

  heroSafe: {
    flex: 1,
    alignItems: "center",
  },

  star: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#FFFFFF",
    opacity: 0.7,
  },

  skylineWrap: {
    position: "absolute",
    left: 0,
    right: 0,
  },

  logoWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 58,
    height: 58,
    tintColor: "#FFFFFF",
  },

  waveWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 20,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1565FF",
    marginTop: 10,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 12,
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  textWrap: {
    flex: 1,
  },

  settingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
  },

  settingSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 18,
    color: "#6B7280",
  },

  rightWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  valueText: {
    color: "#1565FF",
    fontWeight: "700",
    fontSize: 12,
  },

  logoutBtn: {
    marginTop: 8,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FFD7D7",
    backgroundColor: "#FFF5F5",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  logoutText: {
    color: "#FF4D4D",
    fontWeight: "700",
    fontSize: 16,
  },

  bottomNav: {
    height: 74,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },

  navText: {
    marginTop: 4,
    fontSize: 11,
    color: "#8A8FA3",
  },

  activeNavText: {
    marginTop: 4,
    fontSize: 11,
    color: "#1565FF",
    fontWeight: "700",
  },
});

