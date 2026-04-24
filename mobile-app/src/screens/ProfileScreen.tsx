import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert } from "react-native";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { Settings, LogOut, ChevronRight, Star, Heart, Clock, Wallet, Ticket, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

type ProfileScreenProps = {
  email: string;
  ticketCount: number;
  onBackToDiscover: () => void;
  onOpenTickets: () => void;
  onSignOut: () => Promise<void> | void;
};

export const ProfileScreen = ({
  email,
  ticketCount,
  onBackToDiscover,
  onOpenTickets,
  onSignOut,
}: ProfileScreenProps) => {
  const profileName = email.split('@')[0];
  const displayName = profileName.charAt(0).toUpperCase() + profileName.slice(1);

  const ProfileAction = ({ icon: Icon, label, value, subtitle, onPress }: { icon: any, label: string, value?: string, subtitle?: string, onPress: () => void }) => (
    <Pressable style={styles.actionRow} onPress={onPress}>
      <View style={styles.actionLeft}>
        <View style={styles.actionIcon}>
          <Icon size={20} color="rgba(17,24,39,0.72)" />
        </View>
        <View style={styles.actionLabelWrap}>
          <Text style={styles.actionLabel}>{label}</Text>
          {subtitle ? <Text style={styles.actionSubLabel}>{subtitle}</Text> : null}
        </View>
      </View>
      <View style={styles.actionRight}>
        {value && <Text style={styles.actionValue}>{value}</Text>}
        <ChevronRight size={18} color="rgba(17,24,39,0.35)" />
      </View>
    </Pressable>
  );

  const showComingSoon = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out from this device?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            Promise.resolve(onSignOut()).catch(() => {
              Alert.alert("Sign out failed", "Please try again.");
            });
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={['#7C3AED', '#C026D3']}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarInitial}>{profileName[0].toUpperCase()}</Text>
          </LinearGradient>
          <View style={styles.badgeContainer}>
            <Star size={12} color="#FFF" fill="#FFF" />
          </View>
        </View>

        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userEmail}>{email}</Text>

        <LinearGradient
          colors={['rgba(124, 58, 237, 0.2)', 'rgba(192, 38, 211, 0.2)']}
          style={styles.tierBadge}
        >
          <Text style={styles.tierText}>GOLD CIRCLE MEMBER</Text>
        </LinearGradient>
      </View>

      <LinearGradient
        colors={['rgba(124, 58, 237, 0.18)', 'rgba(192, 38, 211, 0.1)']}
        style={styles.membershipCard}
      >
        <View style={styles.membershipTopRow}>
          <View style={styles.membershipPill}>
            <Sparkles size={14} color="#6D28D9" />
            <Text style={styles.membershipPillText}>Elite Benefits</Text>
          </View>
          <Text style={styles.membershipPoints}>4200 pts</Text>
        </View>
        <Text style={styles.membershipTitle}>You're in the top 12% this month</Text>
        <Text style={styles.membershipSubtitle}>Unlock priority booking windows by attending one more event.</Text>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ticket size={16} color="#C4B5FD" />
          <Text style={styles.statValue}>{ticketCount}</Text>
          <Text style={styles.statLabel}>Tickets</Text>
        </View>
        <View style={[styles.statItem, styles.statBorder]}>
          <Heart size={16} color="#F9A8D4" />
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statItem}>
          <Wallet size={16} color="#FCD34D" />
          <Text style={styles.statValue}>₹4.2k</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <Card variant="solid" style={styles.menuCard}>
          <ProfileAction
            icon={Heart}
            label="Interested Categories"
            value="Music, Comedy"
            subtitle="Tune your recommendations"
            onPress={() => showComingSoon("Interested Categories", "Category preferences screen will be available soon.")}
          />
          <View style={styles.menuDivider} />
          <ProfileAction
            icon={Wallet}
            label="Payment Methods"
            value="UPI Linked"
            subtitle="Manage cards and wallets"
            onPress={() => showComingSoon("Payment Methods", "Payment methods manager will be available soon.")}
          />
          <View style={styles.menuDivider} />
          <ProfileAction
            icon={Clock}
            label="Booking History"
            subtitle="Past and upcoming orders"
            onPress={onOpenTickets}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <Card variant="solid" style={styles.menuCard}>
          <ProfileAction
            icon={Settings}
            label="App Settings"
            subtitle="Notifications, privacy, and preferences"
            onPress={() => showComingSoon("App Settings", "Settings panel will be available soon.")}
          />
          <View style={styles.menuDivider} />
          <ProfileAction
            icon={LogOut}
            label="Sign Out"
            subtitle="Securely log out from this device"
            onPress={handleSignOut}
          />
        </Card>
      </View>

      <Button
        title="Back to Discover"
        variant="ghost"
        onPress={onBackToDiscover}
        style={styles.backBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 60,
    paddingBottom: 190,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarInitial: {
    fontSize: 40,
    color: '#FFF',
    fontFamily: typography.bold,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F59E0B',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1A0F2E',
  },
  userName: {
    fontSize: 34,
    color: '#111827',
    fontFamily: typography.bold,
    marginBottom: 2,
    letterSpacing: -0.8,
  },
  userEmail: {
    fontSize: 15,
    color: 'rgba(17,24,39,0.6)',
    fontFamily: typography.primary,
    marginBottom: 14,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  tierText: {
    color: '#C026D3',
    fontSize: 10,
    fontFamily: typography.bold,
    letterSpacing: 1,
  },
  membershipCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.22)',
    padding: 16,
    marginBottom: 16,
  },
  membershipTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  membershipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  membershipPillText: {
    color: '#6D28D9',
    fontSize: 11,
    fontFamily: typography.bold,
    letterSpacing: 0.5,
  },
  membershipPoints: {
    color: 'rgba(109,40,217,0.85)',
    fontSize: 12,
    fontFamily: typography.bold,
  },
  membershipTitle: {
    color: '#312E81',
    fontSize: 18,
    fontFamily: typography.bold,
    marginBottom: 4,
  },
  membershipSubtitle: {
    color: 'rgba(49,46,129,0.75)',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: typography.primary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.08)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(17,24,39,0.08)',
  },
  statValue: {
    fontSize: 22,
    color: '#111827',
    fontFamily: typography.bold,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(17,24,39,0.55)',
    fontFamily: typography.primary,
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: 'rgba(17,24,39,0.75)',
    fontFamily: typography.bold,
    letterSpacing: 0.8,
    marginBottom: 12,
    marginLeft: 2,
    textTransform: 'uppercase',
  },
  menuCard: {
    padding: 0,
    borderRadius: 24,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    minHeight: 74,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  actionLabelWrap: {
    flex: 1,
    minWidth: 0,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(17,24,39,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 17,
    color: '#111827',
    fontFamily: typography.bold,
  },
  actionSubLabel: {
    fontSize: 12,
    color: 'rgba(17,24,39,0.55)',
    fontFamily: typography.primary,
    marginTop: 2,
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
    flexShrink: 0,
  },
  actionValue: {
    fontSize: 14,
    color: 'rgba(17,24,39,0.6)',
    fontFamily: typography.primary,
    maxWidth: 120,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(17,24,39,0.08)',
    marginHorizontal: 16,
  },
  backBtn: {
    marginTop: 4,
    marginBottom: 8,
  }
});
