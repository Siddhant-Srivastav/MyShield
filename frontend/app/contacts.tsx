import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { BottomNav } from "./home";

// ⚠️ Keep your local backend URL here (same IP you are already using)
const API_BASE_URL = "http://192.168.1.13:8000";

type EmergencyContact = {
  name: string;
  relationship: string;
  mobile: string;
  email?: string;   // ⬅️ NAYA
};

const CONTACT_COLORS = ["#B46BFF", "#2ECC71", "#FF6B2C", "#1A56DB", "#E91E63"];

export default function EmergencyContactsScreen() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRelationship, setNewRelationship] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newEmail, setNewEmail] = useState("");   // ⬅️ NAYA
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserId();
  }, []);

  async function loadUserId() {
    try {
      const AsyncStorage =
        require("@react-native-async-storage/async-storage").default;
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
      Alert.alert("Error", "Unable to load your account information.");
      setLoading(false);
    }
  }

  async function loadContacts(id: string) {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/api/users/${id}/emergency-contacts`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || `Server error: ${response.status}`);
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

  async function saveContacts(updatedContacts: EmergencyContact[]) {
    if (!userId) {
      Alert.alert("Error", "User information is missing. Please login again.");
      return false;
    }
    if (updatedContacts.length < 1) {
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
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: updatedContacts }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || `Server error: ${response.status}`);
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

  async function handleAddContact() {
    const name = newName.trim();
    const relationship = newRelationship.trim();
    const mobile = newMobile.trim();
    const email = newEmail.trim();   // ⬅️ NAYA
    if (!name) {
      Alert.alert("Missing name", "Please enter the contact name.");
      return;
    }
    if (!relationship) {
      Alert.alert("Missing relationship", "Please enter the relationship.");
      return;
    }
    if (!mobile) {
      Alert.alert("Missing mobile number", "Please enter the mobile number.");
      return;
    }
    // ⬇️ NAYA: Email format validation (agar bhara hai to sahi ho)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (contacts.length >= 5) {
      Alert.alert("Maximum reached", "You can have a maximum of 5 emergency contacts.");
      return;
    }
    const newContact: EmergencyContact = { name, relationship, mobile, email };
    const updatedContacts = [...contacts, newContact];
    const success = await saveContacts(updatedContacts);
    if (success) {
      setNewName("");
      setNewRelationship("");
      setNewMobile("");
      setNewEmail("");   // ⬅️ NAYA
      setModalVisible(false);
      Alert.alert("Contact added", name + " has been added to your emergency contacts");
    }
  }

  function handleRemoveContact(contact: EmergencyContact, index: number) {
    if (contacts.length <= 1) {
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
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const updatedContacts = contacts.filter((_, i) => i !== index);
            await saveContacts(updatedContacts);
          },
        },
      ]
    );
  }

  function getInitial(name: string) {
    return name.trim().charAt(0).toUpperCase() || "?";
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.body}>
        {/* ===== White header with logo ===== */}
        <View style={styles.header}>
          <Image
            source={require("../assets/images/myshield-shield.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.heading}>Emergency Contacts</Text>
          <Text style={styles.subtitle}>
            These contacts will be notified during an emergency
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Saved count row */}
          <View style={styles.headingRow}>
            <Text style={styles.savedTitle}>
              Saved Contacts ({contacts.length}/5)
            </Text>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#1A56DB"
            />
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#1A56DB" />
              <Text style={styles.loadingText}>Loading your contacts...</Text>
            </View>
          ) : contacts.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={36} color="#9DB8FF" />
              <Text style={styles.emptyTitle}>No emergency contacts</Text>
              <Text style={styles.emptyText}>
                Add at least 2 emergency contacts to use emergency assistance.
              </Text>
            </View>
          ) : (
            contacts.map((contact, index) => (
              <View
                key={contact.mobile + "-" + index}
                style={styles.contactCard}
              >
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor:
                        CONTACT_COLORS[index % CONTACT_COLORS.length],
                    },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {getInitial(contact.name)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.relationshipText}>
                    {contact.relationship}
                  </Text>
                  <Text style={styles.contactNumber}>📱 {contact.mobile}</Text>
                  {contact.email ? (
                    <Text style={styles.contactEmail}>✉️ {contact.email}</Text>
                  ) : null}
                </View>
                <Pressable
                  onPress={() => handleRemoveContact(contact, index)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={16} color="#DC2626" />
                </Pressable>
              </View>
            ))
          )}

          {/* ===== Add contact card ===== */}
          <Pressable
            style={[styles.addCard, contacts.length >= 5 && styles.addCardDisabled]}
            disabled={contacts.length >= 5}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.addIconCircle}>
              <Ionicons
                name="person-add"
                size={24}
                color={contacts.length >= 5 ? "#9CA3AF" : "#1A56DB"}
              />
            </View>
            <Text
              style={[styles.addTitle, contacts.length >= 5 && styles.addTitleDisabled]}
            >
              {contacts.length >= 5 ? "Maximum 5 Contacts" : "Add Contact"}
            </Text>
            <Text style={styles.addSub}>
              {contacts.length >= 5
                ? "Remove a contact to add another"
                : "Add a new emergency contact"}
            </Text>
          </Pressable>

          {/* ===== Privacy ===== */}
          <View style={styles.privacyRow}>
            <Ionicons name="lock-closed" size={12} color="#6B7280" />
            <Text style={styles.privacyText}>
              Your contacts are encrypted and will only be used during an
              emergency.
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* ===== Add Contact Modal ===== */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Emergency Contact</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
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
            {/* ⬇️ NAYA: Email input */}
            <TextInput
              style={styles.input}
              placeholder="Email address (optional)"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={newEmail}
              onChangeText={setNewEmail}
            />
            <Pressable
              style={styles.saveButton}
              onPress={handleAddContact}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Contact</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      <BottomNav active="contacts" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 6 },
  header: { alignItems: "center", marginBottom: 10 },
  logo: { width: 42, height: 42 },
  heading: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: { marginTop: 2, fontSize: 12, color: "#6B7280", textAlign: "center" },
  content: { paddingBottom: 16 },
  headingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 2,
  },
  savedTitle: { fontSize: 14, fontWeight: "700", color: "#1A56DB" },
  contactCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EEF1F5",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  contactName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  relationshipText: { marginTop: 1, color: "#1A56DB", fontSize: 10, fontWeight: "600" },
  contactNumber: { marginTop: 2, color: "#6B7280", fontSize: 11 },
  contactEmail: { marginTop: 2, color: "#1A56DB", fontSize: 11 },   // ⬅️ NAYA
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  addCard: {
    marginTop: 4,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#9DB8FF",
    borderRadius: 16,
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FBFF",
  },
  addCardDisabled: { borderColor: "#D1D5DB", backgroundColor: "#F3F4F6" },
  addIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  addTitle: { color: "#1A56DB", fontSize: 16, fontWeight: "800" },
  addTitleDisabled: { color: "#6B7280" },
  addSub: { marginTop: 2, color: "#6B7280", fontSize: 11 },
  loadingBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EEF1F5",
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  loadingText: { marginTop: 8, color: "#6B7280", fontSize: 12 },
  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EEF1F5",
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { marginTop: 8, fontSize: 15, fontWeight: "800", color: "#111827" },
  emptyText: {
    marginTop: 4,
    textAlign: "center",
    color: "#6B7280",
    fontSize: 11,
    lineHeight: 16,
  },
  privacyRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  privacyText: {
    color: "#6B7280",
    fontSize: 10,
    textAlign: "center",
    marginLeft: 6,
    lineHeight: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#1A1A2E" },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1A1A2E",
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
  },
  saveButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1A56DB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});