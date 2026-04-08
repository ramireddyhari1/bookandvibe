import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Image, Alert } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS } from '../../src/theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Building2, MapPin, Bell, Shield, LogOut, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [isAvailable, setIsAvailable] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from Partner Portal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: signOut }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'P'}</Text>
            </View>
            <View style={styles.onlineBadge} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Partner'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role || 'PARTNER'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.kycCard}>
          <View style={styles.kycHeader}>
            <Text style={styles.kycTitle}>KYC Verification</Text>
            <View style={styles.verifiedBadge}>
              <CheckCircle2 size={12} color={COLORS.success} />
              <Text style={styles.verifiedText}>VERIFIED</Text>
            </View>
          </View>
          <Text style={styles.kycDesc}>Your business documents are verified. You can receive payouts instantly.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Operations</Text>
          <View style={styles.menuGroup}>
            <View style={styles.menuItem}>
              <View style={styles.menuLabelGroup}>
                <Building2 size={20} color={COLORS.textDimUnits} />
                <Text style={styles.menuText}>Business Profile</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuLabelGroup}>
                <MapPin size={20} color={COLORS.textDimUnits} />
                <Text style={styles.menuText}>Manage Venues</Text>
              </View>
              <View style={styles.badgeCount}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuLabelGroup}>
                <Bell size={20} color={COLORS.textDimUnits} />
                <Text style={styles.menuText}>Operational hours</Text>
              </View>
              <Switch 
                value={isAvailable} 
                onValueChange={setIsAvailable}
                trackColor={{ false: COLORS.cardLight, true: COLORS.primary }}
                thumbColor={COLORS.text}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.menuGroup}>
            <View style={styles.menuItem}>
              <View style={styles.menuLabelGroup}>
                <Bell size={20} color={COLORS.textDimUnits} />
                <Text style={styles.menuText}>Push Notifications</Text>
              </View>
              <Switch 
                value={notifications} 
                onValueChange={setNotifications}
                trackColor={{ false: COLORS.cardLight, true: COLORS.primary }}
                thumbColor={COLORS.text}
              />
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuLabelGroup}>
                <Shield size={20} color={COLORS.textDimUnits} />
                <Text style={styles.menuText}>Privacy & Security</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textMuted} />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>SIGNOUT FROM PORTAL</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Partner app v1.0.0 (Internal Beta)</Text>
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
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: COLORS.card,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.cardLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  kycCard: {
    backgroundColor: COLORS.secondary + '40',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    marginBottom: 32,
  },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kycTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.success,
  },
  kycDesc: {
    fontSize: 12,
    color: COLORS.primaryLight,
    fontWeight: '600',
    lineHeight: 18,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textDimUnits,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  menuGroup: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  badgeCount: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 20,
    backgroundColor: COLORS.danger + '10',
    gap: 12,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.danger,
    letterSpacing: 1,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
