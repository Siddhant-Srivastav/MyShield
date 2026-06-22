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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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

const contacts = [
  {
    id: 1,
    name: "Siddhant",
    number: "89499.......",
    color: "#B46BFF",
    letter: "S",
  },
  {
    id: 2,
    name: "Mangilal Mehra",
    number: "87342.......",
    color: "#2ECC71",
    letter: "M",
  },
  {
    id: 3,
    name: "Nitesh",
    number: "3476.......",
    color: "#FF6B2C",
    letter: "N",
  },
];

export default function EmergencyContactsScreen() {
  const router = useRouter();

  const { height, width } = useWindowDimensions();

  const heroHeight = useMemo(() => Math.round(height * 0.19), [height]);

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
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>

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
        {/* Header */}
        <View style={styles.headingRow}>
          <View>
            <Text style={styles.heading}>
              Emergency Contacts
            </Text>

            <Text style={styles.subtitle}>
              These contacts will be notified during an emergency
            </Text>
          </View>

          <Ionicons
            name="information-circle-outline"
            size={28}
            color="#1A56DB"
          />
        </View>

        {/* Saved Contacts */}
        <Text style={styles.savedTitle}>
          Saved Contacts (3)
        </Text>

        {contacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: contact.color },
              ]}
            >
              <Text style={styles.avatarText}>
                {contact.letter}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.contactName}>
                {contact.name}
              </Text>

              <Text style={styles.contactNumber}>
                {contact.number}
              </Text>
            </View>

            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color="#4B5563"
            />
          </View>
        ))}

        {/* Add Contact */}
        <Pressable style={styles.addCard}>
          <View style={styles.addIconCircle}>
            <Ionicons
              name="person-add"
              size={34}
              color="#1A56DB"
            />
          </View>

          <Text style={styles.addTitle}>
            Add Contact
          </Text>

          <Text style={styles.addSub}>
            Add a new contact
          </Text>
        </Pressable>

        {/* Bottom Privacy */}
        <View style={styles.privacyRow}>
          <Ionicons
            name="lock-closed"
            size={14}
            color="#6B7280"
          />

          <Text style={styles.privacyText}>
            Your contacts are encrypted and will only be used{"\n"}
            during an emergency.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/home")}
        >
          <Ionicons
            name="home-outline"
            size={24}
            color="#6B7280"
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
            color="#6B7280"
          />

          <Text style={styles.navText}>
            Guidance
          </Text>
        </Pressable>

        <View style={styles.navItem}>
          <Ionicons
            name="people"
            size={24}
            color="#1A56DB"
          />

          <Text style={styles.activeNavText}>
            Emergency Contacts
          </Text>
        </View>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/settings")}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color="#6B7280"
          />

          <Text style={styles.navText}>
            Settings
          </Text>
        </Pressable>
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

  backBtn: {
    position: "absolute",
    left: 16,
    top: 8,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    zIndex: 10,
  },

  logoWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 56,
    height: 56,
    tintColor: "#FFFFFF",
  },

  waveWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
  },

  content: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 24,
  },

  headingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A2E",
  },

  subtitle: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
  },

  savedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A56DB",
    marginBottom: 14,
  },

  contactCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },

  contactName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A2E",
  },

  contactNumber: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 14,
  },

  addCard: {
    marginTop: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#9DB8FF",
    borderRadius: 20,
    paddingVertical: 34,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FBFF",
  },

  addIconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  addTitle: {
    color: "#1A56DB",
    fontSize: 22,
    fontWeight: "800",
  },

  addSub: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 14,
  },

  privacyRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  privacyText: {
    color: "#6B7280",
    fontSize: 11,
    textAlign: "center",
    marginLeft: 6,
    lineHeight: 16,
  },

  bottomNav: {
    height: 76,
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
    color: "#6B7280",
  },

  activeNavText: {
    marginTop: 4,
    fontSize: 11,
    color: "#1A56DB",
    fontWeight: "700",
  },
});

