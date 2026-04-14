import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { COLORS } from '../../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Calendar, MapPin, Users, Ticket, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../api/client';

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, DRAFT, COMPLETED

  async function fetchEvents() {
    try {
      const response = await apiClient.get('/partners/my-events');
      setEvents(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const filteredEvents = filter === 'ALL' ? events : events.filter(e => e.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return COLORS.success;
      case 'DRAFT': return COLORS.textMuted;
      case 'COMPLETED': return '#818CF8';
      case 'CANCELLED': return COLORS.danger;
      default: return COLORS.textMuted;
    }
  };
  const renderEventItem = ({ item }: any) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/event/[id]', params: { id: item.id } })}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.tag, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.tagText, { color: getStatusColor(item.status) }]}>{item.status || 'DRAFT'}</Text>
          </View>
          <Text style={styles.bookingId}>#{item.id?.slice(0, 8).toUpperCase()}</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.facilityName}>{item.title}</Text>
          <View style={styles.infoRow}>
            <Calendar size={14} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} • {item.time || ''}</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={14} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{item.venue}, {item.location}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.amount}>₹{item.price || 0}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ticket size={14} color={COLORS.textMuted} />
              <Text style={styles.infoText}>{item._count?.bookings || 0} sold</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Users size={14} color={COLORS.textMuted} />
              <Text style={styles.infoText}>{item.availableSlots}/{item.totalSlots}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/new-event')}>
            <Plus size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert('Search', 'Search feature will be available in the next update.')}>
            <Search size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert('Filter', 'Advanced filters map to the categories below.')}>
            <Filter size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterBar}>
        {['ALL', 'ACTIVE', 'DRAFT', 'COMPLETED'].map((f) => (
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
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No live events found</Text>
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
