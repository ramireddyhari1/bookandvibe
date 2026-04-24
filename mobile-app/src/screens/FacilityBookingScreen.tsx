import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, Calendar, Clock, Info, CheckCircle2 } from "lucide-react-native";
import { FacilityItem, FacilityBookingDraft } from "../types";
import { typography } from "../theme/typography";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type FacilityBookingScreenProps = {
  facility: FacilityItem;
  onBack: () => void;
  onConfirm: (draft: FacilityBookingDraft) => void;
};

const TIME_SLOTS = {
  Morning: ["06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM"],
  Afternoon: ["12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"],
  Evening: ["06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"],
};

export const FacilityBookingScreen = ({
  facility,
  onBack,
  onConfirm,
}: FacilityBookingScreenProps) => {
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: d.getDate(),
      full: d.toISOString().split("T")[0],
    };
  });

  const handleConfirm = () => {
    if (selectedSlot) {
      onConfirm({
        date: dates[selectedDate].full,
        slot: selectedSlot,
        facilityId: facility.id,
        price: facility.pricePerHour,
        paymentMethod: "UPI",
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={24} color="#111827" />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{facility.name}</Text>
          <Text style={styles.headerSubtitle}>{facility.location}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Date Selection */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Calendar size={18} color="#10B981" />
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateList}>
            {dates.map((item, i) => {
              const active = selectedDate === i;
              return (
                <Pressable
                  key={i}
                  onPress={() => setSelectedDate(i)}
                  style={[styles.datePill, active && styles.datePillActive]}
                >
                  <Text style={[styles.dateDay, active && styles.dateDayActive]}>{item.dayName}</Text>
                  <Text style={[styles.dateNum, active && styles.dateDayActive]}>{item.dayNum}</Text>
                  {active && <View style={styles.activeDot} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Slot Selection */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Clock size={18} color="#10B981" />
            <Text style={styles.sectionTitle}>Select Time Slot</Text>
          </View>

          {Object.entries(TIME_SLOTS).map(([period, slots]) => (
            <View key={period} style={styles.periodGroup}>
              <Text style={styles.periodTitle}>{period}</Text>
              <View style={styles.slotGrid}>
                {slots.map((s) => {
                  const active = selectedSlot === s;
                  return (
                    <Pressable
                      key={s}
                      onPress={() => setSelectedSlot(s)}
                      style={[styles.slotCard, active && styles.slotCardActive]}
                    >
                      <Text style={[styles.slotText, active && styles.slotTextActive]}>{s}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Pricing Info */}
        <View style={styles.infoCard}>
          <Info size={16} color="#059669" />
          <Text style={styles.infoText}>
            Price includes all equipment. Please arrive 10 mins early.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.footer}>
        <View style={styles.pricing}>
          <Text style={styles.priceLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.priceValue}>₹{facility.pricePerHour}</Text>
        </View>
        <Pressable
          onPress={handleConfirm}
          disabled={!selectedSlot}
          style={[styles.confirmBtn, !selectedSlot && styles.confirmBtnDisabled]}
        >
          <LinearGradient
            colors={selectedSlot ? ["#10B981", "#059669"] : ["#E5E7EB", "#D1D5DB"]}
            style={styles.btnGradient}
          >
            <Text style={styles.confirmBtnText}>CONFIRM BOOKING</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: typography.bold,
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: typography.primary,
    color: "rgba(17,24,39,0.5)",
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: typography.bold,
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  dateList: {
    marginHorizontal: -5,
  },
  datePill: {
    width: 65,
    height: 85,
    backgroundColor: "#FFF",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 2 },
    }),
  },
  datePillActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  dateDay: {
    fontSize: 12,
    fontFamily: typography.primary,
    color: "rgba(17,24,39,0.5)",
    marginBottom: 4,
  },
  dateNum: {
    fontSize: 18,
    fontFamily: typography.bold,
    color: "#111827",
  },
  dateDayActive: {
    color: "#FFF",
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFF",
    marginTop: 6,
  },
  periodGroup: {
    marginBottom: 20,
  },
  periodTitle: {
    fontSize: 14,
    fontFamily: typography.bold,
    color: "rgba(17,24,39,0.6)",
    marginBottom: 12,
    marginLeft: 4,
  },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  slotCard: {
    width: (SCREEN_WIDTH - 60) / 3,
    height: 45,
    backgroundColor: "#FFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  slotCardActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  slotText: {
    fontSize: 13,
    fontFamily: typography.bold,
    color: "#4B5563",
  },
  slotTextActive: {
    color: "#FFF",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16,185,129,0.08)",
    padding: 15,
    borderRadius: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.15)",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: typography.primary,
    color: "#065F46",
    lineHeight: 18,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === "ios" ? 35 : 25,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  pricing: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 10,
    fontFamily: typography.bold,
    color: "rgba(17,24,39,0.4)",
    letterSpacing: 1,
  },
  priceValue: {
    fontSize: 24,
    fontFamily: typography.bold,
    color: "#111827",
  },
  confirmBtn: {
    flex: 1.5,
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  btnGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontFamily: typography.bold,
  },
});
