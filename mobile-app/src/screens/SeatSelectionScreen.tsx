import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { useSocket } from "../hooks/useSocket";
import { EventItem } from "../types";
import { ChevronLeft, Info, Zap } from "lucide-react-native";

type SeatSelectionScreenProps = {
  event: EventItem;
  onBack: () => void;
  onConfirm: (selectedSeats: string[]) => void;
};

export const SeatSelectionScreen = ({ event, onBack, onConfirm }: SeatSelectionScreenProps) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>(["A3", "A4", "B2", "C5", "C6", "D1", "E8"]);
  const { connected, emit, socket } = useSocket(`event-${event.id}`);

  useEffect(() => {
    if (socket) {
      socket.on("seat-update", (data: { seatId: string; status: "occupied" | "available" }) => {
        if (data.status === "occupied") {
          setOccupiedSeats(prev => [...prev, data.seatId]);
        } else {
          setOccupiedSeats(prev => prev.filter(id => id !== data.seatId));
        }
      });
    }
  }, [socket]);

  const toggleSeat = (id: string) => {
    if (occupiedSeats.includes(id)) return;
    setSelectedSeats(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const rows = ["A", "B", "C", "D", "E"];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={24} color="#FFF" />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Select Your Seats</Text>
          <Text style={styles.headerSubtitle}>{event.title}</Text>
        </View>
      </View>

      <Card variant="glass" style={styles.selectionCard}>
        <View style={styles.stageContainer}>
          <LinearGradient
            colors={['rgba(124, 58, 237, 0.3)', 'rgba(124, 58, 237, 0.05)', 'transparent']}
            style={styles.stageGlow}
          />
          <View style={styles.stageLine} />
          <Text style={styles.stageText}>STAGE / SCREEN</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.grid}>
            {rows.map(row => (
              <View key={row} style={styles.row}>
                <Text style={styles.rowLabel}>{row}</Text>
                <View style={styles.seatsRow}>
                  {cols.map(col => {
                    const id = `${row}${col}`;
                    const isOccupied = occupiedSeats.includes(id);
                    const isSelected = selectedSeats.includes(id);

                    return (
                      <Pressable
                        key={id}
                        style={[
                          styles.seat,
                          isOccupied && styles.seatOccupied,
                          isSelected && styles.seatSelected
                        ]}
                        onPress={() => toggleSeat(id)}
                      >
                        {isSelected && (
                          <LinearGradient
                            colors={['#7C3AED', '#C026D3']}
                            style={StyleSheet.absoluteFill}
                          />
                        )}
                        <Text style={[
                          styles.seatLabel,
                          isSelected && styles.seatLabelSelected,
                          isOccupied && styles.seatLabelOccupied
                        ]}>{col}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={styles.dot} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <LinearGradient colors={['#7C3AED', '#C026D3']} style={styles.dot} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, styles.dotOccupied]} />
            <Text style={styles.legendText}>Taken</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Info size={14} color="rgba(255,255,255,0.4)" />
          <Text style={styles.infoText}>Tap on a seat to select. Max 10 seats per booking.</Text>
        </View>
      </Card>

      <View style={styles.bottomBar}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerSeats}>{selectedSeats.length || 'No'} Seat{selectedSeats.length !== 1 ? 's' : ''} Selected</Text>
          <Text style={styles.footerPrice}>₹{new Intl.NumberFormat("en-IN").format(selectedSeats.length * event.price)}</Text>
        </View>
        <Button
          title="Confirm Seats"
          onPress={() => onConfirm(selectedSeats)}
          variant="primary"
          style={styles.confirmBtn}
          disabled={selectedSeats.length === 0}
        />
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, connected && styles.statusDotActive]} />
        <Text style={styles.socketStatus}>
          {connected ? "LIVE UPDATES ACTIVE" : "SYNCING SEAT MAP..."}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFF',
    fontFamily: typography.bold,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: typography.primary,
  },
  selectionCard: {
    padding: 24,
    borderRadius: 32,
  },
  stageContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  stageGlow: {
    width: "100%",
    height: 60,
    position: "absolute",
    top: 0,
    opacity: 0.5,
  },
  stageLine: {
    width: "85%",
    height: 4,
    backgroundColor: colors.purpleBrand,
    borderRadius: 2,
    shadowColor: colors.purpleBrand,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  stageText: {
    color: colors.purpleBrand,
    fontSize: 10,
    fontFamily: typography.bold,
    marginTop: 12,
    letterSpacing: 3,
  },
  scrollContent: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  grid: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowLabel: {
    color: "rgba(255,255,255,0.2)",
    width: 20,
    fontSize: 12,
    fontFamily: typography.bold,
    textAlign: 'center',
  },
  seatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  seat: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  seatOccupied: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "transparent",
    opacity: 0.4
  },
  seatSelected: {
    borderColor: "rgba(192, 38, 211, 0.5)"
  },
  seatLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontFamily: typography.bold,
  },
  seatLabelSelected: {
    color: "#FFF"
  },
  seatLabelOccupied: {
    color: 'transparent',
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
    marginBottom: 16,
    paddingHorizontal: 10
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)"
  },
  dotOccupied: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "transparent",
    opacity: 0.4,
  },
  legendText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontFamily: typography.primary
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontFamily: typography.primary,
    fontStyle: 'italic',
  },
  bottomBar: {
    marginTop: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerInfo: {
    flex: 1,
  },
  footerSeats: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontFamily: typography.secondary
  },
  footerPrice: {
    color: "#FFF",
    fontSize: 32,
    fontFamily: typography.bold
  },
  confirmBtn: {
    flex: 1,
    height: 60,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 8
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.1)"
  },
  statusDotActive: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowRadius: 4,
    shadowOpacity: 1,
  },
  socketStatus: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 10,
    fontFamily: typography.bold,
    letterSpacing: 1,
  }
});
