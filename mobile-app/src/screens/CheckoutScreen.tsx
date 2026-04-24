import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { EventItem, FacilityItem, BookingDraft, FacilityBookingDraft } from "../types";
import { CreditCard, Wallet, Smartphone, ShieldCheck, Info, Calendar, Clock } from "lucide-react-native";

type CheckoutScreenProps = {
  event?: EventItem | null;
  facility?: FacilityItem | null;
  eventDraft?: BookingDraft | null;
  facilityDraft?: FacilityBookingDraft | null;
  onUpdateEventDraft?: (d: BookingDraft) => void;
  onUpdateFacilityDraft?: (d: FacilityBookingDraft) => void;
  onComplete: () => void;
};

export const CheckoutScreen = ({
  event,
  facility,
  eventDraft,
  facilityDraft,
  onUpdateEventDraft,
  onUpdateFacilityDraft,
  onComplete,
}: CheckoutScreenProps) => {
  const isFacility = !!facility && !!facilityDraft;
  const currentPrice = isFacility ? facilityDraft.price : (event?.price || 0);
  const currentQty = isFacility ? 1 : (eventDraft?.qty || 1);
  const payMethod = isFacility ? facilityDraft.paymentMethod : (eventDraft?.paymentMethod || "UPI");
  const totalAmount = (currentPrice * currentQty) + (isFacility ? 0 : 49);

  const brandColor = isFacility ? "#10B981" : colors.purpleBrand;
  const mainTheme = isFacility ? "light" : "dark";

  const formatCurrency = (value: number) => {
    return `₹${new Intl.NumberFormat("en-IN").format(value || 0)}`;
  };

  const setPaymentMethod = (method: "UPI" | "Card" | "Wallet") => {
    if (isFacility && onUpdateFacilityDraft && facilityDraft) {
      onUpdateFacilityDraft({ ...facilityDraft, paymentMethod: method });
    } else if (onUpdateEventDraft && eventDraft) {
      onUpdateEventDraft({ ...eventDraft, paymentMethod: method });
    }
  };

  const PaymentOption = ({ method, icon: Icon, label }: { method: any, icon: any, label: string }) => {
    const isActive = payMethod === method;
    return (
      <Pressable
        style={[
          styles.paymentCard, 
          isActive && { borderColor: brandColor, backgroundColor: isFacility ? 'rgba(16,185,129,0.05)' : 'rgba(124, 58, 237, 0.05)' }
        ]}
        onPress={() => setPaymentMethod(method)}
      >
        <View style={[styles.methodIcon, isActive && { backgroundColor: brandColor }]}>
          <Icon size={24} color={isActive ? "#FFF" : (isFacility ? "#9CA3AF" : "rgba(255,255,255,0.4)")} />
        </View>
        <Text style={[styles.methodLabel, isActive && styles.methodLabelActive, isFacility && { color: isActive ? "#111827" : "#6B7280" }]}>
          {label}
        </Text>
        <View style={[styles.radio, isActive && { borderColor: brandColor }]}>
          {isActive && <View style={[styles.radioInner, { backgroundColor: brandColor }]} />}
        </View>
      </Pressable>
    );
  };

  return (
    <ScrollView style={[styles.container, isFacility && { backgroundColor: '#F8FAFC' }]} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isFacility && { color: '#111827' }]}>Review & Pay</Text>
        <Text style={[styles.headerSubtitle, isFacility && { color: 'rgba(17,24,39,0.5)' }]}>Final step to secure your spot</Text>
      </View>

      <Card variant={isFacility ? "solid" : "glass"} style={[styles.reviewCard, isFacility && styles.reviewCardLight]}>
        <View style={styles.reviewHeader}>
          <Text style={[styles.reviewTitle, isFacility && { color: '#065F46' }]}>
            {isFacility ? facility.name : event?.title}
          </Text>
          <View style={styles.metaRow}>
            {isFacility ? (
              <>
                <View style={styles.metaItem}>
                  <Calendar size={12} color={brandColor} />
                  <Text style={[styles.metaText, isFacility && { color: 'rgba(6,95,70,0.6)' }]}>{facilityDraft.date}</Text>
                </View>
                <View style={styles.dot} />
                <View style={styles.metaItem}>
                  <Clock size={12} color={brandColor} />
                  <Text style={[styles.metaText, isFacility && { color: 'rgba(6,95,70,0.6)' }]}>{facilityDraft.slot}</Text>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.metaText}>
                  {new Date(event?.date || "").toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {event?.time || "7:30 PM"}
                </Text>
                <View style={styles.dot} />
                <Text style={styles.metaText}>{eventDraft?.qty} Ticket{eventDraft?.qty !== 1 ? 's' : ''}</Text>
              </>
            )}
          </View>
        </View>
        {(!isFacility && eventDraft) && (
          <View style={styles.zoneTag}>
            <Text style={styles.zoneTagText}>{eventDraft.seatZone.toUpperCase()}</Text>
          </View>
        )}
      </Card>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isFacility && { color: 'rgba(17,24,39,0.4)' }]}>Payment Method</Text>
        <View style={styles.paymentGrid}>
          <PaymentOption method="UPI" icon={Smartphone} label="UPI (GPay, PhonePe)" />
          <PaymentOption method="Card" icon={CreditCard} label="Credit / Debit Card" />
          <PaymentOption method="Wallet" icon={Wallet} label="Digital Wallets" />
        </View>
      </View>

      <View style={styles.summarySection}>
        <Text style={[styles.sectionTitle, isFacility && { color: 'rgba(17,24,39,0.4)' }]}>Order Summary</Text>
        <Card variant={isFacility ? "solid" : "glass"} style={[styles.summaryCard, isFacility && styles.summaryCardLight]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, isFacility && { color: 'rgba(0,0,0,0.4)' }]}>
              {isFacility ? "Facility Booking Fee" : `Base Amount (${currentQty} x ${currentPrice})`}
            </Text>
            <Text style={[styles.summaryValue, isFacility && { color: '#111827' }]}>{formatCurrency(currentPrice * currentQty)}</Text>
          </View>
          {!isFacility && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Booking Fee & Tax</Text>
              <Text style={styles.summaryValue}>{formatCurrency(49)}</Text>
            </View>
          )}
          <View style={[styles.summaryDivider, isFacility && { backgroundColor: 'rgba(0,0,0,0.05)' }]} />
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, isFacility && { color: '#111827' }]}>Grand Total</Text>
            <Text style={[styles.totalValue, { color: brandColor }]}>{formatCurrency(totalAmount)}</Text>
          </View>
        </Card>
      </View>

      <View style={styles.securityInfo}>
        <ShieldCheck size={16} color="#10B981" />
        <Text style={[styles.securityText, isFacility && { color: 'rgba(17,24,39,0.4)' }]}>Secure 256-bit SSL Encrypted Payment</Text>
      </View>

      <Button
        title={`Pay ${formatCurrency(totalAmount)}`}
        onPress={onComplete}
        variant="primary"
        style={styles.payBtn}
        color={brandColor}
      />

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
    paddingTop: Platform.OS === 'ios' ? 40 : 60,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    color: '#FFF',
    fontFamily: typography.bold,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: typography.secondary,
    marginTop: 4,
  },
  reviewCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginBottom: 32,
  },
  reviewCardLight: {
    backgroundColor: '#FFF',
    borderColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
  },
  reviewHeader: {
    flex: 1,
  },
  reviewTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: typography.bold,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  metaText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontFamily: typography.primary,
  },
  zoneTag: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  zoneTagText: {
    color: colors.purpleBrand,
    fontSize: 10,
    fontFamily: typography.bold,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: typography.bold,
    letterSpacing: 1,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  paymentGrid: {
    gap: 12,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodLabel: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: typography.secondary,
  },
  methodLabelActive: {
    color: '#FFF',
    fontFamily: typography.bold,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 24,
  },
  summaryCardLight: {
    backgroundColor: '#FFF',
    borderColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    fontFamily: typography.primary,
  },
  summaryValue: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: typography.secondary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: typography.bold,
  },
  totalValue: {
    fontSize: 24,
    fontFamily: typography.bold,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  securityText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: typography.primary,
  },
  payBtn: {
    height: 64,
  }
});
