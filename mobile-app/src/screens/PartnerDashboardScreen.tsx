import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform, TouchableOpacity } from "react-native";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { apiGet } from "../lib/api";
import {
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  PlusCircle,
  Settings,
  ChevronRight,
  Bell,
  ArrowUpRight
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export const PartnerDashboardScreen = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch partner specific stats
    const fetchPartnerStats = async () => {
      try {
        // Mocking partner ID for now
        const partnerFacilities = await apiGet<any[]>('/facilities?limit=5'); 
        const liveResults = await Promise.all(
          partnerFacilities.map(f => apiGet<any[]>(`/live-match/facility/${f.id}`).catch(() => []))
        );
        const activeMatches = liveResults.flat().filter(m => m.status === 'LIVE');
        
        setStats({
          activeEvents: 5,
          totalBookings: 128,
          revenue: 45000,
          pendingApprovals: 2,
          growth: "+12.5%",
          liveMatches: activeMatches
        });
      } catch (err) {
        console.warn('Failed to fetch partner stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartnerStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const StatItem = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => (
    <Card variant="glass" style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Icon size={20} color={color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </Card>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.title}>Partner Studio</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Bell size={24} color="#FFF" />
          {stats.pendingApprovals > 0 && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={['rgba(124, 58, 237, 0.4)', 'rgba(192, 38, 211, 0.2)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.revenueHero}
      >
        <View style={styles.revenueHeader}>
          <Text style={styles.revenueLabel}>TOTAL REVENUE</Text>
          <View style={styles.growthBadge}>
            <TrendingUp size={12} color="#10B981" />
            <Text style={styles.growthText}>{stats.growth}</Text>
          </View>
        </View>
        <Text style={styles.revenueAmount}>₹{stats.revenue.toLocaleString()}</Text>
        <Text style={styles.revenueSub}>Payout scheduled for Oct 1st</Text>

        <TouchableOpacity style={styles.withdrawBtn}>
          <Text style={styles.withdrawText}>Withdraw Funds</Text>
          <ArrowUpRight size={16} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.statsGrid}>
        <StatItem
          icon={Calendar}
          label="Active Events"
          value={stats.activeEvents}
          color="#A855F7"
        />
        <StatItem
          icon={Users}
          label="Total Bookings"
          value={stats.totalBookings}
          color="#0EA5E9"
        />
      </View>

      {stats.liveMatches && stats.liveMatches.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Activity</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>{stats.liveMatches.length} ACTIVE</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.liveScroll}>
            {stats.liveMatches.map((match: any) => (
              <View key={match.id} style={styles.liveMiniCard}>
                <Text style={styles.liveSport}>{match.sportType}</Text>
                <Text style={styles.liveScore}>{match.scoreData.runs || 0}/{match.scoreData.wickets || 0}</Text>
                <Text style={styles.liveUser}>{match.booking.user.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <LinearGradient
              colors={['#7C3AED', '#6D28D9']}
              style={styles.actionIconFull}
            >
              <PlusCircle size={24} color="#FFF" />
            </LinearGradient>
            <Text style={styles.actionText}>New Event</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIconOutline}>
              <BarChart3 size={24} color="#7C3AED" />
            </View>
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIconOutline}>
              <Settings size={24} color="#7C3AED" />
            </View>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Card variant="glass" style={styles.activityCard}>
          {[1, 2, 3].map((item, index) => (
            <View key={item} style={[
              styles.activityItem,
              index !== 2 && styles.activityDivider
            ]}>
              <View style={styles.activityIcon}>
                <Users size={16} color="rgba(255,255,255,0.6)" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityTitle}>New Booking for Saffron Sky</Text>
                <Text style={styles.activityTime}>2 minutes ago</Text>
              </View>
              <Text style={styles.activityAmount}>+₹1,299</Text>
            </View>
          ))}
        </Card>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0A1F',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: typography.primary,
  },
  title: {
    fontSize: 28,
    color: '#FFF',
    fontFamily: typography.bold,
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#1A0F2E',
  },
  revenueHero: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  revenueLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: typography.bold,
    letterSpacing: 1,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  growthText: {
    color: '#10B981',
    fontSize: 12,
    fontFamily: typography.bold,
  },
  revenueAmount: {
    fontSize: 40,
    color: '#FFF',
    fontFamily: typography.bold,
    marginBottom: 4,
  },
  revenueSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: typography.primary,
    marginBottom: 20,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  withdrawText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: typography.secondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    color: '#FFF',
    fontFamily: typography.bold,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: typography.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFF',
    fontFamily: typography.bold,
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconFull: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  actionIconOutline: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: typography.secondary,
  },
  activityCard: {
    padding: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  activityDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 14,
    color: '#FFF',
    fontFamily: typography.secondary,
  },
  activityTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: typography.primary,
  },
  activityAmount: {
    fontSize: 14,
    color: '#10B981',
    fontFamily: typography.bold,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    color: '#EF4444',
    fontSize: 10,
    fontFamily: typography.bold,
  },
  liveScroll: {
    gap: 12,
  },
  liveMiniCard: {
    width: 140,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  liveSport: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: typography.bold,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  liveScore: {
    fontSize: 20,
    color: '#FFF',
    fontFamily: typography.bold,
  },
  liveUser: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: typography.primary,
    marginTop: 4,
  },
});
