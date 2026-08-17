import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";

const API_BASE_URL =
  "https://playstation-dose-becoming-spray.trycloudflare.com";

const STAR_POSITIONS: [number, number][] = [
  [8, 12],
  [15, 8],
  [22, 18],
  [28, 6],
  [35, 14],
  [42, 9],
  [48, 20],
  [55, 7],
  [62, 15],
  [68, 5],
  [75, 11],
  [82, 19],
  [88, 8],
  [92, 16],
  [5, 25],
  [18, 30],
  [32, 22],
  [45, 28],
  [58, 24],
  [71, 30],
  [85, 23],
  [12, 35],
  [38, 38],
  [65, 33],
  [90, 36],
];

const SKYLINE_PATH =
  "M0,55 L0,35 L15,35 L15,25 L25,25 L25,30 L35,30 L35,15 L40,15 L40,30 L50,30 L50,20 L55,20 L55,30 L65,30 L65,10 L70,10 L70,5 L75,5 L75,10 L80,10 L80,30 L90,30 L90,22 L95,22 L95,18 L100,18 L100,22 L110,22 L110,30 L120,30 L120,25 L130,25 L130,15 L135,15 L135,25 L145,25 L145,30 L155,30 L155,20 L165,20 L165,12 L170,12 L170,8 L175,8 L175,12 L180,12 L180,20 L190,20 L190,28 L200,28 L200,18 L205,18 L205,28 L215,28 L215,22 L225,22 L225,30 L235,30 L235,15 L240,15 L240,30 L250,30 L250,25 L260,25 L260,30 L270,30 L270,20 L278,20 L278,12 L283,12 L283,20 L290,20 L290,30 L300,30 L300,25 L310,25 L310,30 L320,30 L320,18 L325,18 L325,30 L335,30 L335,22 L345,22 L345,30 L355,30 L355,35 L375,35 L375,55 Z";

type EmergencyContact = {
  name: string;
  relationship: string;
  mobile: string;
};

const CONTACT_COLORS = [
  "#B46BFF",
  "#2ECC71",
  "#FF6B2C",
  "#1A56DB",
  "#E91E63",
];

