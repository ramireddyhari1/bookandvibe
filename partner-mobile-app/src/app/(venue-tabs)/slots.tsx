import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar as CalendarIcon, Lock, RefreshCcw, Sparkles, Unlock } from 'lucide-react-native';
import apiClient from '../../api/client';
import { COLORS } from '../../theme/colors';

type Facility = {
  id: string;
  name: string;
  venue?: string;
  location?: string;
  type?: string;
  status?: string;
  pricePerHour?: number;
  rating?: number;
  reviewsCount?: number;
  pricingRules?: Array<Record<string, unknown>>;
  slotTemplate?: Array<{ label: string; price?: number; weekendPrice?: number }>;
  openHours?: string;
};

type AvailabilitySlot = {
  label: string;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'LOCKED';
  lockedByCurrentUser?: boolean;
};

type CalendarDay = {
  date: string;
  bookingCount: number;
  blockedCount: number;
  bookings?: Array<{ id: string; slotLabel: string; status: string }>;
  blocks?: Array<{ id: string; slotLabel: string; reason?: string; createdAt?: string }>;
};

const todayIso = new Date().toISOString().slice(0, 10);

function formatCurrency(amount: number | undefined) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

function formatSlotLabel(label: string) {
  return label.replace(' - ', ' to ');
}

function buildWeekDays(anchorDate: string) {
  const anchor = new Date(`${anchorDate}T00:00:00`);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(anchor);
    date.setDate(anchor.getDate() + index);
    return {
      date: date.toISOString().slice(0, 10),
      day: date.getDate(),
      label: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    };
  });
}

