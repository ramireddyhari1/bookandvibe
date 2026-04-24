import React from "react";
import { View, Text, StyleSheet, Dimensions, Platform, Image } from "react-native";
import { Button } from "../components/Button";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Ticket, ShieldCheck, Zap } from "lucide-react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type OnboardingScreenProps = {
  onStart: () => void;
};

export const OnboardingScreen = ({ onStart }: OnboardingScreenProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.heroSection}>
        <LinearGradient
          colors={['transparent', 'rgba(124, 58, 237, 0.1)', 'rgba(15, 10, 31, 1)']}
          style={styles.heroGradient}
        />
        <View style={styles.iconCircle}>
          <Sparkles size={40} color="#FFF" />
        </View>
        <Text style={styles.title}>Experience the{"\n"}<Text style={styles.highlight}>District</Text></Text>
        <Text style={styles.subtitle}>
          The most premium way to discover and book world-class entertainment.
        </Text>
      </View>

      <View style={styles.featuresSection}>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Zap size={20} color={colors.purpleBrand} />
          </View>
          <View>
            <Text style={styles.featureTitle}>Instant Booking</Text>
            <Text style={styles.featureDesc}>Secure your spot in seconds with UPI and Cards.</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ticket size={20} color={colors.magenta} />
          </View>
          <View>
            <Text style={styles.featureTitle}>Digital Tickets</Text>
            <Text style={styles.featureDesc}>Contactless entry with secure QR-coded passes.</Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <ShieldCheck size={20} color={colors.success} />
          </View>
          <View>
            <Text style={styles.featureTitle}>Premium Security</Text>
            <Text style={styles.featureDesc}>256-bit encrypted transactions for peace of mind.</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Start Your Journey"
          onPress={onStart}
          variant="primary"
          style={styles.startBtn}
        />
        <Text style={styles.footerNote}>By continuing, you agree to our Terms of Service</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroGradient: {
    position: 'absolute',
    top: -100,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.5,
    zIndex: -1,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  title: {
    fontSize: 42,
    color: '#FFF',
    fontFamily: typography.bold,
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: -1,
  },
  highlight: {
    color: colors.purpleBrand,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: typography.secondary,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  featuresSection: {
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    color: '#FFF',
    fontFamily: typography.bold,
  },
  featureDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: typography.primary,
    marginTop: 2,
  },
  footer: {
    marginTop: 40,
  },
  startBtn: {
    height: 64,
  },
  footerNote: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: typography.primary,
    textAlign: 'center',
    marginTop: 16,
  }
});
