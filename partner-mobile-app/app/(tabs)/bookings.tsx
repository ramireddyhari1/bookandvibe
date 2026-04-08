import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { COLORS } from '../../src/theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Calendar, MapPin, User, CheckCircle2 } from 'lucide-react-native';
import apiClient from '../../src/api/client';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('UPCOMING'); // UPCOMING, COMPLETED, CANCELLED

  async function fetchBookings() {
    try {
      // Reusing gamehub manage list for bookings scoped to partner
      const response = await apiClient.get('/gamehub/facilities/manage/list');
      // Note: This is an oversimplification for the demo, 
      // in production we'd have a /api/partners/bookings endpoint
      // For now, I'll mock some data based on actual API structure
      setBookings(response.data.data);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const renderBookingItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.status || 'CONFIRMED'}</Text>
        </View>
        <Text style={styles.bookingId}>#BK-{item.id.slice(0, 8).toUpperCase()}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.facilityName}>{item.name}</Text>
        <View style={styles.infoRow}>
          <Calendar size={14} color={COLORS.textMuted} />
          <Text style={styles.infoText}>{item.openHours || '06 Apr, 2024 • 06:00 PM'}</Text>
        </View>
        <View style={styles.infoRow}>
          <User size={14} color={COLORS.textMuted} />
          <Text style={styles.infoText}>{item.venue || 'Ramesh Kumar'}</Text>
        </View>
      </View>

        const [filter, setFilter] = useState<(typeof filters)[number]>('ALL');
        <Text style={styles.amount}>₹{item.pricePerHour || 500}</Text>
        <TouchableOpacity style={styles.actionButton}>
          <CheckCircle2 size={16} color={COLORS.primary} />
            const response = await apiClient.get('/gamehub/bookings');
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Filter size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterBar}>
        {['UPCOMING', 'COMPLETED', 'CANCELLED'].map((f) => (
          <TouchableOpacity 
            key={f} 
            style={[styles.filterTab, filter === f && styles.activeFilterTab]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.activeFilterTabText]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={COLORS.primary} />
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No bookings found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
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
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterTab: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  activeFilterTabText: {
    color: COLORS.primary,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.success + '20',
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.success,
  },
  bookingId: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  cardBody: {
    marginBottom: 16,
    gap: 8,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textDimUnits,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  amount: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.cardLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionButtonText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  emptyState: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
