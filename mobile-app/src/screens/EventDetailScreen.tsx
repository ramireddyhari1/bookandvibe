import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
  Animated,
  Share as NativeShare,
  Linking,
  Alert,
} from "react-native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { EventItem } from "../types";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, Heart, Calendar, MapPin, Clock, Info, ShieldCheck, Share2, User } from "lucide-react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type EventDetailScreenProps = {
  event: EventItem;
  onBack: () => void;
  onStartBooking: () => void;
};

export const EventDetailScreen = ({
  event,
  onBack,
  onStartBooking,
}: EventDetailScreenProps) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isFavorite, setIsFavorite] = useState(false);
  const hostDisplayName = event.hostName || event.partnerName || event.partner?.name || "Book & Vibe Partner";

  const handleShare = async () => {
    try {
      await NativeShare.share({
        message: `${event.title} at ${event.venue} on ${formatDate(event.date)}${event.time ? `, ${event.time}` : ""}`,
        title: event.title,
      });
    } catch (error) {
      Alert.alert("Share failed", "Unable to open the share menu right now.");
    }
  };

  const handleOpenMap = async () => {
    const query = encodeURIComponent(`${event.venue}, ${event.location}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert("Map unavailable", "Unable to open maps on this device.");
      return;
    }
    await Linking.openURL(url);
  };

  const formatDate = (value: string) => {
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return value;
    return dt.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      weekday: "short",
    });
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.mainContainer}>
      {/* Dynamic Sticky Header */}
      <Animated.View pointerEvents="none" style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <View style={styles.stickyHeaderBg} />
        <View style={styles.stickyContent}>
          <Text style={styles.stickyTitle} numberOfLines={1}>{event.title}</Text>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image Section */}
        <View style={styles.heroContainer}>
          <Animated.Image
            source={{ uri: event.image }}
            style={[styles.heroImage, { transform: [{ scale: imageScale }] }]}
          />
          <LinearGradient
            colors={['rgba(15, 10, 31, 0)', 'rgba(15, 10, 31, 0.46)', 'rgba(255, 255, 255, 0.92)']}
            style={styles.heroGradient}
          />

          {/* Top Controls */}
          <View style={styles.topControls}>
            <Pressable style={styles.iconBtn} onPress={onBack}>
              <ChevronLeft size={24} color="#FFF" />
            </Pressable>
            <View style={styles.topRightControls}>
              <Pressable style={styles.iconBtn} onPress={handleShare}>
                <Share2 size={20} color="#FFF" />
              </Pressable>
              <Pressable style={styles.iconBtn} onPress={() => setIsFavorite((prev) => !prev)}>
                <Heart size={20} color={isFavorite ? "#EF4444" : "#FFF"} fill={isFavorite ? "#EF4444" : "transparent"} />
              </Pressable>
            </View>
          </View>

          <View style={styles.heroInfo}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
            <Text style={styles.title}>{event.title}</Text>
          </View>
        </View>

        {/* Main Content Card */}
        <View style={styles.mainCard}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconBg}>
                <Calendar size={20} color={colors.purpleBrand} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{formatDate(event.date)}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIconBg}>
                <Clock size={20} color={colors.purpleBrand} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{event.time || "7:30 PM"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.venueContainer}>
            <View style={styles.infoIconBg}>
              <MapPin size={20} color={colors.purpleBrand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{event.venue}</Text>
              <Text style={styles.venueLoc}>{event.location}</Text>
            </View>
            <Pressable style={styles.mapBtn} onPress={handleOpenMap}>
              <Text style={styles.mapBtnText}>View Map</Text>
            </Pressable>
          </View>

          <View style={styles.hostContainer}>
            <View style={styles.infoIconBg}>
              <User size={20} color={colors.purpleBrand} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Hosted By</Text>
              <Text style={styles.hostValue}>{hostDisplayName}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Info size={18} color="rgba(17,24,39,0.55)" />
              <Text style={styles.sectionTitle}>About the Event</Text>
            </View>
            <Text style={styles.description}>
              {event.description || "Get ready for an immersive experience that blends world-class entertainment with premium hospitality. Join thousands of fans for a night to remember at the iconic " + event.venue + "."}
            </Text>
          </View>

            </View>
          </View>

          {event.terms && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ShieldCheck size={18} color={colors.purpleBrand} />
                <Text style={styles.sectionTitle}>Policies & Terms</Text>
              </View>
              <View style={styles.termsBox}>
                <Text style={styles.termsText}>{event.terms}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 56 }} />
      </Animated.ScrollView>

      {/* Floating Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.fromLabel}>TOTAL PRICE</Text>
          <Text style={styles.priceText}>₹{event.price}<Text style={styles.perTicket}> /person</Text></Text>
        </View>
        <Pressable onPress={onStartBooking}>
          <LinearGradient
            colors={['#7C3AED', '#C026D3']}
            style={styles.bookBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.bookBtnText}>BOOK NOW</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    justifyContent: 'center',
  },
  stickyHeaderBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  stickyContent: {
    paddingHorizontal: 70, // To center between back and action buttons
    alignItems: 'center',
  },
  stickyTitle: {
    color: '#111827',
    fontSize: 16,
    fontFamily: typography.bold,
  },
  scrollContent: {
    paddingTop: 0,
  },
  heroContainer: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.55,
    backgroundColor: "#000",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  topControls: {
    position: "absolute",
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 20,
  },
  topRightControls: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroInfo: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  categoryBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  categoryText: {
    color: "#D8B4FE",
    fontSize: 10,
    fontFamily: typography.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 34,
    color: "#FFF",
    fontFamily: typography.bold,
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  mainCard: {
    marginTop: -20,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 160,
    minHeight: 500,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.08)',
  },
  infoTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  infoIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    color: 'rgba(17,24,39,0.55)',
    fontFamily: typography.bold,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    color: '#111827',
    fontFamily: typography.secondary,
    marginTop: 2,
  },
  venueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.08)',
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.08)',
  },
  hostValue: {
    fontSize: 15,
    color: '#111827',
    fontFamily: typography.secondary,
    marginTop: 2,
  },
  venueLoc: {
    fontSize: 12,
    color: 'rgba(17,24,39,0.55)',
    fontFamily: typography.primary,
  },
  mapBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: 12,
  },
  mapBtnText: {
    color: colors.purpleBrand,
    fontSize: 12,
    fontFamily: typography.bold,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#111827',
    fontFamily: typography.bold,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: 'rgba(17,24,39,0.66)',
    fontFamily: typography.secondary,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    paddingLeft: 4,
  },
  ruleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.purpleBrand,
  },
  ruleText: {
    fontSize: 14,
    color: 'rgba(17,24,39,0.64)',
    fontFamily: typography.primary,
  },
  bottomBar: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 24 : 14,
    left: 20,
    right: 20,
    height: 72,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.1)",
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
  },
  priceContainer: {
    justifyContent: "center",
  },
  fromLabel: {
    fontSize: 10,
    color: "rgba(17,24,39,0.5)",
    fontFamily: typography.bold,
  },
  priceText: {
    fontSize: 22,
    color: "#111827",
    fontFamily: typography.bold,
  },
  perTicket: {
    fontSize: 12,
    color: 'rgba(17,24,39,0.5)',
    fontFamily: typography.primary,
  },
  bookBtn: {
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 16,
  },
  bookBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: typography.bold,
    letterSpacing: 0.5,
  },
  termsBox: {
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.1)',
  },
  termsText: {
    fontSize: 13,
    color: 'rgba(17,24,39,0.7)',
    fontFamily: typography.secondary,
    lineHeight: 20,
    fontWeight: '600',
  },
});
