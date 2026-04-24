import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TextInput,
  Pressable,
  Dimensions,
  Animated,
  Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { apiGet } from "../lib/api";
import { FacilityItem } from "../types";
import { Search, MapPin, Bell, Trophy, Zap, Star, ChevronLeft, ChevronDown } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SPORTS = [
  { id: "badminton", name: "Badminton", icon: "🏸", color: "#A78BFA" },
  { id: "football", name: "Football", icon: "⚽", color: "#34D399" },
  { id: "cricket", name: "Cricket", icon: "🏏", color: "#FBBF24" },
  { id: "swimming", name: "Swimming", icon: "🏊", color: "#60A5FA" },
  { id: "tennis", name: "Tennis", icon: "🎾", color: "#FB923C" },
  { id: "basketball", name: "Basketball", icon: "🏀", color: "#F87171" },
];

const PROMO_BANNERS = [
  {
    id: "promo-1",
    bgColor: "#F97316", // Orange theme
    title: "DON'T JUST PLAY!\nDOMINATE!",
    subtitle: "Best Gear | Fast Delivery | Wide Variety",
    btnText: "Shop Now - Min 40% Off",
    btnColor: "#1D4ED8", // Blue button
    brandText: "Flipkart",
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600"
  },
  {
    id: "promo-2",
    bgColor: "#1E1B4B", // Dark Blue theme
    title: "PLAY FEARLESS!\nGET PRO GEAR",
    subtitle: "Protect Your Game Daily",
    btnText: "Explore Collection",
    btnColor: "#0F172A",
    brandText: "PLAYO",
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=600"
  }
];

type GameHubScreenProps = {
  initialSport?: string;
  onBack?: () => void;
  onSelectFacility?: (facility: FacilityItem) => void;
  selectedCity: string;
  onOpenLocation: () => void;
};

