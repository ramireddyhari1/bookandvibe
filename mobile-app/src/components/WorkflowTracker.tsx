import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { Card } from "./Card";

type WorkflowTrackerProps = {
  steps: string[];
  currentIndex: number;
  banner?: string;
  error?: string;
};

export const WorkflowTracker = ({
  steps,
  currentIndex,
  banner,
  error,
}: WorkflowTrackerProps) => {
  return (
    <Card title="Process Tracker">
      <View style={styles.stepRow}>
        {steps.map((step, index) => (
          <View
            key={step}
            style={[
              styles.stepPill,
              index <= currentIndex && styles.stepPillActive,
            ]}
          >
            <Text
              style={[
                styles.stepText,
                index <= currentIndex && styles.stepTextActive,
              ]}
            >
              {step}
            </Text>
          </View>
        ))}
      </View>
      {banner ? <Text style={styles.bannerText}>{banner}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </Card>
  );
};

const styles = StyleSheet.create({
  stepRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  stepPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(15,23,42,0.6)",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  stepPillActive: {
    borderColor: "rgba(236,72,153,0.7)",
    backgroundColor: "rgba(124,58,237,0.4)",
  },
  stepText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  stepTextActive: {
    color: colors.text,
  },
  bannerText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: "700",
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: "600",
  },
});
