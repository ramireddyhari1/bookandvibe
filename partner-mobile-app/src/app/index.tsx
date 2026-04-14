import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

export default function IndexPage() {
  const { user, activePortal, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  if (activePortal === 'EVENT') return <Redirect href="/(event-tabs)" />;
  if (activePortal === 'VENUE') return <Redirect href="/(venue-tabs)" />;
  
  return <Redirect href="/(auth)/select-portal" />;
}
