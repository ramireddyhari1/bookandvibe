import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PartyPopper, Dumbbell, ArrowRight, Sparkles } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SHADOWS } from '../../theme/colors';
import { StatusBar } from 'expo-status-bar';

export default function SelectPortalScreen() {
  const { setPortal, user } = useAuth();
  const router = useRouter();

  const handleSelect = async (portal: 'EVENT' | 'VENUE') => {
    await setPortal(portal);
    // Routing is handled automatically by _layout.tsx watching activePortal state
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(800)} style={styles.header}>
          <View style={styles.badge}>
            <Sparkles size={14} color={COLORS.primary} />
            <Text style={styles.badgeText}>WELCOME BACK</Text>
          </View>
          <Text style={styles.title}>Hi, {user?.name?.split(' ')[0] || 'Partner'}</Text>
          <Text style={styles.subtitle}>Which portal would you like to access today?</Text>
        </Animated.View>

        <View style={styles.cardsContainer}>
          {/* Platform 1: Event Host */}
          <Animated.View entering={FadeInUp.delay(300).duration(800)}>
            <TouchableOpacity 
              style={[styles.portalCard, { borderColor: COLORS.primary + '50' }]} 
              activeOpacity={0.8}
              onPress={() => handleSelect('EVENT')}
            >
              <View style={[styles.iconContainer, { backgroundColor: COLORS.primary + '15' }]}>
                <PartyPopper size={32} color={COLORS.primary} strokeWidth={2.5} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Event Host Portal</Text>
                <Text style={styles.cardDesc}>Manage ticketing, analyze event audience data, and scan QR codes for live entry.</Text>
              </View>
              <View style={styles.arrowContainer}>
                <ArrowRight size={20} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Platform 2: Venue Owner (GameHub) */}
          <Animated.View entering={FadeInUp.delay(500).duration(800)}>
            <TouchableOpacity 
              style={[styles.portalCard, { borderColor: '#818CF850' }]} 
              activeOpacity={0.8}
              onPress={() => handleSelect('VENUE')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#818CF815' }]}>
                <Dumbbell size={32} color="#818CF8" strokeWidth={2.5} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Venue Owner (GameHub)</Text>
                <Text style={styles.cardDesc}>Manage turf slots, monitor hourly bookings, and track GameHub facility earnings.</Text>
              </View>
              <View style={styles.arrowContainer}>
                <ArrowRight size={20} color="#818CF8" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Animated.Text entering={FadeInUp.delay(700)} style={styles.footerText}>
          You can always switch portals later from your profile settings.
        </Animated.Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 48,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 24,
  },
  portalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    ...SHADOWS.soft,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardContent: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
  },
  arrowContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  footerText: {
    marginTop: 48,
    textAlign: 'center',
    color: COLORS.textDimUnits,
    fontSize: 13,
    paddingHorizontal: 20,
    lineHeight: 20,
  }
});
