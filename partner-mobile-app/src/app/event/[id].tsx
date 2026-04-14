import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Share, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, Users, Calendar, Wallet, ChevronLeft, Share2, Ticket, CheckCircle2, MoreVertical, MapPin } from 'lucide-react-native';
import apiClient from '../../api/client';

type EventInsights = {
  event: any;
  revenue: number;
  entries: {
    totalSold: number;
    checkedIn: number;
    pending: number;
  };
  tiers: any[];
};

export default function EventInsightsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [insights, setInsights] = useState<EventInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadInsights() {
    try {
      const response = await apiClient.get(`/partners/manage/events/${id}/insights`);
      setInsights(response.data?.data ?? null);
    } catch (err) {
      console.error('Failed to load insights:', err);
      Alert.alert('Error', 'Could not load event data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadInsights();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadInsights();
  };

  const handleShare = async () => {
    if (!insights) return;
    try {
      const message = `📈 *Event Quick Update: ${insights.event.title}*\n\n💰 Revenue: ₹${insights.revenue.toLocaleString()}\n🎟️ Tickets Sold: ${insights.entries.totalSold}\n✅ Checked-in: ${insights.entries.checkedIn}\n\nManaged via Book & Vibe Partner App`;
      await Share.share({
        message,
        title: insights.event.title
      });
    } catch (error) {
      console.error('Sharing failed:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const checkInRate = insights?.entries.totalSold ? (insights.entries.checkedIn / insights.entries.totalSold) : 0;

  let headerImageUrl = null;
  try {
    if (insights?.event?.images) {
      const parsed = typeof insights.event.images === 'string' ? JSON.parse(insights.event.images) : insights.event.images;
      if (Array.isArray(parsed) && parsed.length > 0) {
        headerImageUrl = parsed[0];
      }
    }
  } catch (e) {
    console.log('Error parsing event image', e);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Dashboard</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Share2 size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View style={styles.heroContainer}>
          {headerImageUrl ? (
            <Image source={{ uri: headerImageUrl }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Calendar size={48} color={COLORS.primary + '80'} />
            </View>
          )}
          <View style={styles.eventProfile}>
            <Text style={styles.eventTitle}>{insights?.event.title}</Text>
            <View style={styles.eventMeta}>
              <Calendar size={14} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{new Date(insights?.event.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
            </View>
            <View style={[styles.eventMeta, { marginTop: 6 }]}>
              <MapPin size={14} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{insights?.event.venue}</Text>
            </View>
          </View>
        </View>

        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <View style={styles.revenueIcon}>
              <Wallet size={24} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.revenueLabel}>Total Collection</Text>
              <Text style={styles.revenueValue}>₹{insights?.revenue.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.revenueFooter}>
            <TrendingUp size={14} color={COLORS.success} />
            <Text style={styles.revenueSubtext}>100% of current ticket sales</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entry Insights</Text>
          <View style={styles.entryCard}>
            <View style={styles.entryStats}>
              <View style={styles.entryStatItem}>
                <Text style={styles.entryStatValue}>{insights?.entries.checkedIn}</Text>
                <Text style={styles.entryStatLabel}>Checked In</Text>
              </View>
              <View style={[styles.entryStatItem, styles.entryStatBorder]}>
                <Text style={styles.entryStatValue}>{insights?.entries.totalSold}</Text>
                <Text style={styles.entryStatLabel}>Sold</Text>
              </View>
              <View style={styles.entryStatItem}>
                <Text style={styles.entryStatValue}>{Math.round(checkInRate * 100)}%</Text>
                <Text style={styles.entryStatLabel}>Arrival Rate</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${checkInRate * 100}%` }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressText}>{insights?.entries.checkedIn} scanned</Text>
                <Text style={styles.progressText}>{insights?.entries.totalSold} total tickets</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ticket Tiers Breakdown</Text>
          <View style={styles.tierList}>
            {insights?.tiers.map((tier) => (
              <View key={tier.id} style={styles.tierItem}>
                <View style={[styles.tierColor, { backgroundColor: tier.color === 'rose' ? '#f43f5e' : tier.color }]} />
                <View style={styles.tierInfo}>
                  <Text style={styles.tierName}>{tier.name}</Text>
                  <Text style={styles.tierSales}>{tier.sold} / {tier.total} Tickets</Text>
                </View>
                <View style={styles.tierRight}>
                  <Text style={styles.tierRevenue}>₹{tier.revenue.toLocaleString()}</Text>
                  <Text style={styles.tierPercent}>{Math.round((tier.sold / tier.total) * 100)}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.scanShortcut}
          onPress={() => router.push('/(event-tabs)/scan')}
        >
          <CheckCircle2 size={20} color={COLORS.text} />
          <Text style={styles.scanShortcutText}>CONTINUE SCANNING TICKETS</Text>
        </TouchableOpacity>

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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  heroContainer: {
    marginBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    marginBottom: 16,
    backgroundColor: COLORS.cardLight,
  },
  heroPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  eventProfile: {
    paddingHorizontal: 8,
  },
  eventTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  revenueCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  revenueIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  revenueLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDimUnits,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  revenueValue: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
  },
  revenueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  revenueSubtext: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  entryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  entryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  entryStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  entryStatBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  entryStatValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 4,
  },
  entryStatLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textDimUnits,
    textTransform: 'uppercase',
  },
  progressContainer: {
    gap: 10,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: COLORS.cardLight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tierList: {
    gap: 12,
  },
  tierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tierColor: {
    width: 6,
    height: 32,
    borderRadius: 3,
    marginRight: 16,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  tierSales: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  tierRight: {
    alignItems: 'flex-end',
  },
  tierRevenue: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },
  tierPercent: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  scanShortcut: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  scanShortcutText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1,
  },
});
