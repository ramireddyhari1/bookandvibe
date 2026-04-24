import React from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Image, Platform } from "react-native";
import { EventItem } from "../types";
import { typography } from "../theme/typography";
import { ArrowLeft, MapPin } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

type AllEventsScreenProps = {
  events: EventItem[];
  onBack: () => void;
  onSelectEvent: (event: EventItem) => void;
};

export const AllEventsScreen = ({ events, onBack, onSelectEvent }: AllEventsScreenProps) => {
  const renderEventCard = ({ item }: { item: EventItem }) => {
    return (
      <Pressable onPress={() => onSelectEvent(item)} style={styles.cardContainer}>
        <View style={styles.mainCard}>
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          <LinearGradient
            colors={['rgba(15, 10, 31, 0)', 'rgba(15, 10, 31, 0.92)']}
            style={styles.cardOverlay}
          />
          
          <View style={styles.topSection}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.textContent}>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.metaRow}>
                <MapPin size={12} color="rgba(255,255,255,0.6)" />
                <Text style={styles.metaText} numberOfLines={1}>{item.venue}</Text>
              </View>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>FROM</Text>
              <Text style={styles.priceValue}>₹{item.price}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={20} color="#111827" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>All Events</Text>
          <Text style={styles.subtitle}>{events.length} events available</Text>
        </View>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={renderEventCard}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 24 : 36,
    paddingBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#111827",
    fontSize: 28,
    fontFamily: typography.bold,
    letterSpacing: -0.7,
  },
  subtitle: {
    color: "rgba(17,24,39,0.6)",
    fontSize: 14,
    fontFamily: typography.primary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 8,
    gap: 16,
  },
  cardContainer: {
    height: 300,
    borderRadius: 24,
    overflow: "hidden",
    marginVertical: 4,
  },
  mainCard: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.08)",
    backgroundColor: "#0F172A",
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topSection: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    zIndex: 3,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  categoryBadgeText: {
    color: "#111827",
    fontSize: 11,
    fontFamily: typography.bold,
    letterSpacing: 0.5,
  },
  bottomSection: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    zIndex: 3,
  },
  textContent: {
    flex: 1,
    marginRight: 16,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: typography.bold,
    lineHeight: 32,
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    flex: 1,
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontFamily: typography.primary,
  },
  priceBox: {
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 11,
    paddingVertical: 9,
    alignItems: "center",
    minWidth: 60,
  },
  priceLabel: {
    color: "rgba(17,24,39,0.55)",
    fontSize: 10,
    fontFamily: typography.bold,
    letterSpacing: 0.3,
  },
  priceValue: {
    color: "#6D28D9",
    fontSize: 18,
    fontFamily: typography.bold,
    marginTop: 2,
  },
});
