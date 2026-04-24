import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { EventItem, BookingDraft } from "../types";
import { Users, Armchair, ChevronLeft, CreditCard } from "lucide-react-native";

type BookingScreenProps = {
  event: EventItem;
  draft: BookingDraft;
  setDraft: React.Dispatch<React.SetStateAction<BookingDraft>>;
  onContinue: () => void;
};

export const BookingScreen = ({
  event,
  draft,
  setDraft,
  onContinue,
}: BookingScreenProps) => {
  const totalAmount = event.price * draft.qty;

  const formatCurrency = (value: number) => {
    return `₹${new Intl.NumberFormat("en-IN").format(value || 0)}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Customize Booking</Text>
        <Text style={styles.headerSubtitle}>{event.title}</Text>
      </View>

      <Card variant="glass" style={styles.mainCard}>
        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <Users size={18} color={colors.purpleBrand} />
            <Text style={styles.label}>Select Guests</Text>
          </View>
          <View style={styles.counterRow}>
            <Pressable
              style={styles.counterBtn}
              onPress={() =>
                setDraft((prev) => ({ ...prev, qty: Math.max(1, prev.qty - 1) }))
              }
            >
              <Text style={styles.counterText}>−</Text>
            </Pressable>
            <View style={styles.counterValueContainer}>
              <Text style={styles.counterValue}>{draft.qty}</Text>
              <Text style={styles.counterSubText}>Person{draft.qty > 1 ? 's' : ''}</Text>
            </View>
            <Pressable
              style={styles.counterBtn}
              onPress={() =>
                setDraft((prev) => ({ ...prev, qty: Math.min(10, prev.qty + 1) }))
              }
            >
              <Text style={styles.counterText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <Armchair size={18} color={colors.purpleBrand} />
            <Text style={styles.label}>Seat Zone Preference</Text>
          </View>
          <View style={styles.chooserRow}>
            {(["General", "Premium", "VIP"] as const).map((zone) => {
              const isActive = draft.seatZone === zone;
              return (
                <Pressable
                  key={zone}
                  style={[
                    styles.choicePill,
                    isActive && styles.choicePillActive,
                  ]}
                  onPress={() => setDraft((prev) => ({ ...prev, seatZone: zone }))}
                >
                  {isActive && (
                    <LinearGradient
                      colors={['#7C3AED', '#C026D3']}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  )}
                  <Text
                    style={[
                      styles.choiceText,
                      isActive && styles.choiceTextActive,
                    ]}
                  >
                    {zone}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.zoneHint}>
            {draft.seatZone === 'VIP' ? 'Front row access + Meet & Greet' :
             draft.seatZone === 'Premium' ? 'Elevated view + Dedicated lounge' :
             'Standard arena seating'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.pricingSection}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price per person</Text>
            <Text style={styles.priceValue}>{formatCurrency(event.price)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Booking Fee</Text>
            <Text style={styles.priceValue}>{formatCurrency(49)}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount + 49)}</Text>
          </View>
        </View>

        <Button
          title="Select Seats"
          onPress={onContinue}
          variant="primary"
          style={styles.continueBtn}
        />
        <Text style={styles.footerNote}>Prices inclusive of all taxes</Text>
      </Card>

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
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: typography.secondary,
    marginTop: 4,
  },
  mainCard: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  label: {
    color: "#fff",
    fontSize: 14,
    fontFamily: typography.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  counterBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  counterText: {
    color: "#fff",
    fontSize: 24,
    fontFamily: typography.secondary,
  },
  counterValueContainer: {
    alignItems: 'center',
  },
  counterValue: {
    color: "#fff",
    fontSize: 24,
    fontFamily: typography.bold,
  },
  counterSubText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: typography.primary,
  },
  chooserRow: {
    flexDirection: "row",
    gap: 10,
  },
  choicePill: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  choicePillActive: {
    borderColor: "rgba(124, 58, 237, 0.5)",
  },
  choiceText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    fontFamily: typography.bold,
  },
  choiceTextActive: {
    color: "#fff",
  },
  zoneHint: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    fontFamily: typography.primary,
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 24,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  pricingSection: {
    gap: 12,
    marginBottom: 32,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontFamily: typography.primary,
  },
  priceValue: {
    color: "#fff",
    fontSize: 16,
    fontFamily: typography.secondary,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  totalLabel: {
    color: "#fff",
    fontSize: 18,
    fontFamily: typography.bold,
  },
  totalValue: {
    color: colors.purpleBrand,
    fontSize: 24,
    fontFamily: typography.bold,
  },
  continueBtn: {
    height: 60,
  },
  footerNote: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontFamily: typography.primary,
    marginTop: 16,
  }
});
