import React from "react";
import { TextInput, StyleSheet, TextInputProps, View, Text } from "react-native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  variant?: "glass" | "default";
}

export const Input = ({ label, error, variant = "default", style, ...props }: InputProps) => {
  const isGlass = variant === "glass";

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            isGlass && styles.inputGlass,
            error ? styles.inputError : null,
            style
          ]}
          placeholderTextColor="rgba(17,24,39,0.35)"
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
    width: "100%",
  },
  label: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontFamily: typography.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    paddingLeft: 4,
  },
  inputWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  input: {
    backgroundColor: "#FFFFFF",
    color: "#111827",
    paddingHorizontal: 18,
    height: 60,
    fontSize: 16,
    fontFamily: typography.secondary,
  },
  inputGlass: {
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "#FFFFFF",
    borderColor: 'rgba(255,255,255,0.15)',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: typography.primary,
    marginTop: 4,
    paddingLeft: 4,
  },
});
