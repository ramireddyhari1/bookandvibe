import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { TicketItem } from "../types";
import { LinearGradient } from "expo-linear-gradient";
import { Ticket as TicketIcon, QrCode, Calendar, MapPin, Sparkles, Compass, Trophy } from "lucide-react-native";
import LiveMatchScorer from "./LiveMatchScorer";

type TicketScreenProps = {
  tickets: TicketItem[];
  onGoToDiscover: () => void;
};

export const TicketScreen = ({ tickets, onGoToDiscover }: TicketScreenProps) => {
  const [scoringBookingId, setScoringBookingId] = React.useState<string | null>(null);
  const [scoringSportType, setScoringSportType] = React.useState<string>("Cricket");
  const formatCurrency = (value: number) => {
    return `₹${new Intl.NumberFormat("en-IN").format(value || 0)}`;
  };

  const formatDate = (value: string) => {
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return value;
    return dt.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      weekday: "short",
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>My Tickets</Text>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{tickets.length} Active</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Your upcoming bookings and QR entries.</Text>
      </View>

      {tickets.length === 0 ? (
        <View style={styles.emptyWrap}>
          <LinearGradient
            colors={['#F4EBFF', '#F8F5FF']}
            style={styles.emptyHero}
          >
            <View style={styles.emptyIconWrap}>
              <TicketIcon size={36} color="#6D28D9" strokeWidth={1.8} />
            </View>
            <Text style={styles.emptyTitle}>Your ticket wallet is empty</Text>
            <Text style={styles.emptyText}>Book an event and your digital pass will appear here instantly.</Text>
            <Button title="Explore Events" onPress={onGoToDiscover} variant="primary" style={styles.emptyBtn} />
          </LinearGradient>

          <View style={styles.emptyTipsRow}>
            <View style={styles.tipPill}>
              <Sparkles size={14} color={colors.purpleBrand} />
              <Text style={styles.tipText}>Fast check-in</Text>
            </View>
            <View style={styles.tipPill}>
              <Compass size={14} color={colors.purpleBrand} />
              <Text style={styles.tipText}>Nearby picks</Text>
            </View>
          </View>
        </View>
      ) : (
        tickets.map((ticket) => (
          <Card key={ticket.id} variant="solid" style={styles.ticketCard}>
            <View style={styles.ticketTop}>
              <View style={styles.eventInfo}>
                <Text style={styles.ticketTitle}>{ticket.eventTitle}</Text>
                <View style={styles.iconRow}>
                  <MapPin size={14} color="rgba(17,24,39,0.55)" />
                  <Text style={styles.ticketMeta}>{ticket.venue}</Text>
                </View>
                <View style={styles.iconRow}>
                  <Calendar size={14} color="rgba(17,24,39,0.55)" />
                  <Text style={styles.ticketMeta}>
                    {formatDate(ticket.date)} • {ticket.qty} Person{ticket.qty > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
              <LinearGradient
                colors={['#7C3AED', '#C026D3']}
                style={styles.priceTag}
              >
                <Text style={styles.priceText}>{formatCurrency(ticket.amount)}</Text>
              </LinearGradient>
            </View>

            <View style={styles.divider} />

            <View style={styles.ticketBottom}>
              <View style={styles.detailsRow}>
                <View>
                  <Text style={styles.label}>ZONE</Text>
                  <Text style={styles.value}>{ticket.seatZone}</Text>
                </View>
                <View>
                  <Text style={styles.label}>METHOD</Text>
                  <Text style={styles.value}>{ticket.paymentMethod}</Text>
                </View>
              </View>

              </View>
            </View>

            {ticket.seatZone === 'Facility' && (
              <View style={styles.scorerActionRow}>
                <Button 
                  title="Score Live Match" 
                  icon={Trophy}
                  variant="primary" 
                  onPress={() => {
                    setScoringBookingId(ticket.id);
                    // We might need to store the sport type in the ticket or fetch it
                    setScoringSportType("Cricket"); 
                  }}
                  style={styles.scoreBtn}
                />
              </View>
            )}

            {/* Cutout circles for ticket look */}
            <View style={[styles.cutout, { left: -10 }]} />
            <View style={[styles.cutout, { right: -10 }]} />
          </Card>
        ))
      )}
      <View style={{ height: 170 }} />

      {scoringBookingId && (
        <LiveMatchScorer
          bookingId={scoringBookingId}
          sportType={scoringSportType}
          onClose={() => setScoringBookingId(null)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scorerActionRow: {
    padding: 16,
    paddingTop: 0,
    marginTop: -8,
  },
  scoreBtn: {
    backgroundColor: '#10B981',
    borderRadius: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    color: '#111827',
    fontFamily: typography.bold,
    letterSpacing: -1,
  },
  countPill: {
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.24)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  countPillText: {
    color: '#6D28D9',
    fontSize: 11,
    fontFamily: typography.bold,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(17,24,39,0.58)',
    fontFamily: typography.secondary,
    marginTop: 4,
  },
  emptyWrap: {
    marginBottom: 16,
  },
  emptyHero: {
    alignItems: 'center',
    paddingVertical: 34,
    paddingHorizontal: 22,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.18)',
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
    marginBottom: 14,
  },
  emptyTitle: {
    color: '#1F2937',
    fontSize: 24,
    fontFamily: typography.bold,
    textAlign: 'center',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  emptyText: {
    color: 'rgba(17,24,39,0.62)',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: typography.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyBtn: {
    minWidth: 170,
  },
  emptyTipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  tipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tipText: {
    color: 'rgba(17,24,39,0.7)',
    fontSize: 12,
    fontFamily: typography.bold,
  },
  ticketCard: {
    padding: 0,
    marginBottom: 20,
    overflow: 'visible',
    borderColor: 'rgba(17,24,39,0.08)',
  },
  ticketTop: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventInfo: {
    flex: 1,
    marginRight: 12,
  },
  ticketTitle: {
    color: '#111827',
    fontSize: 20,
    fontFamily: typography.bold,
    marginBottom: 8,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  ticketMeta: {
    color: 'rgba(17,24,39,0.62)',
    fontSize: 14,
    fontFamily: typography.primary,
  },
  priceTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: typography.bold,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(17,24,39,0.08)',
    marginHorizontal: 24,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  ticketBottom: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsRow: {
    gap: 16,
  },
  label: {
    color: 'rgba(17,24,39,0.5)',
    fontSize: 10,
    fontFamily: typography.bold,
    letterSpacing: 1,
  },
  value: {
    color: '#111827',
    fontSize: 16,
    fontFamily: typography.secondary,
  },
  qrSection: {
    alignItems: 'center',
    gap: 8,
  },
  qrPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.12)',
  },
  bookingId: {
    color: 'rgba(17,24,39,0.45)',
    fontSize: 10,
    fontFamily: typography.primary,
  },
  cutout: {
    position: 'absolute',
    top: '55%', // Approximately where the divider is
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF', // Match background
    zIndex: 10,
  }
});
