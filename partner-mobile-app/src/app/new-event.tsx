import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Calendar, MapPin, Tag, IndianRupee, Users, Type, AlignLeft } from 'lucide-react-native';
import apiClient from '../api/client';

const CATEGORIES = ['MUSIC', 'SPORTS', 'COMEDY', 'WORKSHOP', 'OTHER'];

export default function CreateEventScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'MUSIC',
    venue: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    price: '',
    totalSlots: '',
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.venue || !formData.price || !formData.totalSlots) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        totalSlots: parseInt(formData.totalSlots),
        partnerId: user?.id,
        status: 'DRAFT',
        bookingFormat: 'TIER', // Default for quick create
        visibility: 'PUBLIC'
      };

      await apiClient.post('/events', payload);
      Alert.alert('Success', 'Event draft created successfully!', [
        { text: 'View Events', onPress: () => router.replace('/(event-tabs)/events') }
      ]);
    } catch (err: any) {
      Alert.alert('Submission Failed', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quick Create Event</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Title *</Text>
            <View style={styles.inputWrapper}>
              <Type size={18} color={COLORS.textMuted} />
              <TextInput 
                style={styles.input}
                placeholder="e.g. Summer Music Fest"
                placeholderTextColor={COLORS.textDimUnits}
                value={formData.title}
                onChangeText={(t) => setFormData({...formData, title: t})}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity 
                  key={cat}
                  style={[styles.categoryChip, formData.category === cat && styles.activeChip]}
                  onPress={() => setFormData({...formData, category: cat})}
                >
                  <Text style={[styles.categoryText, formData.category === cat && styles.activeCategoryText]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 12 }]}>
              <AlignLeft size={18} color={COLORS.textMuted} style={{ marginTop: 2 }} />
              <TextInput 
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Tell users what the event is about..."
                placeholderTextColor={COLORS.textDimUnits}
                multiline
                value={formData.description}
                onChangeText={(t) => setFormData({...formData, description: t})}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
              <View style={styles.inputWrapper}>
                <Calendar size={18} color={COLORS.textMuted} />
                <TextInput 
                  style={styles.input}
                  placeholder="2024-06-15"
                  placeholderTextColor={COLORS.textDimUnits}
                  value={formData.date}
                  onChangeText={(t) => setFormData({...formData, date: t})}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 0.8 }]}>
              <Text style={styles.label}>Time (24h)</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={[styles.input, { marginLeft: 0 }]}
                  placeholder="19:00"
                  placeholderTextColor={COLORS.textDimUnits}
                  value={formData.time}
                  onChangeText={(t) => setFormData({...formData, time: t})}
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Venue Name *</Text>
            <View style={styles.inputWrapper}>
              <MapPin size={18} color={COLORS.textMuted} />
              <TextInput 
                style={styles.input}
                placeholder="e.g. Royal Grand Ballroom"
                placeholderTextColor={COLORS.textDimUnits}
                value={formData.venue}
                onChangeText={(t) => setFormData({...formData, venue: t})}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City/Location *</Text>
            <View style={styles.inputWrapper}>
              <MapPin size={18} color={COLORS.textMuted} />
              <TextInput 
                style={styles.input}
                placeholder="e.g. Hyderabad"
                placeholderTextColor={COLORS.textDimUnits}
                value={formData.location}
                onChangeText={(t) => setFormData({...formData, location: t})}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Ticket Price *</Text>
              <View style={styles.inputWrapper}>
                <IndianRupee size={18} color={COLORS.textMuted} />
                <TextInput 
                  style={styles.input}
                  placeholder="999"
                  placeholderTextColor={COLORS.textDimUnits}
                  keyboardType="numeric"
                  value={formData.price}
                  onChangeText={(t) => setFormData({...formData, price: t})}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Total Capacity *</Text>
              <View style={styles.inputWrapper}>
                <Users size={18} color={COLORS.textMuted} />
                <TextInput 
                  style={styles.input}
                  placeholder="500"
                  placeholderTextColor={COLORS.textDimUnits}
                  keyboardType="numeric"
                  value={formData.totalSlots}
                  onChangeText={(t) => setFormData({...formData, totalSlots: t})}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.submitButtonText}>CREATE EVENT DRAFT</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.hintText}>
            Note: Advanced settings like ticket tiers and interactive seating arrangements can be configured in the Web Dashboard after saving this draft.
          </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    textTransform: 'uppercase',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  formContainer: {
    gap: 24,
  },
  inputGroup: {
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textDimUnits,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeChip: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textDimUnits,
    letterSpacing: 0.5,
  },
  activeCategoryText: {
    color: COLORS.primary,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1,
  },
  hintText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 18,
    paddingHorizontal: 20,
    marginTop: 8,
  },
});
