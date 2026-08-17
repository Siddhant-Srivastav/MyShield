import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL =
  "https://playstation-dose-becoming-spray.trycloudflare.com";

export default function Login() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // =========================
  // SEND OTP
  // =========================
  const handleSendOTP = async () => {
    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      Alert.alert(
        "Phone number required",
        "Please enter your phone number."
      );
      return;
    }

    if (cleanPhone.length !== 10) {
      Alert.alert(
        "Invalid phone number",
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/users/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: cleanPhone,
          }),
        }
      );

      const data = await response.json();

      console.log("SEND OTP RESPONSE:", data);

      if (!response.ok || !data.success) {
        Alert.alert(
          "Unable to send OTP",
          data.message || "Something went wrong."
        );
        return;
      }

      setOtpSent(true);

      Alert.alert(
        "OTP Sent",
        "A verification OTP has been sent to your mobile number."
      );
    } catch (error) {
      console.error("SEND OTP ERROR:", error);

      Alert.alert(
        "Connection error",
        "Unable to connect to MyShield server. Please check your internet connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VERIFY OTP
  // =========================
  const handleVerifyOTP = async () => {
    const cleanPhone = phone.trim();
    const cleanOTP = otp.trim();

    if (!cleanOTP) {
      Alert.alert(
        "OTP required",
        "Please enter the OTP."
      );
      return;
    }

    if (cleanOTP.length !== 6) {
      Alert.alert(
        "Invalid OTP",
        "Please enter the 6-digit OTP."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/users/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: cleanPhone,
            otp: cleanOTP,
          }),
        }
      );

      const data = await response.json();

      console.log("VERIFY OTP RESPONSE:", data);

      if (!response.ok || !data.success) {
        Alert.alert(
          "Verification failed",
          data.message || "Invalid OTP."
        );
        return;
      }

// Login successful
console.log("USER LOGIN SUCCESS:", data.user);

// SAVE LOGGED-IN USER
await AsyncStorage.setItem(
  "user",
  JSON.stringify(data.user)
);

console.log(
  "USER SAVED:",
  await AsyncStorage.getItem("user")
);

Alert.alert(
  "Welcome back!",
  "Login successful.",
        [
          {
            text: "Continue",
            onPress: () => {
              router.replace("/home");
            },
          },
        ]
      );
    } catch (error) {
      console.error("VERIFY OTP ERROR:", error);

      Alert.alert(
        "Connection error",
        "Unable to connect to MyShield server. Please check your internet connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CHANGE NUMBER
  // =========================
  const handleChangeNumber = () => {
    setOtpSent(false);
    setOtp("");
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && { opacity: 0.7 },
          ]}
          testID="login-back-btn"
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color="#1A1A2E"
          />
        </Pressable>
      </View>

      {/* Body */}
      <View
        style={styles.body}
        testID="login-screen"
      >
        <Text style={styles.title}>
          Login
        </Text>

        <Text style={styles.subtitle}>
          Welcome back. Sign in to continue to MyShield.
        </Text>

        {/* PHONE NUMBER */}
        <View style={styles.inputContainer}>
          <Ionicons
            name="call-outline"
            size={21}
            color="#6B7280"
            style={styles.inputIcon}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter mobile number"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
            editable={!otpSent}
            testID="login-phone-input"
          />
        </View>

        {/* OTP SECTION */}
        {otpSent && (
          <>
            <View style={styles.otpHeader}>
              <Text style={styles.otpTitle}>
                Enter OTP
              </Text>

              <Pressable
                onPress={handleChangeNumber}
              >
                <Text style={styles.changeNumber}>
                  Change number
                </Text>
              </Pressable>
            </View>

            <Text style={styles.otpSubtitle}>
              Enter the 6-digit OTP sent to your mobile number.
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={21}
                color="#6B7280"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                testID="login-otp-input"
              />
            </View>
          </>
        )}

        {/* BUTTON */}
        <Pressable
          onPress={
            otpSent
              ? handleVerifyOTP
              : handleSendOTP
          }
          disabled={loading}
          style={({ pressed }) => [
            styles.loginBtn,
            pressed &&
              !loading && {
                opacity: 0.8,
              },
            loading && {
              opacity: 0.6,
            },
          ]}
          testID="login-continue-btn"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.loginBtnText}>
                {otpSent
                  ? "Verify OTP"
                  : "Send OTP"}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FFFFFF"
              />
            </>
          )}
        </Pressable>

        {/* RESEND OTP */}
        {otpSent && (
          <Pressable
            onPress={handleSendOTP}
            disabled={loading}
            style={styles.resendBtn}
          >
            <Text style={styles.resendText}>
              Didn't receive the OTP?{" "}
              <Text style={styles.resendBlue}>
                Resend OTP
              </Text>
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    height: 48,
    paddingHorizontal: 12,
    justifyContent: "center",
  },

  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A2E",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },

  inputContainer: {
    height: 54,
    marginTop: 32,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  inputIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A2E",
  },

  otpHeader: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  otpTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A2E",
  },

  changeNumber: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A56DB",
  },

  otpSubtitle: {
    marginTop: 5,
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },

  loginBtn: {
    height: 54,
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: "#1A1A2E",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  loginBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  resendBtn: {
    marginTop: 20,
    alignItems: "center",
  },

  resendText: {
    fontSize: 13,
    color: "#6B7280",
  },

  resendBlue: {
    color: "#1A56DB",
    fontWeight: "700",
  },
});