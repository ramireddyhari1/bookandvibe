import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Users, Calendar, Wallet, ChevronRight, Plus, Scan } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import apiClient from '../../api/client';

type DashboardStats = {
  totalRevenue: number;
  currentBalance: number;
  ticketsSold: number;
  liveEventsCount: number;
  totalEvents: number;
  recentTransactions: any[];
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard() {
    try {
      const response = await apiClient.get('/partners/event-stats');
      setStats(response.data?.data ?? null);
    } catch (err) {
      console.error('Failed to load event stats:', err);
      setStats({ totalRevenue: 0, currentBalance: 0, ticketsSold: 0, liveEventsCount: 0, totalEvents: 0, recentTransactions: [] });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Evening,</Text>
            <Text style={styles.userName}>{user?.name || 'Partner'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/new-event')}>
              <Plus size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: COLORS.secondary }]}>
            <View style={styles.statHeader}>
              <Wallet size={20} color={COLORS.primary} />
              <TrendingUp size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.statLabel}>Total Revenue</Text>
            <Text style={styles.statValue}>₹{(stats?.totalRevenue || 0).toLocaleString()}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Users size={20} color={COLORS.accent} />
            </View>
            <Text style={styles.statLabel}>Tickets Sold</Text>
            <Text style={styles.statValue}>{stats?.ticketsSold || 0}</Text>
          </View>
        </View>

        <View style={styles.walletPreview}>
          <View>
            <Text style={styles.walletLabel}>Available Balance</Text>
            <Text style={styles.walletValue}>₹{(stats?.currentBalance || 0).toLocaleString()}</Text>
          </View>
          <TouchableOpacity 
            style={styles.withdrawButton}
            onPress={() => router.push('/(event-tabs)/earnings')}
          >
            <Text style={styles.withdrawButtonText}>WITHDRAW</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => router.push('/(event-tabs)/scan')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.cardLight }]}>
                <Scan size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionLabel}>Scan QR</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => router.push('/new-event')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.cardLight }]}>
                <Plus size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionLabel}>Create Event</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => router.push('/(event-tabs)/events')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.cardLight }]}>
                <Calendar size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionLabel}>Audit Tiers</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => router.push('/(event-tabs)/earnings')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.cardLight }]}>
                <TrendingUp size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionLabel}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent activity</Text>
            <TouchableOpacity onPress={() => router.push('/(event-tabs)/earnings')}>
              <Text style={styles.seeAll}>SEE ALL</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
              stats.recentTransactions.map((tx: any) => (
                <View key={tx.id} style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: tx.amount > 0 ? '#10b98115' : '#ef444415' }]}>
                    <Wallet size={16} color={tx.amount > 0 ? COLORS.primary : COLORS.danger} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{tx.description || 'Transaction'}</Text>
                    <Text style={styles.activityDate}>{new Date(tx.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <Text style={[styles.activityAmount, { color: tx.amount > 0 ? COLORS.primary : COLORS.danger }]}>
                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No recent activities</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textDimUnits,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDimUnits,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  walletPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  walletLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDimUnits,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  walletValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  withdrawButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  withdrawButtonText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
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
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  seeAll: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDimUnits,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  activityDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
