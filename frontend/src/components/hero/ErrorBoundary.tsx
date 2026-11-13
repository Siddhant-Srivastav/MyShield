import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface Props { children: React.ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.log("MyShield JS Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.box}>
          <Text style={styles.title}>⚠️ Kuch gadbad ho gayi</Text>
          <Text style={styles.sub}>
            App ko restart karo — lock screen protection background me chalu hai.
          </Text>
          <TouchableOpacity style={styles.btn} onPress={() => this.setState({ hasError: false })}>
            <Text style={styles.btnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  box: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 24 },
  title: { fontSize: 18, fontWeight: "800", color: "#111", marginBottom: 8 },
  sub: { fontSize: 13, color: "#666", textAlign: "center", marginBottom: 16, lineHeight: 19 },
  btn: { backgroundColor: "#1A56DB", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: "#fff", fontWeight: "700" },
});