export const GameHubScreen = ({ initialSport, onBack, onSelectFacility, selectedCity, onOpenLocation }: GameHubScreenProps) => {
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState(initialSport || "all");

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLoading(true);
    apiGet<FacilityItem[]>('/gamehub/facilities')
      .then(res => setFacilities(res.length ? res : FALLBACK_FACILITIES))
      .catch(() => setFacilities(FALLBACK_FACILITIES))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.purpleBrand} />
      </View>
    );
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const filteredFacilities = facilities.filter((f) => {
    const matchLocation = f.location.toLowerCase().includes(selectedCity.toLowerCase());
    const matchSport =
      selectedSport === "all" ||
      f.type.toLowerCase().includes(selectedSport.toLowerCase());
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      f.name.toLowerCase().includes(q) ||
      f.location.toLowerCase().includes(q) ||
      f.type.toLowerCase().includes(q);
    return matchLocation && matchSport && matchSearch;
  });

  return (
    <View style={styles.mainContainer}>
      <View style={styles.bgOrbTop} />
      <View style={styles.bgOrbRight} />

      {/* Sticky Header Background (Fades in on scroll) */}
      <Animated.View pointerEvents="none" style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.7)']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerWrap}>
          <LinearGradient
            colors={['rgba(16,185,129,0.12)', 'rgba(16,185,129,0.04)']}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <View style={styles.locationRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  {onBack && (
                    <Pressable onPress={onBack} style={styles.backBtnCircle}>
                      <ChevronLeft size={24} color="#111827" />
                    </Pressable>
                  )}
                  <Pressable style={styles.locationInfo} onPress={onOpenLocation}>
                    <Text style={styles.locationLabel}>CURRENT LOCATION</Text>
                    <View style={styles.cityRow}>
                      <MapPin size={16} color="#10B981" />
                      <Text style={styles.locationText}>{selectedCity}</Text>
                      <ChevronDown size={14} color="rgba(17,24,39,0.4)" />
                    </View>
                  </Pressable>
                </View>
                <View style={styles.headerIcons}>
                  <View style={styles.iconCircle}>
                    <Bell size={20} color="#111827" />
                  </View>
                  <View style={styles.profileIcon}>
                    <Text style={styles.profileText}>H</Text>
                  </View>
                </View>
              </View>


              <View style={styles.searchContainer}>
                <Search size={20} color="rgba(17,24,39,0.45)" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search venues, sports or matches..."
                  placeholderTextColor="rgba(17,24,39,0.4)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <Zap size={20} color="#10B981" />
              </View>
            </View>
          </LinearGradient>
        </View>

        {selectedSport === "all" && (
          <View style={styles.promoBannerWrap}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
            >
              {PROMO_BANNERS.map((banner) => (
                <View key={banner.id} style={[styles.promoBannerCard, { backgroundColor: banner.bgColor }]}>
                   <Image source={{ uri: banner.image }} style={[StyleSheet.absoluteFillObject, { opacity: 0.3 }]} blurRadius={2} />
                   <View style={styles.promoContent}>
                     <Text style={styles.promoTitle}>{banner.title}</Text>
                     <Text style={styles.promoSubtitle}>{banner.subtitle}</Text>
                     
                     <View style={[styles.promoBtn, { backgroundColor: banner.btnColor }]}>
                       <Text style={styles.promoBtnText}>{banner.btnText}</Text>
                     </View>

                     <View style={styles.brandBadge}>
                       <Text style={styles.brandBadgeText}>{banner.brandText}</Text>
                     </View>
                   </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {selectedSport === "all" && (
          <View style={styles.hostBanner}>
            <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.hostGradient}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
                <View style={styles.hostContent}>
                    <Text style={styles.hostTitle}>Can't find a game?</Text>
                    <Text style={styles.hostSubtitle}>Host a match and invite players nearby!</Text>
                    <Pressable style={styles.hostBtn}>
                      <Text style={styles.hostBtnText}>HOST A MATCH</Text>
                    </Pressable>
                </View>
                <Trophy size={60} color="rgba(255,255,255,0.15)" strokeWidth={1} style={styles.hostIcon} />
            </LinearGradient>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedSport === "all" ? "Venues Near You" : `Best ${selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)} Venues`}
          </Text>
          <Pressable><Text style={styles.seeAll}>See All</Text></Pressable>
        </View>

        {filteredFacilities.map((f) => (
          <VenueCard key={f.id} facility={f} onSelect={onSelectFacility} />
        ))}

        {!filteredFacilities.length && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No venues found</Text>
            <Text style={styles.emptySubtitle}>Try a different sport or search keyword.</Text>
          </View>
        )}

        <View style={{ height: 160 }} />
      </Animated.ScrollView>
    </View>
  );
};

const VenueCard = ({ facility, onSelect }: { facility: FacilityItem, onSelect?: (f: FacilityItem) => void }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Pressable 
      onPressIn={handlePressIn} 
      onPressOut={handlePressOut}
      onPress={() => onSelect?.(facility)}
    >
      <Animated.View style={[styles.venueCard, { transform: [{ scale: scaleAnim }] }]}>
        <Image source={{ uri: facility.image }} style={styles.venueImage} />
        <LinearGradient
          colors={['transparent', 'rgba(15, 10, 31, 0.9)']}
          style={styles.imageOverlay}
        />
        <View style={styles.venueInfo}>
          <View style={styles.venueHeader}>
            <Text style={styles.venueName} numberOfLines={1}>{facility.name}</Text>
            <View style={styles.ratingBadge}>
              <Star size={12} color="#FFB800" fill="#FFB800" />
              <Text style={styles.ratingText}>{facility.rating}</Text>
            </View>
          </View>

          <View style={styles.venueSubHeader}>
            <MapPin size={12} color="rgba(255,255,255,0.5)" />
            <Text style={styles.venueType}>{facility.type} • {facility.location}</Text>
          </View>

          <View style={styles.tagRow}>
            <View style={styles.tag}><Text style={styles.tagText}>Instant Booking</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>Coaching</Text></View>
          </View>

          <View style={styles.venueFooter}>
            <View>
              <Text style={styles.perHrLabel}>Starts at</Text>
              <Text style={styles.venuePrice}>₹{facility.pricePerHour}<Text style={styles.perHr}>/hr</Text></Text>
            </View>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.bookBtnSmall}
            >
              <Text style={styles.bookBtnText}>BOOK NOW</Text>
            </LinearGradient>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const FALLBACK_FACILITIES: FacilityItem[] = [
  {
    id: "f-1",
    name: "Neon Turf Arena",
    type: "Football",
    location: "Gachibowli, Hyd",
    rating: 4.8,
    pricePerHour: 1400,
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1200",
    description: "The most vibrant 5-a-side football turf in Hyderabad. Featuring FIFA-quality grass and a stunning neon atmosphere for late-night matches.",
    amenities: ["Floodlights", "Parking", "Water", "Locker Room", "Power Backup"]
  },
  {
    id: "f-2",
    name: "Cricket Royale Nets",
    type: "Cricket",
    location: "Benz Circle, VJA",
    rating: 4.7,
    pricePerHour: 600,
    image: "https://images.unsplash.com/photo-1540324155970-14e422f01f2f?q=80&w=1200",
    description: "Premium indoor and outdoor cricket nets with professional bowling machines. Perfect for intensive practice sessions and coaching.",
    amenities: ["Coaching", "Water", "Parking", "Power Backup"]
  },
  {
    id: "f-3",
    name: "Sky Smash Badminton",
    type: "Badminton",
    location: "Indiranagar, BLR",
    rating: 4.9,
    pricePerHour: 450,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200",
    description: "Olympic-standard synthetic courts with specialized joint-protection mats. High-intensity LED lighting and climate-controlled environment.",
    amenities: ["WiFi", "Water", "Cafeteria", "Locker Room"]
  },
  {
    id: "f-4",
    name: "Grand Slam Cricket Nets",
    type: "Cricket",
    location: "Ameerpet, Hyderabad",
    rating: 4.6,
    pricePerHour: 450,
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200",
    description: "A state-of-the-art training center for aspiring cricketers. Offers both clay and concrete pitches for varied practice.",
    amenities: ["Water", "Parking", "Power Backup"]
  },
  {
    id: "f-5",
    name: "Power Play Turf",
    type: "Football",
    location: "Madhapur, Hyderabad",
    rating: 4.8,
    pricePerHour: 1500,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200",
    description: "Premium 7v7 football facility with high-grade monofilament grass. Features a viewing gallery and dugout for teams.",
    amenities: ["Floodlights", "Parking", "Cafeteria", "Locker Room"]
  },
];

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: "#FFFFFF",
    alignItems: 'stretch',
  },
  bgOrbTop: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  bgOrbRight: {
    position: 'absolute',
    top: 70,
    right: -70,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 80,
    zIndex: 10,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 18 : 16,
    paddingBottom: 16,
  },
  headerWrap: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  headerGradient: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  locationInfo: {
    justifyContent: 'center',
  },
  locationLabel: { 
    color: 'rgba(17,24,39,0.5)', 
    fontSize: 10, 
    fontFamily: typography.bold, 
    letterSpacing: 1,
    marginBottom: 2,
  },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { color: '#111827', fontSize: 18, fontFamily: typography.bold },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.12)',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  profileText: {
    color: "#FFF",
    fontFamily: typography.bold,
    fontSize: 16
  },
  backBtnCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginTop: 14,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.12)",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    fontFamily: typography.primary,
    marginLeft: 10,
  },
  scrollContent: {
    width: '100%',
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  promoBannerWrap: {
    marginTop: 8,
    marginBottom: 24,
  },
  promoBannerCard: {
    width: SCREEN_WIDTH * 0.85,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
    justifyContent: 'center',
  },
  promoContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  promoTitle: {
    color: '#FFF',
    fontSize: 22,
    fontFamily: typography.bold,
    lineHeight: 26,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  promoSubtitle: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: typography.primary,
    marginTop: 4,
    marginBottom: 12,
    opacity: 0.9,
  },
  promoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  promoBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: typography.bold,
  },
  brandBadge: {
    position: 'absolute',
    bottom: -5,
    right: 0,
    backgroundColor: '#FBBF24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  brandBadgeText: {
    color: '#111827',
    fontSize: 10,
    fontFamily: typography.bold,
  },
  sectionTitle: {
    fontSize: 22,
    color: "#111827",
    fontFamily: typography.bold,
    letterSpacing: -0.5,
  },
  seeAll: {
    fontSize: 14,
    color: '#10B981',
    fontFamily: typography.bold,
  },
  hostBanner: {
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 28,
    overflow: "hidden",
  },
  hostGradient: {
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  hostContent: {
    flex: 1,
    zIndex: 2,
  },
  hostTitle: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: typography.bold,
  },
  hostSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
    fontFamily: typography.primary,
  },
  hostBtn: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  hostBtnText: {
    color: '#059669',
    fontSize: 12,
    fontFamily: typography.bold,
  },
  hostIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  venueCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 32,
    alignSelf: 'stretch',
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.08)",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  venueImage: {
    width: "100%",
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, height: 200,
  },
  venueInfo: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  venueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  venueName: {
    fontSize: 20,
    color: "#111827",
    flex: 1,
    marginRight: 10,
    fontFamily: typography.bold,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: "rgba(255, 184, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    color: "#FFB800",
    fontFamily: typography.bold,
  },
  venueSubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  venueType: {
    fontSize: 14,
    color: "rgba(17,24,39,0.6)",
    fontFamily: typography.primary,
  },
  tagRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
  },
  tag: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  tagText: {
    fontSize: 11,
    color: "#059669",
    fontFamily: typography.bold,
  },
  venueFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(17,24,39,0.08)",
  },
  perHrLabel: {
    fontSize: 10,
    color: "rgba(17,24,39,0.5)",
    fontFamily: typography.bold,
    textTransform: 'uppercase',
  },
  venuePrice: {
    fontSize: 22,
    color: "#111827",
    fontFamily: typography.bold,
  },
  perHr: {
    fontSize: 12,
    color: "rgba(17,24,39,0.5)",
    fontFamily: typography.primary,
  },
  bookBtnSmall: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  bookBtnText: {
    color: "#FFF",
    fontSize: 13,
    fontFamily: typography.bold,
  },
  emptyState: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: typography.bold,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontFamily: typography.primary,
    marginTop: 6,
  },
});
