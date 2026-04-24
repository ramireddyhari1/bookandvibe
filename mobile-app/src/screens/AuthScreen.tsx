import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  Animated,
  Pressable,
} from "react-native";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { typography } from "../theme/typography";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Mail, Lock, User, ArrowRight, Activity, MapPin, Clapperboard, ChevronDown, MoreVertical, Sparkles } from "lucide-react-native";
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type AuthScreenProps = {
  onLogin: (email: string, password: string) => void | Promise<void>;
  onRegister?: (name: string, email: string, password: string) => void | Promise<void>;
  onSkip?: () => void;
};

const GoogleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 48 48">
    <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
    <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </Svg>
);

const AppleIcon = () => (
  <View style={{ marginBottom: 2 }}>
    <Svg width="20" height="20" viewBox="0 0 384 512">
      <Path fill="#000000" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 21.8-88.5 21.8-11.4 0-51.1-20.8-81.8-20.1-40 0.6-76.6 23.3-97.1 59-41.6 72.1-10.7 178.6 29.5 236.4 20.1 28.8 43.1 61.1 74.2 59.8 30.2-1.3 41.5-19.6 78-19.6 36.4 0 46.8 19.6 78 19.1 31.4-0.4 51.5-29.2 71.1-57.5 22.4-32.3 31.5-63.6 32-65.2-0.8-0.3-61.9-23.7-62.2-94.3zm-56.1-164c15-18.2 25-43.2 22.2-68.1-21.5 0.9-47.5 14.3-63 32.1-13.9 16.1-26 41.5-22.7 65.6 23.9 1.8 48.7-11.4 63.5-29.6z" />
    </Svg>
  </View>
);

const SvgPin = ({ color1, color2, children, scale = 1, glowColor }: any) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', transform: [{ scale }] }}>
     {/* Soft Glow Layer without elevation boxes */}
     <View style={[
       StyleSheet.absoluteFill, 
       { 
         backgroundColor: glowColor || color1, 
         opacity: 0.25, 
         borderRadius: 30, 
         transform: [{ scale: 1.2 }, { translateY: 10 }],
         shadowColor: glowColor || color1,
         shadowOpacity: 1,
         shadowRadius: 20,
         shadowOffset: { width: 0, height: 0 },
       }
     ]} />
     
     <Svg width="64" height="80" viewBox="0 0 60 75">
       <Defs>
         <SvgLinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
           <Stop offset="0" stopColor={color1} stopOpacity="1" />
           <Stop offset="1" stopColor={color2} stopOpacity="1" />
         </SvgLinearGradient>
       </Defs>
       <Path d="M30 0 A30 30 0 0 0 0 30 C0 48 30 75 30 75 C30 75 60 48 60 30 A30 30 0 0 0 30 0 Z" fill="url(#grad)" />
     </Svg>
     <View style={{ position: 'absolute', top: 16 }}>
       {children}
     </View>
  </View>
);