export default function SlotsScreen() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionKey, setActionKey] = useState('');
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateVisible, setTemplateVisible] = useState(false);
  const [templatePreview, setTemplatePreview] = useState<Array<{ label: string; price: number; weekendPrice: number }>>([]);

  const selectedTemplate = selectedFacility?.slotTemplate?.length
    ? selectedFacility.slotTemplate
    : [];

  const calendarByDate = useMemo(() => new Map(calendarDays.map((day) => [day.date, day])), [calendarDays]);
  const selectedDay = calendarByDate.get(selectedDate);

  const slotRows = selectedTemplate.map((slot) => {
    const match = availability.find((item) => item.label === slot.label);
    const block = selectedDay?.blocks?.find((entry) => entry.slotLabel === slot.label) || selectedDay?.blocks?.find((entry) => entry.slotLabel === '*');

    return {
      label: slot.label,
      price: slot.price ?? selectedFacility?.pricePerHour ?? 0,
      weekendPrice: slot.weekendPrice ?? slot.price ?? selectedFacility?.pricePerHour ?? 0,
      status: match?.status ?? 'AVAILABLE',
      lockedByCurrentUser: match?.lockedByCurrentUser ?? false,
      blockedBy: block,
    };
  });

  const summary = slotRows.reduce(
    (accumulator, slot) => {
      accumulator.total += 1;
      accumulator[slot.status.toLowerCase() as 'available' | 'booked' | 'blocked' | 'locked'] += 1;
      return accumulator;
    },
    { total: 0, available: 0, booked: 0, blocked: 0, locked: 0 }
  );

  async function fetchFacilities() {
    try {
      const response = await apiClient.get('/gamehub/facilities/manage/list', {
        params: { limit: 24, sortBy: 'rating', sortOrder: 'desc' },
      });

      const items = Array.isArray(response.data?.data) && response.data.data.length ? response.data.data : [];
      setFacilities(items);
      setSelectedFacilityId((current) => current || items[0]?.id || '');
    } catch (error) {
      console.error('Failed to fetch facilities', error);
      setFacilities([]);
      setSelectedFacilityId('');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function fetchFacilityState(facilityId: string, dateText: string) {
    try {
      const month = dateText.slice(0, 7);
      const [detailResponse, availabilityResponse, calendarResponse] = await Promise.allSettled([
        apiClient.get(`/gamehub/facilities/${facilityId}`),
        apiClient.get(`/gamehub/facilities/${facilityId}/availability`, { params: { date: dateText } }),
        apiClient.get(`/gamehub/facilities/${facilityId}/calendar`, { params: { month } }),
      ]);

      const detail = detailResponse.status === 'fulfilled' ? detailResponse.value.data?.data : null;
      const availabilityData = availabilityResponse.status === 'fulfilled' ? availabilityResponse.value.data?.data?.slots : [];
      const calendarData = calendarResponse.status === 'fulfilled' ? calendarResponse.value.data?.data?.days : [];

      setSelectedFacility(detail || facilities.find((item) => item.id === facilityId) || null);
      setAvailability(Array.isArray(availabilityData) ? availabilityData : []);
      setCalendarDays(Array.isArray(calendarData) ? calendarData : []);
    } catch (error) {
      console.error('Failed to fetch slot state', error);
      const fallback = facilities.find((item) => item.id === facilityId) || null;
      setSelectedFacility(fallback as Facility);
      setAvailability([]);
      setCalendarDays([]);
    }
  }

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    if (!selectedFacilityId) return;
    fetchFacilityState(selectedFacilityId, selectedDate);
  }, [selectedFacilityId, selectedDate]);

  async function refreshAll() {
    setRefreshing(true);
    await fetchFacilities();
  }

  async function handleBlockSlot(slotLabel: string) {
    if (!selectedFacilityId) return;

    setActionKey(slotLabel);
    try {
      await apiClient.post(`/gamehub/facilities/${selectedFacilityId}/block-slots`, {
        date: selectedDate,
        slotLabels: [slotLabel],
        reason: 'Managed from partner app',
      });
      await fetchFacilityState(selectedFacilityId, selectedDate);
    } catch (error: any) {
      Alert.alert('Unable to block slot', error.response?.data?.error || 'Please try again');
    } finally {
      setActionKey('');
    }
  }

  async function handleUnblockSlot(slotLabel: string) {
    if (!selectedFacilityId) return;

    const block = selectedDay?.blocks?.find((entry) => entry.slotLabel === slotLabel) || selectedDay?.blocks?.find((entry) => entry.slotLabel === '*');
    if (!block) {
      Alert.alert('Nothing to unblock', 'There is no block record for this slot.');
      return;
    }

    setActionKey(block.id);
    try {
      await apiClient.delete(`/gamehub/facilities/${selectedFacilityId}/block-slots/${block.id}`);
      await fetchFacilityState(selectedFacilityId, selectedDate);
    } catch (error: any) {
      Alert.alert('Unable to unblock slot', error.response?.data?.error || 'Please try again');
    } finally {
      setActionKey('');
    }
  }

  async function handleGenerateTemplate() {
    if (!selectedFacility) return;

    setTemplateLoading(true);
    try {
      const basePrice = Math.max(250, Number(selectedFacility.pricePerHour || 500));
      const response = await apiClient.post('/gamehub/facilities/slot-template/generate', {
        startHour: 6,
        endHour: 22,
        intervalMinutes: 60,
        basePrice,
        peakStartHour: 17,
        peakEndHour: 21,
        peakPrice: Math.round(basePrice * 1.25),
        weekendPrice: Math.round(basePrice * 1.1),
      });

      const preview = Array.isArray(response.data?.data) ? response.data.data : [];
      setTemplatePreview(preview);
      setTemplateVisible(true);
    } catch (error: any) {
      Alert.alert('Template preview failed', error.response?.data?.error || 'Please try again');
    } finally {
      setTemplateLoading(false);
    }
  }

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshAll} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Slots</Text>
            <Text style={styles.subtitle}>Manage availability, pricing, and blocks for your venues.</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={refreshAll}>
            <RefreshCcw size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>Select Facility</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.facilityList}>
            {facilities.map((facility) => {
              const isSelected = facility.id === selectedFacilityId;

              return (
                <TouchableOpacity
                  key={facility.id}
                  style={[styles.facilityCard, isSelected && styles.facilityCardActive]}
                  onPress={() => setSelectedFacilityId(facility.id)}
                >
                  <Text style={[styles.facilityName, isSelected && styles.facilityNameActive]} numberOfLines={1}>
                    {facility.name}
                  </Text>
                  <Text style={[styles.facilityMeta, isSelected && styles.facilityMetaActive]} numberOfLines={1}>
                    {facility.type || 'Facility'} • {facility.status || 'ACTIVE'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.available}</Text>
            <Text style={styles.summaryLabel}>Available</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.booked}</Text>
            <Text style={styles.summaryLabel}>Booked</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.blocked}</Text>
            <Text style={styles.summaryLabel}>Blocked</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.locked}</Text>
            <Text style={styles.summaryLabel}>Locked</Text>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <View style={styles.calendarTag}>
              <CalendarIcon size={14} color={COLORS.primary} />
              <Text style={styles.calendarTagText}>{selectedDate}</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayStrip}>
            {buildWeekDays(todayIso).map((day) => {
              const daySummary = calendarByDate.get(day.date);
              const isSelected = day.date === selectedDate;

              return (
                <TouchableOpacity
                  key={day.date}
                  style={[styles.dayCard, isSelected && styles.dayCardActive]}
                  onPress={() => setSelectedDate(day.date)}
                >
                  <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>{day.label}</Text>
                  <Text style={[styles.dayNumber, isSelected && styles.dayNumberActive]}>{day.day}</Text>
                  <Text style={[styles.dayStats, isSelected && styles.dayStatsActive]}>
                    {daySummary ? `${daySummary.bookingCount}B • ${daySummary.blockedCount}X` : '0B • 0X'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selectedDay ? (
            <View style={styles.calendarSummary}>
              <View style={styles.calendarMetric}>
                <Text style={styles.calendarMetricValue}>{selectedDay.bookingCount}</Text>
                <Text style={styles.calendarMetricLabel}>Bookings</Text>
              </View>
              <View style={styles.calendarMetric}>
                <Text style={styles.calendarMetricValue}>{selectedDay.blockedCount}</Text>
                <Text style={styles.calendarMetricLabel}>Blocks</Text>
              </View>
              <View style={styles.calendarMetric}>
                <Text style={styles.calendarMetricValue}>{selectedTemplate.length}</Text>
                <Text style={styles.calendarMetricLabel}>Slots</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Time Slots</Text>
            <Text style={styles.sectionHint}>{formatCurrency(selectedFacility?.pricePerHour)}</Text>
          </View>

          {slotRows.map((slot) => {
            const isBusy = slot.status !== 'AVAILABLE';
            const isBlocked = slot.status === 'BLOCKED';
            const isActionBusy = actionKey === slot.label || (slot.blockedBy && actionKey === slot.blockedBy.id);

            return (
              <View key={slot.label} style={styles.slotCard}>
                <View style={styles.slotInfo}>
                  <View
                    style={[
                      styles.slotIndicator,
                      {
                        backgroundColor:
                          slot.status === 'AVAILABLE'
                            ? COLORS.primary
                            : slot.status === 'BOOKED'
                              ? COLORS.accent
                              : slot.status === 'LOCKED'
                                ? COLORS.warning
                                : COLORS.danger,
                      },
                    ]}
                  />
                  <View>
                    <Text style={styles.slotTime}>{formatSlotLabel(slot.label)}</Text>
                    <Text style={styles.slotPrice}>{formatCurrency(slot.price)} / hr</Text>
                    <Text style={styles.slotMeta}>
                      {slot.status === 'AVAILABLE'
                        ? 'Ready to sell'
                        : slot.status === 'LOCKED'
                          ? 'Locked by partner'
                          : slot.status === 'BOOKED'
                            ? 'Booked by customer'
                            : `Blocked${slot.blockedBy?.reason ? ` • ${slot.blockedBy.reason}` : ''}`}
                    </Text>
                  </View>
                </View>

                <View style={styles.slotActions}>
                  {slot.status === 'AVAILABLE' ? (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.blockBtn, isActionBusy && styles.disabledActionBtn]}
                      onPress={() => handleBlockSlot(slot.label)}
                      disabled={isActionBusy}
                    >
                      {isActionBusy ? <ActivityIndicator size="small" color={COLORS.danger} /> : <Lock size={14} color={COLORS.danger} />}
                      <Text style={styles.blockBtnText}>BLOCK</Text>
                    </TouchableOpacity>
                  ) : isBlocked || slot.status === 'LOCKED' ? (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.unlockBtn, isActionBusy && styles.disabledActionBtn]}
                      onPress={() => handleUnblockSlot(slot.label)}
                      disabled={isActionBusy}
                    >
                      {isActionBusy ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Unlock size={14} color={COLORS.primary} />}
                      <Text style={styles.unlockBtnText}>UNBLOCK</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.bookedTag}>
                      <Text style={styles.bookedTagText}>BOOKED</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.previewTitle}>Pricing template</Text>
              <Text style={styles.previewText}>Generate a fresh slot template using the current facility price and a peak window.</Text>
            </View>
            <Sparkles size={18} color={COLORS.primary} />
          </View>

          <TouchableOpacity style={styles.previewButton} onPress={handleGenerateTemplate} disabled={templateLoading}>
            {templateLoading ? <ActivityIndicator color={COLORS.text} /> : <Text style={styles.previewButtonText}>PREVIEW TEMPLATE</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal transparent visible={templateVisible} animationType="fade" onRequestClose={() => setTemplateVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generated template</Text>
              <TouchableOpacity onPress={() => setTemplateVisible(false)}>
                <Text style={styles.modalClose}>CLOSE</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.templateList} showsVerticalScrollIndicator={false}>
              {templatePreview.slice(0, 8).map((slot) => (
                <View key={slot.label} style={styles.templateRow}>
                  <View>
                    <Text style={styles.templateSlotLabel}>{slot.label}</Text>
                    <Text style={styles.templateSlotMeta}>Weekend {formatCurrency(slot.weekendPrice)}</Text>
                  </View>
                  <Text style={styles.templateSlotPrice}>{formatCurrency(slot.price)}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    padding: 24,
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBlock: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textDimUnits,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  facilityList: {
    gap: 12,
  },
  facilityCard: {
    width: 220,
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  facilityCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '18',
  },
  facilityName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  facilityNameActive: {
    color: COLORS.primary,
  },
  facilityMeta: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  facilityMetaActive: {
    color: COLORS.primaryLight,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  summaryCard: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textDimUnits,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  calendarTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  calendarTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  dayStrip: {
    gap: 10,
    paddingBottom: 8,
  },
  dayCard: {
    width: 76,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  dayCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  dayLabelActive: {
    color: COLORS.secondary,
  },
  dayNumber: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },
  dayNumberActive: {
    color: COLORS.secondary,
  },
  dayStats: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  dayStatsActive: {
    color: COLORS.secondary,
  },
  calendarSummary: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  calendarMetric: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  calendarMetricValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },
  calendarMetricLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  slotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  slotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    paddingRight: 10,
  },
  slotIndicator: {
    width: 4,
    height: 34,
    borderRadius: 2,
  },
  slotTime: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  slotPrice: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
  },
  slotMeta: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  slotActions: {
    alignItems: 'flex-end',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  disabledActionBtn: {
    opacity: 0.7,
  },
  blockBtn: {
    backgroundColor: COLORS.danger + '14',
    borderColor: COLORS.danger + '35',
  },
  blockBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.danger,
    letterSpacing: 0.6,
  },
  unlockBtn: {
    backgroundColor: COLORS.primary + '14',
    borderColor: COLORS.primary + '35',
  },
  unlockBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
  bookedTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.accent + '20',
    borderRadius: 8,
  },
  bookedTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.accent,
  },
  previewCard: {
    marginTop: 4,
    padding: 18,
    borderRadius: 20,
    backgroundColor: COLORS.secondary + '22',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  previewText: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.primaryLight,
    lineHeight: 18,
    fontWeight: '600',
  },
  previewButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    maxHeight: '80%',
    borderRadius: 24,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },
  modalClose: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  templateList: {
    maxHeight: 360,
  },
  templateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  templateSlotLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  templateSlotMeta: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  templateSlotPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary,
  },
});