export default function EmergencyContactsScreen() {
  const router = useRouter();

  const { height, width } = useWindowDimensions();

  const heroHeight = useMemo(
    () => Math.round(height * 0.19),
    [height]
  );

  const heroWidth = Math.min(width, 600);

  const waveHeight = 36;

  const wavePath = `M0,${waveHeight} Q${
    heroWidth / 2
  },0 ${heroWidth},${waveHeight} L${heroWidth},${waveHeight} L0,${waveHeight} Z`;

  // ---------------------------------------------------------
  // STATE
  // ---------------------------------------------------------

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [newName, setNewName] = useState("");
  const [newRelationship, setNewRelationship] = useState("");
  const [newMobile, setNewMobile] = useState("");

  // ---------------------------------------------------------
  // GET USER ID
  // ---------------------------------------------------------

  const [userId, setUserId] = useState<string | null>(null);

  // ---------------------------------------------------------
  // LOAD USER ID
  // ---------------------------------------------------------

  useEffect(() => {
    loadUserId();
  }, []);

  async function loadUserId() {
    try {
      // We will first try the storage used by the app.
      //
      // Change "user" below only if your login code uses
      // a different storage key.

      const AsyncStorage = require(
        "@react-native-async-storage/async-storage"
      ).default;

      const savedUser = await AsyncStorage.getItem("user");

      if (!savedUser) {
        Alert.alert(
          "Login required",
          "Please login again to load your emergency contacts."
        );

        setLoading(false);
        return;
      }

const parsedUser = JSON.parse(savedUser);

const id = parsedUser.id || parsedUser._id;

if (!id) {
  console.log("Saved user object:", parsedUser);

  Alert.alert(
    "User information missing",
    "User ID was not found. Please login again."
  );

  setLoading(false);
  return;
}

setUserId(String(id));

await loadContacts(String(id));
    } catch (error) {
      console.log("Load user ID error:", error);

      Alert.alert(
        "Error",
        "Unable to load your account information."
      );

      setLoading(false);
    }
  }

  // ---------------------------------------------------------
  // GET CONTACTS FROM BACKEND
  // ---------------------------------------------------------

  async function loadContacts(id: string) {
    try {
      setLoading(true);

      const url = `${API_BASE_URL}/api/users/${id}/emergency-contacts`;

console.log("GET CONTACTS URL:", url);

const response = await fetch(url);

console.log("GET CONTACTS STATUS:", response.status);

const data = await response.json();

console.log("GET CONTACTS RESPONSE:", data);

if (!response.ok || !data.success) {
  throw new Error(
    data.message ||`Server error: ${response.status}`
  );
}

      setContacts(data.emergency_contacts || []);
    } catch (error) {
      console.log("Load contacts error:", error);

      Alert.alert(
        "Unable to load contacts",
        "Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------
  // SAVE CONTACTS TO BACKEND
  // ---------------------------------------------------------

  async function saveContacts(
    updatedContacts: EmergencyContact[]
  ) {
    if (!userId) {
      Alert.alert(
        "Error",
        "User information is missing. Please login again."
      );
      return false;
    }

    if (updatedContacts.length <1 ) {
      Alert.alert(
        "Minimum contacts required",
        "MyShield requires at least 2 emergency contacts."
      );
      return false;
    }

    if (updatedContacts.length > 5) {
      Alert.alert(
        "Maximum contacts reached",
        "You can save a maximum of 5 emergency contacts."
      );
      return false;
    }

    try {
      setSaving(true);

     const url = `${API_BASE_URL}/api/users/${userId}/emergency-contacts`;

console.log("SAVE CONTACTS URL:", url);

console.log(
  "SAVE CONTACTS BODY:",
  JSON.stringify({
    contacts: updatedContacts,
  })
);

const response = await fetch(url, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    contacts: updatedContacts,
  }),
});

console.log("SAVE CONTACTS STATUS:", response.status);

const data = await response.json();

console.log("SAVE CONTACTS RESPONSE:", data);

if (!response.ok || !data.success) {
  throw new Error(
    data.message || `Server error: ${response.status}`
  );
}

      setContacts(data.emergency_contacts || updatedContacts);

      return true;
    } catch (error) {
      console.log("Save contacts error:", error);

      Alert.alert(
        "Failed to save",
        "Unable to save your emergency contacts. Please try again."
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------
  // ADD CONTACT
  // ---------------------------------------------------------

  async function handleAddContact() {
    const name = newName.trim();
    const relationship = newRelationship.trim();
    const mobile = newMobile.trim();

    if (!name) {
      Alert.alert("Missing name", "Please enter the contact name.");
      return;
    }

    if (!relationship) {
      Alert.alert(
        "Missing relationship",
        "Please enter the relationship."
      );
      return;
    }

    if (!mobile) {
      Alert.alert(
        "Missing mobile number",
        "Please enter the mobile number."
      );
      return;
    }

    if (contacts.length >= 5) {
      Alert.alert(
        "Maximum reached",
        "You can have a maximum of 5 emergency contacts."
      );
      return;
    }

    const newContact: EmergencyContact = {
      name,
      relationship,
      mobile,
    };

    const updatedContacts = [
      ...contacts,
      newContact,
    ];

    const success = await saveContacts(updatedContacts);

    if (success) {
      setNewName("");
      setNewRelationship("");
      setNewMobile("");
      setModalVisible(false);

      Alert.alert(
  "Contact added",
  name + " has been added to your emergency contacts",
);
    }
  }

  // ---------------------------------------------------------
  // REMOVE CONTACT
  // ---------------------------------------------------------

  function handleRemoveContact(
    contact: EmergencyContact,
    index: number
  ) {
    if (contacts.length <=1) {
      Alert.alert(
        "Cannot remove contact",
        "MyShield requires at least 2 emergency contacts."
      );
      return;
    }

    Alert.alert(
      "Remove contact?",
      `Are you sure you want to remove ${contact.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const updatedContacts = contacts.filter(
              (_, i) => i !== index
            );

            await saveContacts(updatedContacts);
          },
        },
      ]
    );
  }

  // ---------------------------------------------------------
  // CONTACT INITIAL
  // ---------------------------------------------------------

  function getInitial(name: string) {
    return name.trim().charAt(0).toUpperCase() || "?";
  }

  // ---------------------------------------------------------
  // START OF UI
  // ---------------------------------------------------------

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0A1628"
      />

      {/* HERO */}

      <View
        style={[
          styles.hero,
          { height: heroHeight },
        ]}
      >
        <LinearGradient
          colors={["#0A1628", "#1A3A6C"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

{STAR_POSITIONS.map(
  ([leftPct, topPct], i) => (
    <View
      key={"star-" + i}
      style={[
        styles.star,
        {
          left: (leftPct / 100) * heroWidth,
          top: (topPct / 100) * heroHeight,
        },
      ]}
    />
  )
)}

        <View
          style={[
            styles.skylineWrap,
            { bottom: waveHeight - 4 },
          ]}
        >
          <Svg
            width={heroWidth}
            height={55}
            viewBox="0 0 375 55"
          >
            <Path
              d={SKYLINE_PATH}
              fill="#061525"
              opacity={0.85}
            />
          </Svg>
        </View>

        <SafeAreaView
          edges={["top"]}
          style={styles.heroSafe}
        >
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color="#FFFFFF"
            />
          </Pressable>

          <View style={styles.logoWrap}>
            <Image
              source={require(
                "../assets/images/myshield-shield-white.png"
              )}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>

        <View style={styles.waveWrap}>
          <Svg
            width={heroWidth}
            height={waveHeight}
          >
            <Path
              d={wavePath}
              fill="#F4F7FA"
            />
          </Svg>
        </View>
      </View>

      {/* CONTENT */}

      <ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={styles.content}
>   
        {/* HEADER */}

        <View style={styles.headingRow}>
          <View style={{ flex: 1 }}>
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

        {/* SAVED CONTACTS TITLE */}

        <Text style={styles.savedTitle}>
          Saved Contacts ({contacts.length}/5)
        </Text>

        {/* LOADING */}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator
              size="large"
              color="#1A56DB"
            />

            <Text style={styles.loadingText}>
              Loading your contacts...
            </Text>
          </View>
        ) : contacts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons
              name="people-outline"
              size={48}
              color="#9DB8FF"
            />

            <Text style={styles.emptyTitle}>
              No emergency contacts
            </Text>

            <Text style={styles.emptyText}>
              Add at least 2 emergency contacts to use
              emergency assistance.
            </Text>
          </View>
        ) : (
          contacts.map((contact, index) => (
            <View
              key={contact.mobile+"-"+index}
              style={styles.contactCard}
            >
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor:
                      CONTACT_COLORS[
                        index % CONTACT_COLORS.length
                      ],
                  },
                ]}
              >
                <Text style={styles.avatarText}>
                  {getInitial(contact.name)}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>
                  {contact.name}
                </Text>

                <Text style={styles.relationshipText}>
                  {contact.relationship}
                </Text>

                <Text style={styles.contactNumber}>
                  {contact.mobile}
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  handleRemoveContact(
                    contact,
                    index
                  )
                }
                style={styles.deleteButton}
              >
                <Ionicons
                  name="trash-outline"
                  size={21}
                  color="#DC2626"
                />
              </Pressable>
            </View>
          ))
        )}

        {/* ADD CONTACT */}

        <Pressable
          style={[
            styles.addCard,
            contacts.length >= 5 &&
              styles.addCardDisabled,
          ]}
          disabled={contacts.length >= 5}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.addIconCircle}>
            <Ionicons
              name="person-add"
              size={34}
              color={
                contacts.length >= 5
                  ? "#9CA3AF"
                  : "#1A56DB"
              }
            />
          </View>

          <Text
            style={[
              styles.addTitle,
              contacts.length >= 5 &&
                styles.addTitleDisabled,
            ]}
          >
            {contacts.length >= 5
              ? "Maximum 5 Contacts"
              : "Add Contact"}
          </Text>

          <Text style={styles.addSub}>
            {contacts.length >= 5
              ? "Remove a contact to add another"
              : "Add a new emergency contact"}
          </Text>
        </Pressable>

        {/* PRIVACY */}

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

      {/* ADD CONTACT MODAL */}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add Emergency Contact
              </Text>

              <Pressable
                onPress={() =>
                  setModalVisible(false)
                }
              >
                <Ionicons
                  name="close"
                  size={28}
                  color="#374151"
                />
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Contact name"
              placeholderTextColor="#9CA3AF"
              value={newName}
              onChangeText={setNewName}
            />

            <TextInput
              style={styles.input}
              placeholder="Relationship (Family, Friend, etc.)"
              placeholderTextColor="#9CA3AF"
              value={newRelationship}
              onChangeText={setNewRelationship}
            />

            <TextInput
              style={styles.input}
              placeholder="Mobile number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={newMobile}
              onChangeText={setNewMobile}
            />

            <Pressable
              style={styles.saveButton}
              onPress={handleAddContact}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.saveButtonText}>
                  Save Contact
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* BOTTOM NAVIGATION */}

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
          onPress={() =>
            router.push("/guidance")
          }
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
          onPress={() =>
            router.push("/settings")
          }
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

  relationshipText: {
    marginTop: 2,
    color: "#1A56DB",
    fontSize: 12,
    fontWeight: "600",
  },

  contactNumber: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 14,
  },

  deleteButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
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

  addCardDisabled: {
    borderColor: "#D1D5DB",
    backgroundColor: "#F3F4F6",
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

  addTitleDisabled: {
    color: "#6B7280",
  },

  addSub: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 14,
  },

  loadingBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },

  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 35,
    paddingHorizontal: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 19,
    fontWeight: "800",
    color: "#1A1A2E",
  },

  emptyText: {
    marginTop: 7,
    textAlign: "center",
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 19,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 35,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A2E",
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#1A1A2E",
    marginBottom: 13,
    backgroundColor: "#F9FAFB",
  },

  saveButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#1A56DB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
});