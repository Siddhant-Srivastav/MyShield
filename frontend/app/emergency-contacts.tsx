import { useMemo, useState } from "react";
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import HeroBackground from "@/src/components/hero/HeroBackground";

const BLUE = "#1A56DB";
const NAVY = "#1A1A2E";
const MUTED = "#6B7280";
const RED = "#DC2626";
const BORDER = "#E5E7EB";

type Contact = { id: string; name: string; relationship: string; mobile: string };

const blank = (i: number): Contact => ({
  id: `${Date.now()}-${i}`,
  name: "",
  relationship: "",
  mobile: "",
});

const STEPS = [
  { id: 1, label: "Basic\nDetails" },
  { id: 2, label: "Photo" },
  { id: 3, label: "Emergency" },
  { id: 4, label: "Language" },
  { id: 5, label: "Permissions" },
];
const ACTIVE_STEP = 3;
const RELATIONSHIPS = ["Family", "Friend", "Spouse", "Parent", "Sibling", "Colleague", "Other"];

export default function EmergencyContacts() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState<Contact[]>([blank(1), blank(2)]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const updateContact = (id: string, patch: Partial<Contact>) => {
    setContacts((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };
  const removeContact = (id: string) => {
    setContacts((cs) => (cs.length > 1 ? cs.filter((c) => c.id !== id) : cs));
  };
  const addContact = () => {
    setContacts((cs) => (cs.length < 5 ? [...cs, blank(cs.length + 1)] : cs));
  };

  const canAddMore = contacts.length < 5;

  return (
    <View style={styles.root} testID="emergency-contacts-screen">
      <StatusBar barStyle="light-content" backgroundColor="#0A1628" />

      <HeroBackground heightFraction={0.14} shieldSize={50}>
        <SafeAreaView edges={["top"]} style={styles.heroOverlay} pointerEvents="box-none">
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            testID="ec-back-btn"
          >
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          </Pressable>
        </SafeAreaView>
      </HeroBackground>

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        bottomOffset={16}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          <Text style={styles.titleDark}>Add </Text>
          <Text style={styles.titleBlue}>Emergency Contacts</Text>
        </Text>
        <Text style={styles.subtitle}>
          These contacts will be notified and can help{"\n"}you during an emergency.
        </Text>

        <View style={styles.infoBox}>
          <View style={styles.infoIcon}>
            <Feather name="info" size={16} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Add 2 to 5 trusted contacts</Text>
            <Text style={styles.infoSub}>They will be alerted when you need help.</Text>
          </View>
        </View>

        {contacts.map((c, i) => {
          const isDropdownOpen = openDropdown === c.id;
          return (
            <View key={c.id} style={styles.card} testID={`contact-card-${i + 1}`}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Contact {i + 1}</Text>
                {contacts.length > 1 ? (
                  <Pressable
                    onPress={() => removeContact(c.id)}
                    hitSlop={8}
                    style={styles.removeBtn}
                    testID={`contact-remove-${i + 1}`}
                  >
                    <Feather name="trash-2" size={14} color={RED} />
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                ) : null}
              </View>

              <Text style={styles.label}>Name</Text>
              <View style={styles.input}>
                <Ionicons name="person" size={16} color={BLUE} />
                <TextInput
                  value={c.name}
                  onChangeText={(v) => updateContact(c.id, { name: v })}
                  placeholder="Enter full name"
                  placeholderTextColor="#9CA3AF"
                  style={styles.inputText}
                  autoCapitalize="words"
                  testID={`contact-name-${i + 1}`}
                />
              </View>

              <Text style={styles.label}>Relationship</Text>
              <Pressable
                onPress={() => setOpenDropdown(isDropdownOpen ? null : c.id)}
                style={styles.input}
                testID={`contact-relationship-${i + 1}`}
              >
                <MaterialCommunityIcons name="account-group" size={16} color={BLUE} />
                <Text
                  style={[
                    styles.inputText,
                    !c.relationship && { color: "#9CA3AF" },
                  ]}
                >
                  {c.relationship || "Select relationship"}
                </Text>
                <Ionicons
                  name={isDropdownOpen ? "chevron-up" : "chevron-down"}
                  size={14}
                  color={BLUE}
                />
              </Pressable>
              {isDropdownOpen ? (
                <View style={styles.dropdown}>
                  {RELATIONSHIPS.map((r) => (
                    <Pressable
                      key={r}
                      style={({ pressed }) => [
                        styles.dropdownItem,
                        pressed && { backgroundColor: "#EFF6FF" },
                      ]}
                      onPress={() => {
                        updateContact(c.id, { relationship: r });
                        setOpenDropdown(null);
                      }}
                    >
                      <Text style={styles.dropdownText}>{r}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.mobileRow}>
                <View style={styles.ccBox}>
                  <Ionicons name="call" size={14} color={BLUE} />
                  <Text style={styles.cc}>+91</Text>
                  <Ionicons name="chevron-down" size={12} color={BLUE} />
                </View>
                <View style={styles.numberBox}>
                  <TextInput
                    value={c.mobile}
                    onChangeText={(v) => updateContact(c.id, { mobile: v })}
                    placeholder="Enter mobile number"
                    placeholderTextColor="#9CA3AF"
                    style={styles.numberInput}
                    keyboardType="phone-pad"
                    maxLength={10}
                    testID={`contact-mobile-${i + 1}`}
                  />
                </View>
              </View>
            </View>
          );
        })}

        {canAddMore ? (
          <Pressable
            onPress={addContact}
            style={({ pressed }) => [styles.addMore, pressed && { opacity: 0.85 }]}
            testID="add-another-contact-btn"
          >
            <Ionicons name="add-circle" size={20} color={BLUE} />
            <Text style={styles.addMoreText}>Add Another Contact</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => router.push("/language-selection")}
          style={({ pressed }) => [styles.continueBtn, pressed && { opacity: 0.9 }]}
          testID="ec-continue-btn"
        >
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </KeyboardAwareScrollView>

      {/* Stepper pinned to bottom */}
      <View
        style={[
          styles.stepper,
          { paddingBottom: Math.max(insets.bottom, 8) },
        ]}
        testID="onboarding-stepper"
      >
        {STEPS.map((s, i) => {
          const completed = s.id < ACTIVE_STEP;
          const active = s.id === ACTIVE_STEP;
          return (
            <View key={s.id} style={styles.step}>
              <View
                style={[
                  styles.stepCircle,
                  completed && styles.stepDone,
                  active && styles.stepActive,
                  !completed && !active && styles.stepIdle,
                ]}
              >
                {completed ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.stepNum,
                      active ? { color: "#FFFFFF" } : { color: "#9CA3AF" },
                    ]}
                  >
                    {s.id}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  active && { color: BLUE, fontWeight: "700" },
                ]}
                numberOfLines={2}
              >
                {s.label.replace("\n", " ")}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F4F7FA" },
  heroOverlay: { flex: 1, paddingHorizontal: 16 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 8 },

  title: { textAlign: "center" },
  titleDark: { fontSize: 21, fontWeight: "800", color: NAVY },
  titleBlue: { fontSize: 21, fontWeight: "800", color: BLUE },
  subtitle: {
    marginTop: 3,
    fontSize: 11,
    color: MUTED,
    textAlign: "center",
    lineHeight: 14,
  },

  infoBox: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 10,
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTitle: { fontSize: 12, fontWeight: "700", color: NAVY },
  infoSub: { fontSize: 10, color: MUTED, marginTop: 1 },

  card: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: "#EEF1F5",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardTitle: { fontSize: 13, fontWeight: "800", color: NAVY },
  removeBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  removeText: { color: RED, fontSize: 11, fontWeight: "600", marginLeft: 4 },

  label: { fontSize: 11, fontWeight: "700", color: NAVY, marginTop: 4, marginBottom: 3 },
  input: {
    height: 38,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    gap: 8,
  },
  inputText: { flex: 1, fontSize: 12, color: NAVY, padding: 0 },

  mobileRow: { flexDirection: "row", alignItems: "center", gap: 8, width: "100%", overflow: "hidden" },
  ccBox: {
    width: 78,
    height: 38,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    gap: 4,
  },
  numberBox: {
    flex: 1,
    minWidth: 0,
    height: 38,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 10,
    justifyContent: "center",
    overflow: "hidden",
  },
  numberInput: { width: "100%", fontSize: 12, color: NAVY, padding: 0 },
  cc: { fontSize: 12, fontWeight: "700", color: NAVY },

  dropdown: {
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 4,
  },
  dropdownItem: { paddingHorizontal: 10, paddingVertical: 6 },
  dropdownText: { fontSize: 12, color: NAVY },

  addMore: {
    marginTop: 8,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BLUE,
    borderStyle: "dashed",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addMoreText: { color: BLUE, fontSize: 13, fontWeight: "700", marginLeft: 6 },

  continueBtn: {
    marginTop: 8,
    height: 46,
    borderRadius: 12,
    backgroundColor: BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  continueText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700", marginRight: 4 },

  stepper: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 6,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEF1F5",
  },
  step: { flex: 1, alignItems: "center" },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  stepDone: { backgroundColor: BLUE },
  stepActive: { backgroundColor: BLUE },
  stepIdle: { backgroundColor: "#E5E7EB" },
  stepNum: { fontSize: 11, fontWeight: "700" },
  stepLabel: { fontSize: 9, color: MUTED, textAlign: "center", lineHeight: 11 },
});
