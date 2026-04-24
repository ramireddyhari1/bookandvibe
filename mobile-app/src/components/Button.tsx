import React, { useRef } from "react";
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, Animated, View } from "react-native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "social";
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  color?: string;
};

export const Button = ({ title, onPress, variant = "primary", icon, style, textStyle, color }: ButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };
  const getButtonStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.btnSecondary;
      case "ghost":
        return styles.btnGhost;
      case "social":
        return styles.btnSocial;
      default:
        return styles.btnPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.btnSecondaryText;
      case "ghost":
        return styles.btnGhostText;
      case "social":
        return styles.btnSocialText;
      default:
        return styles.btnPrimaryText;
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        style={[getButtonStyle(), color ? { backgroundColor: color, shadowColor: color } : {}]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Text style={[getTextStyle(), textStyle]}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  btnPrimary: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: colors.purpleBrand,
    shadowColor: colors.purpleBrand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  btnPrimaryText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: -0.2,
    fontFamily: typography.bold,
  },
  btnSecondary: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  btnSecondaryText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
    fontFamily: typography.secondary,
  },
  btnGhost: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
    alignItems: "center",
    minWidth: 100,
  },
  btnGhostText: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: "600",
    fontFamily: typography.secondary,
  },
  btnSocial: {
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    marginBottom: 12,
  },
  btnSocialText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    fontFamily: typography.bold,
  },
  iconContainer: {
    marginRight: 10,
  },
});
