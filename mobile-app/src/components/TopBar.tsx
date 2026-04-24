import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "../theme/colors";

export const TopBar = () => {
  return (
    <View style={styles.container}>
      <View style={styles.locationRow}>
        <View>
          <Text style={styles.locationLabel}>Your Location</Text>
          <Text style={styles.locationValue}>Hyderabad, India ▾</Text>
        </View>
        <View style={styles.profileCircle}>
          <Text style={styles.profileInitial}>H</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "transparent",
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  locationValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  profileInitial: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
});
