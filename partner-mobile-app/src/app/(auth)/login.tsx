import React, { useState, useEffect } from 'react';
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
import { 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Wallet,
  CheckCircle2,
  Ticket
} from 'lucide-react-native';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SHADOWS } from '../../theme/colors';
import apiClient from '../../api/client';

const highlights = [
  { id: 'earnings', icon: Wallet, label: 'Real-time revenue & payouts' },
  { id: 'pricing', icon: TrendingUp, label: 'AI-powered slot optimization' },
  { id: 'security', icon: ShieldCheck, label: 'Secure partner-only dashboard' },
];

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Animation values
  const buttonScale = useSharedValue(1);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your credentials to continue.');
      return;
    }

    setLoading(true);
    setError('');
    buttonScale.value = withSequence(withSpring(0.95), withSpring(1));

    try {
      const response = await apiClient.post('/auth/login', { email: email.trim(), password });
      const { token, user } = response.data;

      if (user.role !== 'PARTNER' && user.role !== 'ADMIN') {
        throw new Error('Unauthorized. This portal is for venue partners only.');
      }

      await signIn(token, user);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Background Elements */}
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animated.View 
            entering={FadeInDown.delay(200).duration(800)} 
            style={styles.headerSection}
          >
            <View style={styles.logoContainer}>
              <View style={styles.ticketWrapper}>
                <Ticket size={34} color="#4ADE80" fill="#4ADE80" />
              </View>
              <Text style={styles.brandText}>BOOK & VIBE</Text>
            </View>
            <View style={styles.brandBadge}>
              <Sparkles size={16} color={COLORS.primary} />
              <Text style={styles.badgeText}>PARTNER PORTAL</Text>
            </View>
            <Text style={styles.subtitle}>
              Empowering venue owners with smart operations and real-time growth.
            </Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View 
            entering={FadeInUp.delay(400).duration(800)} 
            style={styles.formCard}
          >
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Welcome Back</Text>
              <Text style={styles.formDesc}>Enter your business account details.</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Business Email</Text>
              <View style={[styles.inputContainer, error && email === '' && styles.inputError]}>
                <Mail size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@venue.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Security Password</Text>
              <View style={[styles.inputContainer, error && password === '' && styles.inputError]}>
                <Lock size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)} 
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={COLORS.textMuted} />
                  ) : (
                    <Eye size={18} color={COLORS.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {error ? (
              <Animated.View entering={FadeInDown} style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            ) : null}

            <Animated.View style={animatedButtonStyle}>
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLogin} 
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.secondary} />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Launch Dashboard</Text>
                    <ArrowRight size={18} color={COLORS.secondary} />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Request access recovery</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Features Highlights */}
          <View style={styles.featuresSection}>
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <Animated.View 
                  key={item.id} 
                  entering={FadeInDown.delay(600 + index * 100).duration(600)}
                  style={styles.featureItem}
                >
                  <View style={styles.featureIconContainer}>
                    <Icon size={16} color={COLORS.primary} />
                  </View>
                  <Text style={styles.featureLabel}>{item.label}</Text>
                  <CheckCircle2 size={14} color={COLORS.primary} style={styles.checkIcon} />
                </Animated.View>
              );
            })}
          </View>

          <Text style={styles.footerVersion}>V 1.2.4 • SECURE ENCRYPTED SESSION</Text>
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
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 32,
    backgroundColor: COLORS.background, // Explicit dark background
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    marginTop: 10,
  },
  ticketWrapper: {
    transform: [{ rotate: '-45deg' }],
  },
  brandText: {
    fontFamily: 'Mexicana',
    color: '#4ADE80',
    fontSize: 34,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  subtitle: {
    color: COLORS.textDimUnits,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 12,
    maxWidth: '90%',
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 20,
    ...SHADOWS.soft,
  },
  formHeader: {
    gap: 4,
    marginBottom: 8,
  },
  formTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
  },
  formDesc: {
    color: COLORS.textDimUnits,
    fontSize: 13,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: COLORS.textDimUnits,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 64,
  },
  inputError: {
    borderColor: COLORS.danger + '80',
    backgroundColor: COLORS.danger + '05',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  eyeButton: {
    padding: 8,
  },
  errorContainer: {
    backgroundColor: COLORS.danger + '10',
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: COLORS.danger + '30',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...SHADOWS.glow,
  },
  loginButtonText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  forgotBtn: {
    alignItems: 'center',
    marginTop: 4,
  },
  forgotText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  featuresSection: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  checkIcon: {
    opacity: 0.8,
  },
  footerVersion: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 20,
  },
});