export const AuthScreen = ({ onLogin, onRegister, onSkip }: AuthScreenProps) => {
  const [isOneTapMode, setIsOneTapMode] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const glowAnim = useRef(new Animated.Value(0)).current;
  const pinAnim1 = useRef(new Animated.Value(0)).current;
  const pinAnim2 = useRef(new Animated.Value(0)).current;
  const pinAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const createPinAnim = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 2500,
            delay: delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    createPinAnim(pinAnim1, 0);
    createPinAnim(pinAnim2, 800);
    createPinAnim(pinAnim3, 1600);
  }, []);

  const handleAction = async () => {
    if (!email.trim() || !password.trim() || (!isLogin && !name.trim())) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await onLogin(email, password);
      } else if (onRegister) {
        await onRegister(name, email, password);
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const orbScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const orbOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.6],
  });

  const getPinTranslation = (anim: Animated.Value) => anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  return (
    <View style={styles.container}>
      {/* Luxury Background Gradient */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["#FFFFFF", "#F3F0FF", "#FFF1F5"]}
          style={StyleSheet.absoluteFill}
        />
        {/* Soft Radial Glow behind center elements */}
        <Animated.View
          style={[
            styles.centerGlow,
            { transform: [{ scale: orbScale }], opacity: orbOpacity },
          ]}
        >
          <LinearGradient
            colors={["rgba(168, 85, 247, 0.15)", "transparent"]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar Section */}
          <View style={styles.topBar}>
            <View style={{ width: 60 }} /> {/* Spacer */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>district</Text>
              <Text style={styles.byText}>BY ZOMATO</Text>
            </View>
            <Pressable 
              style={({ pressed }) => [styles.skipBtn, { opacity: pressed ? 0.6 : 1 }]}
              onPress={onSkip}
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>

          {/* Visual Elements - Floating Pins */}
          <View style={styles.pinsSection}>
            <View style={styles.curvedSurfaceContainer}>
              {/* Elegant thin curved line with 20% opacity */}
              <Svg width={SCREEN_WIDTH * 0.9} height="60" viewBox={`0 0 ${SCREEN_WIDTH * 0.9} 60`}>
                <Path 
                  d={`M0,20 Q${SCREEN_WIDTH * 0.45},70 ${SCREEN_WIDTH * 0.9},20`} 
                  fill="none" 
                  stroke="rgba(168, 85, 247, 0.2)" 
                  strokeWidth="2" 
                />
              </Svg>
            </View>

            <View style={styles.pinsRow}>
              {/* Left Pin: Sports */}
              <Animated.View style={[{ transform: [{ translateY: getPinTranslation(pinAnim1) }] }]}>
                <SvgPin color1="#B265E6" color2="#7C3AED" glowColor="#B265E6">
                  <Activity size={20} color="#FFF" />
                </SvgPin>
              </Animated.View>

              {/* Center Pin: Location (Bigger for focus) */}
              <Animated.View style={[{ marginTop: -35, transform: [{ translateY: getPinTranslation(pinAnim2) }] }]}>
                <SvgPin color1="#F43F5E" color2="#E11D48" scale={1.15} glowColor="#F43F5E">
                  <View style={styles.centerPinDot} />
                </SvgPin>
              </Animated.View>

              {/* Right Pin: Entertainment */}
              <Animated.View style={[{ transform: [{ translateY: getPinTranslation(pinAnim3) }] }]}>
                <SvgPin color1="#A78BFA" color2="#8B5CF6" glowColor="#A78BFA">
                  <Clapperboard size={20} color="#FFF" />
                </SvgPin>
              </Animated.View>
            </View>
          </View>

          {/* Events Pill */}
          <View style={styles.eventsPillWrapper}>
            <View style={styles.eventsPill}>
              <Sparkles size={14} color="#8B5CF6" />
              <Text style={styles.eventsText}>Events</Text>
              <Sparkles size={14} color="#8B5CF6" />
            </View>
          </View>

          {/* Main Card */}
          {isOneTapMode ? (
            <BlurView intensity={Platform.OS === 'ios' ? 80 : 0} tint="light" style={styles.authCard}>
              <LinearGradient 
                colors={["rgba(255, 241, 245, 0.4)", "transparent"]} 
                style={StyleSheet.absoluteFill} 
                pointerEvents="none" 
              />
              
              <View style={styles.cardHeader}>
                <Text style={styles.mainHeading}>For all your going out plans</Text>
              </View>

              <Text style={styles.dividerText}>CHOOSE YOUR ACCOUNT</Text>

              {/* Profile Row */}
              <Pressable style={styles.accountRow} onPress={() => onLogin("hariharan@example.com", "dummy")}>
                <View style={styles.avatar}>
                  <LinearGradient colors={["#A855F7", "#F43F5E"]} style={StyleSheet.absoluteFill} />
                  <User size={20} color="#FFF" />
                </View>
                <View style={styles.accountDetails}>
                  <Text style={styles.accountName}>hariharan ramireddy</Text>
                  <Text style={styles.accountPhone}>+91 97XXXX7681</Text>
                </View>
                <MoreVertical size={20} color="#9CA3AF" />
              </Pressable>

              <Pressable style={styles.anotherLoginBtn} onPress={() => setIsOneTapMode(false)}>
                <Text style={styles.anotherLoginText}>Use another log-in method</Text>
                <ChevronDown size={14} color="#8B5CF6" style={{ marginTop: 2 }} />
              </Pressable>
            </BlurView>
          ) : (
            <BlurView intensity={Platform.OS === 'ios' ? 80 : 0} tint="light" style={[styles.authCard, styles.traditionalAuth]}>
               <LinearGradient 
                colors={["rgba(255, 241, 245, 0.3)", "transparent"]} 
                style={StyleSheet.absoluteFill} 
                pointerEvents="none" 
              />
              <Text style={[styles.mainHeading, { marginBottom: 24, fontSize: 24 }]}>
                {isLogin ? "Welcome Back" : "Create Account"}
              </Text>
              
              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Input
                    label="Full Name"
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    variant="default"
                  />
                  <View style={styles.inputIcon}>
                    <User size={18} color="#9CA3AF" />
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Input
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  variant="default"
                />
                <View style={styles.inputIcon}>
                  <Mail size={18} color="#9CA3AF" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  variant="default"
                />
                <View style={styles.inputIcon}>
                  <Lock size={18} color="#9CA3AF" />
                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                title={isLogin ? "Sign In" : "Create Account"}
                onPress={handleAction}
                variant="primary"
                style={styles.loginBtn}
                icon={<ArrowRight size={20} color="#FFF" />}
              />

              <View style={[styles.socialRow, { marginTop: 24 }]}>
                <Button
                  title="Google"
                  onPress={() => {}}
                  variant="social"
                  style={styles.socialBtn}
                  icon={<GoogleIcon />}
                />
                <Button
                  title="Apple"
                  onPress={() => {}}
                  variant="social"
                  style={styles.socialBtn}
                  icon={<AppleIcon />}
                />
              </View>
              
               <View style={styles.footerRow}>
                <Text style={styles.traditionalFooterText}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </Text>
                <Pressable onPress={() => setIsLogin(!isLogin)}>
                  <Text style={styles.footerLink}>
                    {isLogin ? "Create one" : "Sign In"}
                  </Text>
                </Pressable>
              </View>
              
              <Pressable style={styles.anotherLoginBtn} onPress={() => setIsOneTapMode(true)}>
                <Text style={styles.anotherLoginText}>Back to One-Tap Login</Text>
              </Pressable>
            </BlurView>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerDisclaimer}>
              By continuing, you agree to our{"\n"}
              <Text style={styles.footerLinkText}>Terms of Service</Text> & <Text style={styles.footerLinkText}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerGlow: {
    position: "absolute",
    top: "30%",
    left: "10%",
    width: "80%",
    height: 300,
    borderRadius: 150,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 44,
  },
  logoContainer: {
    alignItems: "center",
  },
  logoText: {
    fontSize: 26,
    color: "#222222",
    fontFamily: typography.bold,
    letterSpacing: -1,
    marginBottom: 2,
  },
  byText: {
    fontSize: 8,
    color: "#999999",
    fontFamily: typography.bold,
    letterSpacing: 2,
  },
  skipBtn: {
    padding: 8,
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  skipText: {
    color: "#555555",
    fontSize: 13,
    fontFamily: typography.primary,
    fontWeight: "600",
  },
  pinsSection: {
    alignItems: "center",
    height: 170,
    justifyContent: "center",
    marginBottom: 8,
    position: "relative",
  },
  curvedSurfaceContainer: {
    position: "absolute",
    bottom: 25,
    width: "100%",
    alignItems: "center",
  },
  pinsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    width: "100%",
  },
  centerPinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.95)",
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  eventsPillWrapper: {
    alignItems: "center",
    marginBottom: 24,
  },
  eventsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F0FF",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
  },
  eventsText: {
    fontSize: 14,
    color: "#8B5CF6",
    fontFamily: typography.bold,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  authCard: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 2,
    overflow: "hidden",
  },
  traditionalAuth: {
     paddingTop: 32,
  },
  cardHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  mainHeading: {
    fontSize: 27,
    color: "#1A1A1A",
    fontFamily: typography.bold,
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  dividerText: {
    color: "#A1A1AA",
    fontSize: 11,
    fontFamily: typography.bold,
    textAlign: "center",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(244,244,245,0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 1,
    marginBottom: 24,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  accountDetails: {
    flex: 1,
    marginLeft: 14,
  },
  accountName: {
    fontSize: 16,
    color: "#1A1A1A",
    fontFamily: typography.bold,
    marginBottom: 3,
  },
  accountPhone: {
    fontSize: 13,
    color: "#71717A",
    fontFamily: typography.primary,
  },
  anotherLoginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  anotherLoginText: {
    color: "#8B5CF6",
    fontSize: 14,
    fontFamily: typography.bold,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 36,
    alignItems: "center",
  },
  footerDisclaimer: {
    textAlign: "center",
    color: "#999999",
    fontSize: 12,
    fontFamily: typography.primary,
    lineHeight: 20,
  },
  footerLinkText: {
    color: "#71717A",
    fontFamily: typography.bold,
  },
  inputGroup: {
    marginBottom: 16,
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    right: 18,
    top: 48,
  },
  loginBtn: {
    height: 60,
    borderRadius: 18,
    marginTop: 8,
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
  },
  socialBtn: {
    flex: 1,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  traditionalFooterText: {
    color: "#71717A",
    fontSize: 14,
    fontFamily: typography.primary,
  },
  footerLink: {
    color: "#8B5CF6",
    fontSize: 14,
    fontFamily: typography.bold,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontFamily: typography.primary,
    textAlign: "center",
    marginBottom: 16,
  },
});
