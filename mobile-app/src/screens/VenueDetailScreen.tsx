import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  MapPin,
  Star,
  Zap,
  Wifi,
  Coffee,
  Car,
  Lightbulb,
  Droplet,
  Users,
} from "lucide-react-native";
import { FacilityItem } from "../types";
import { typography } from "../theme/typography";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type VenueDetailScreenProps = {
  facility: FacilityItem;
  onBack: () => void;
  onBook: () => void;
};

const AMENITIES_ICONS: { [key: string]: any } = {
  Parking: Car,
  WiFi: Wifi,
  Cafeteria: Coffee,
  Floodlights: Lightbulb,
  Water: Droplet,
  Coaching: Users,
  "Power Backup": Zap,
};

export const VenueDetailScreen = ({
  facility,
  onBack,
  onBook,
}: VenueDetailScreenProps) => {
  const defaultAmenities = ["Parking", "WiFi", "Water", "Floodlights", "Power Backup"];
  const amenities = facility.amenities && facility.amenities.length > 0
    ? facility.amenities
    : defaultAmenities;

  const defaultDescription =
    "Experience world-class sporting facilities at " +
    facility.name +
    ". Located in the heart of " +
    facility.location +
    ", we offer premium " +
    facility.type +
    " turfs and environments designed for professionals and enthusiasts alike. Our venue features high-quality surfaces and professional lighting for night matches.";

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: facility.image }} style={styles.heroImage} />
          <LinearGradient
            colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0)", "rgba(248, 250, 252, 1)"]}
            style={styles.heroOverlay}
          />
          <Pressable onPress={onBack} style={styles.backBtn}>
            <ChevronLeft size={24} color="#111827" />
          </Pressable>
        </View>

        {/* Info Content */}
        <View style={styles.contentWrap}>
          <View style={styles.mainInfo}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{facility.type.toUpperCase()}</Text>
            </View>
            <Text style={styles.title}>{facility.name}</Text>
            <View style={styles.locationRow}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.locationText}>{facility.location}</Text>
            </View>
            <View style={styles.ratingBox}>
              <Star size={16} color="#FFB800" fill="#FFB800" />
              <Text style={styles.ratingValue}>{facility.rating}</Text>
              <Text style={styles.reviewCount}>(120+ Reviews)</Text>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this venue</Text>
            <Text style={styles.description}>
              {facility.description || defaultDescription}
            </Text>
          </View>

              })}
            </View>
          </View>

          {/* Venue Policies Section */}
          {facility.terms && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Venue Policies</Text>
              <View style={styles.termsBox}>
                <Text style={styles.termsText}>{facility.terms}</Text>
              </View>
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Footer sticky bar */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>RATES FROM</Text>
          <Text style={styles.priceVal}>
            ₹{facility.pricePerHour}
            <Text style={styles.perHr}>/hr</Text>
          </Text>
        </View>
        <Pressable onPress={onBook} style={styles.bookBtn}>
          <LinearGradient
            colors={["#10B981", "#059669"]}
            style={styles.bookGradient}
          >
            <Text style={styles.bookBtnText}>CONTINUE TO BOOK</Text>
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
  heroContainer: {
    height: SCREEN_WIDTH * 0.8,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  contentWrap: {
    marginTop: -40,
    paddingHorizontal: 25,
  },
  mainInfo: {
    marginBottom: 30,
  },
  typeBadge: {
    backgroundColor: "rgba(16,185,129,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  typeText: {
    color: "#059669",
    fontSize: 11,
    fontFamily: typography.bold,
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: typography.bold,
    color: "#111827",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    fontFamily: typography.primary,
    color: "#6B7280",
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingValue: {
    fontSize: 15,
    fontFamily: typography.bold,
    color: "#111827",
  },
  reviewCount: {
    fontSize: 13,
    fontFamily: typography.primary,
    color: "#9CA3AF",
  },
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: typography.bold,
    color: "#111827",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    fontFamily: typography.primary,
    color: "#4B5563",
    lineHeight: 24,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -10,
  },
  amenityItem: {
    width: "33.33%",
    padding: 10,
    alignItems: "center",
  },
  amenityIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  amenityLabel: {
    fontSize: 12,
    fontFamily: typography.secondary,
    color: "#4B5563",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    paddingHorizontal: 25,
    paddingVertical: 20,
    paddingBottom: Platform.OS === "ios" ? 35 : 25,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 10,
    fontFamily: typography.bold,
    color: "rgba(17,24,39,0.4)",
    letterSpacing: 1,
  },
  priceVal: {
    fontSize: 22,
    fontFamily: typography.bold,
    color: "#111827",
  },
  perHr: {
    fontSize: 14,
    fontFamily: typography.primary,
    color: "#9CA3AF",
  },
  bookBtn: {
    flex: 2,
    height: 58,
    borderRadius: 18,
    overflow: "hidden",
  },
  bookGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bookBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontFamily: typography.bold,
    letterSpacing: 0.5,
  },
  termsBox: {
    backgroundColor: "rgba(16,185,129,0.05)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.1)",
  },
  termsText: {
    fontSize: 14,
    color: "#374151",
    fontFamily: typography.primary,
    lineHeight: 22,
  },
});
