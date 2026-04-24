import React from "react";
import { View, Text, StyleSheet, ViewStyle, Pressable, StyleProp } from "react-native";
import { typography } from "../theme/typography";

type CardProps = {
  children: React.ReactNode;
  title?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: "glass" | "solid" | "glow";
  blurIntensity?: number;
};

export const Card = ({ children, title, style, onPress, variant = "glass", blurIntensity = 10 }: CardProps) => {
  const variantStyle =
    variant === "glow"
      ? styles.cardGlow
      : variant === "solid"
        ? styles.cardSolid
        : styles.cardGlass;

  const titleStyle =
    variant === "solid" ? styles.cardTitleSolid : styles.cardTitleGlass;

  const CardContent = (
    <View style={[
      styles.card,
      variantStyle,
      style
    ]}>
      {title && <Text style={titleStyle}>{title}</Text>}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {CardContent}
      </Pressable>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    padding: 24,
    gap: 16,
    overflow: 'hidden',
  },
  cardGlass: {
    backgroundColor: 'rgba(15, 10, 31, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 14,
  },
  cardSolid: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255, 77, 166, 0.2)",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 10,
  },
  cardGlow: {
    backgroundColor: 'rgba(31, 16, 60, 0.88)',
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.3)",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitleGlass: {
    color: '#FFF',
    fontSize: 24,
    fontFamily: typography.bold,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  cardTitleSolid: {
    color: "#1F2937",
    fontSize: 24,
    fontFamily: typography.bold,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
});
