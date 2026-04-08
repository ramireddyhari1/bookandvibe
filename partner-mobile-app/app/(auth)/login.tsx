import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, TrendingUp, Wallet } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, SHADOWS } from '../../src/theme/colors';
import apiClient from '../../src/api/client';

const highlights = [
  { id: 'earnings', icon: Wallet, label: 'Revenue, wallet and payouts' },
  { id: 'pricing', icon: TrendingUp, label: 'Smart slot pricing suggestions' },
  { id: 'security', icon: ShieldCheck, label: 'Partner-only access and secure login' },
];

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password to continue.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', { email: email.trim(), password });
      const { token, user } = response.data;

      if (user.role !== 'PARTNER' && user.role !== 'ADMIN') {
        throw new Error('This app is for partners only. Use the customer app for booking.');
      }

      await signIn(token, user);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <Sparkles size={18} color={COLORS.secondary} />
              </View>
              <View>
                <Text style={styles.brandKicker}>Partner Portal</Text>
                <Text style={styles.brandTitle}>Earn more with every booking</Text>
              </View>
            </View>

            <Text style={styles.heroCopy}>
              Manage venues, pricing, bookings, QR check-ins, and payouts from one secure dashboard.
            </Text>

            <View style={styles.pillRow}>
              <View style={styles.infoPill}>
                <Text style={styles.infoPillValue}>24/7</Text>
                <Text style={styles.infoPillLabel}>Operations</Text>
              </View>
              <View style={styles.infoPill}>
                <Text style={styles.infoPillValue}>Smart</Text>
                <Text style={styles.infoPillLabel}>Pricing</Text>
              </View>
              <View style={styles.infoPill}>
                <Text style={styles.infoPillValue}>Safe</Text>
                <Text style={styles.infoPillLabel}>Payouts</Text>
              </View>
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Sign in to continue</Text>
            <Text style={styles.formSubtitle}>Use your partner credentials to open the business dashboard.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Mail size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@venue.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="username"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Lock size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  textContentType="password"
                />
                <TouchableOpacity onPress={() => setShowPassword((value) => !value)} style={styles.eyeButton}>
                  {showPassword ? <EyeOff size={18} color={COLORS.textMuted} /> : <Eye size={18} color={COLORS.textMuted} />}
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading} activeOpacity={0.9}>
              {loading ? (
                <ActivityIndicator color={COLORS.secondary} />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Continue to dashboard</Text>
                  <ArrowRight size={18} color={COLORS.secondary} />
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.helperText}>
              By signing in, you can manage bookings, check-ins, slots, payouts, and reviews from one place.
            </Text>
          </View>

          <View style={styles.featureList}>
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <View key={item.id} style={styles.featureRow}>
                  <View style={styles.featureIconWrap}>
                    <Icon size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.featureText}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 16,
  },
  bgGlowTop: {
    position: 'absolute',
    top: -80,
    right: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.primary + '16',
  },
  bgGlowBottom: {
    position: 'absolute',
    bottom: -120,
    left: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLORS.accent + '0d',
  },
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    gap: 16,
    ...SHADOWS.soft,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandKicker: {
    color: COLORS.textDimUnits,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  brandTitle: {
    color: COLORS.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    maxWidth: 240,
  },
  heroCopy: {
    color: COLORS.textDimUnits,
    fontSize: 14,
    lineHeight: 22,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
  },
  infoPill: {
    flex: 1,
    backgroundColor: COLORS.cardLight,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  infoPillValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  infoPillLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    gap: 16,
  },
  formTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
  },
  formSubtitle: {
    color: COLORS.textDimUnits,
    fontSize: 13,
    lineHeight: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textDimUnits,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    minHeight: 58,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 8,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    height: 58,
    borderRadius: 18,
    gap: 10,
    marginTop: 4,
    ...SHADOWS.glow,
  },
  loginButtonText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  helperText: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  featureList: {
    gap: 10,
    paddingBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 14,
  },
  featureIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '14',
  },
  featureText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
});
