import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Rowdies_700Bold } from '@expo-google-fonts/rowdies';
import { Bungee_400Regular } from '@expo-google-fonts/bungee';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, activePortal, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user) {
      if (!activePortal) {
        if (segments[1] !== 'select-portal') {
          router.replace('/(auth)/select-portal');
        }
      } else if (activePortal === 'EVENT') {
        const allowedSegments = ['(event-tabs)', 'new-event', 'event'];
        if (segments[0] && !allowedSegments.includes(segments[0])) {
          router.replace('/(event-tabs)');
        }
      } else if (activePortal === 'VENUE') {
        if (segments[0] !== '(venue-tabs)') {
          router.replace('/(venue-tabs)');
        }
      }
    }
  }, [user, activePortal, isLoading, segments]);

  // FORCED RENDER: We no longer wait for isLoading.
  // This helps identify if the auth context is hanging.

  return (
    <>
      <StatusBar style="light" />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Mexicana': Bungee_400Regular,
  });

  useEffect(() => {
    // Hide splash screen when either fonts are ready OR if there's an error
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // We wait for fonts to load for a polished first look
  if (!fontsLoaded && !fontError) {
    return null;
  }
  
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
