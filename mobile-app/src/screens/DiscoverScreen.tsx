import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  FlatList,
  Dimensions,
  Platform,
  Modal,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import * as ImagePicker from 'expo-image-picker';
import { EventItem, FacilityItem } from "../types";
import { Bell, MapPin, Search, User, Cast, Play, Bookmark, Tag, Sliders, ChevronDown, Zap, Gamepad2, Target, Cpu, Dribbble, Trophy, MessageSquareText, CalendarDays, Clock, Award } from "lucide-react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useSocket } from "../context/SocketContext";
import LiveMatchCard from "../components/LiveMatchCard";
import LeaderboardModal from "../components/LeaderboardModal";
import { apiGet } from "../lib/api";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type DiscoverScreenProps = {
  events: EventItem[];
  facilities: FacilityItem[];
  query: string;
  setQuery: (query: string) => void;
  onSelectEvent: (event: EventItem) => void;
  onOpenProfile: () => void;
  onOpenAllEvents: () => void;
  onOpenGameHub: (sportId?: string) => void;
  onSelectFacility?: (facility: FacilityItem) => void;
  onTabChange?: (tab: "events" | "gamehub") => void;
  initialTab?: "events" | "gamehub";
  selectedCity: string;
  onCityChange: (city: string) => void;
  onOpenLocation: () => void;
  onOpenNotifications?: () => void;
  hasNotifications?: boolean;
};


const CricketIcon = ({ size = 28, ...props }: any) => (
  <Image source={require('../../assets/gamehub-icons/cricket.png')} style={{ width: size, height: size }} resizeMode="contain" />
);

const FootballIcon = ({ size = 28, ...props }: any) => (
  <Image source={require('../../assets/gamehub-icons/football.png')} style={{ width: size, height: size }} resizeMode="contain" />
);

const GamingIcon = ({ size = 28, color = "#FFFFFF", strokeWidth = 2, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Path d="M22 10v4c0 3.3-2.7 6-6 6H8c-3.3 0-6-2.7-6-6v-4c0-3.3 2.7-6 6-6h8c3.3 0 6 2.7 6 6z" />
    <Path d="M6 12h4" />
    <Path d="M8 10v4" />
    <Circle cx="15" cy="11" r="1" fill={color} stroke="none" />
    <Circle cx="18" cy="13" r="1" fill={color} stroke="none" />
  </Svg>
);

const BowlingIcon = ({ size = 28, color = "#FFFFFF", strokeWidth = 2, ...props }: any) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <Path d="M8 10a2 2 0 100-4 2 2 0 000 4z" />
    <Path d="M6 10c-1 3-2 5-2 9a2 2 0 002 2h4a2 2 0 002-2c0-4-1-6-2-9" />
    <Path d="M5 14h6" />
    <Path d="M5.5 17h5" />
    <Circle cx="17" cy="15" r="4" />
    <Circle cx="16" cy="14" r="0.5" fill={color} stroke="none" />
    <Circle cx="18" cy="14" r="0.5" fill={color} stroke="none" />
    <Circle cx="17" cy="16" r="0.5" fill={color} stroke="none" />
  </Svg>
);

const BadmintonIcon = ({ size = 28, ...props }: any) => (
  <Image source={require('../../assets/gamehub-icons/badminton.png')} style={{ width: size, height: size }} resizeMode="contain" />
);

const FACILITY_CATEGORIES = [
  { id: 'cricket', title: 'Cricket', Icon: CricketIcon, color: '#FF7A00', gradient: ['rgba(255, 122, 0, 0.15)', 'rgba(255, 122, 0, 0.02)'] },
  { id: 'badminton', title: 'Badminton', Icon: BadmintonIcon, color: '#FF007F', gradient: ['rgba(255, 0, 127, 0.15)', 'rgba(255, 0, 127, 0.02)'] },
  { id: 'football', title: 'Football', Icon: FootballIcon, color: '#4ADE80', gradient: ['rgba(74, 222, 128, 0.15)', 'rgba(74, 222, 128, 0.02)'] },
  { id: 'more', title: 'See All', Icon: Sliders, color: '#00A8FF', gradient: ['rgba(0, 168, 255, 0.15)', 'rgba(0, 168, 255, 0.02)'] },
];

type PremiumButtonProps = {
  title: string;
  type: "purple" | "orange";
  isActive: boolean;
  onPress: () => void;
};

const FlareStar = ({ size = 28, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Path d="M20 2L21.5 20L20 38L18.5 20L20 2Z" fill={color} />
    <Path d="M2 20L20 18.5L38 20L20 21.5L2 20Z" fill={color} />
  </Svg>
);

const PremiumButton = ({
  title,
  type,
  isActive,
  onPress,
  shimmerAnim,
  pulseAnim
}: PremiumButtonProps & { shimmerAnim: Animated.Value; pulseAnim: Animated.Value }) => {
  const borderGradient =
    type === "purple"
      ? (["#00A8FF", "#8A2BE2", "#FF007F"] as const)
      : (["transparent", "transparent"] as const);

  const innerGradient =
    type === "purple"
      ? (["#060410", "#000000"] as const)
      : (["#FFFFFF", "#FFFFFF"] as const);

  const displayTitle = type === "purple" ? "Events" : "GameHub";

  const translateX1 = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const translateX2 = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [200, -200],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.premiumPressable,
        {
          transform: [{ scale: isActive ? 1.02 : 0.98 }],
          opacity: 1
        }
      ]}
    >
      <LinearGradient
        colors={borderGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.outerGlow,
          type === "purple" ? styles.outerGlowPurple : styles.outerGlowGreen,
          {
            shadowRadius: isActive ? 24 : 0,
            elevation: isActive ? 12 : 0,
            borderWidth: type === "orange" ? 1 : 0,
            borderColor: type === "orange" ? "rgba(16, 185, 129, 0.4)" : "transparent"
          }
        ]}
      >
        <Animated.View style={[
          styles.innerGlass,
          type === "purple" ? styles.innerGlassPurple : styles.innerGlassGreen,
          {
            borderColor: isActive ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
            borderWidth: 1,
            opacity: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.85, 1],
            })
          },
          { overflow: 'hidden' }
        ]}>
          <LinearGradient
            colors={innerGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />

          {isActive && (
            <>
              {/* Primary Flowing Layer */}
              <Animated.View style={[
                StyleSheet.absoluteFill,
                { transform: [{ translateX: translateX1 }], opacity: 0.12 }
              ]}>
                <LinearGradient
                  colors={["transparent", "rgba(255,255,255,0.4)", "transparent"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
              {/* Secondary Parallax Layer */}
              <Animated.View style={[
                StyleSheet.absoluteFill,
                { transform: [{ translateX: translateX2 }], opacity: 0.08 }
              ]}>
                <LinearGradient
                  colors={["transparent", "rgba(255,255,255,0.2)", "transparent"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </>
          )}

          <View style={styles.buttonTextWrap}>
            <View style={styles.iconContainer}>
              <FlareStar size={27} color={type === "purple" ? "#FFFFFF" : "#059669"} />
            </View>
            <Text
              style={[
                styles.buttonTitle,
                {
                  fontSize: 15,
                  fontWeight: '800',
                  marginLeft: 6,
                  color: type === "purple" ? "#FFFFFF" : "#065F46",
                },
                type === "orange" && { textTransform: 'uppercase', letterSpacing: 0.5 }
              ]}
              numberOfLines={1}
            >
              {displayTitle}
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const GridEventCard = ({ item, onSelectEvent }: { item: EventItem; onSelectEvent: (item: EventItem) => void }) => {
  // Generate mock offer for visual demo
  const offerText = "Buy 2, Get 1 Free on sel...";
  return (
    <Pressable onPress={() => onSelectEvent(item)} style={styles.gridCard}>
      <View style={styles.gridImageWrapper}>
        <Image source={{ uri: item.image }} style={styles.gridImage} />
        <View style={styles.bookmarkBadge}>
          <Bookmark size={18} color="#FFF" />
        </View>
      </View>
      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.gridMeta} numberOfLines={1}>
          {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, 12:00 AM onwards
        </Text>
        <Text style={styles.gridMetaLocation} numberOfLines={1}>{item.venue}</Text>
        <View style={styles.offerRow}>
          <Tag size={12} color="#4ADE80" />
          <Text style={styles.offerText}>{offerText}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const PROMO_BANNERS = [
  {
    id: "promo-1",
    bgGradient: ["#FF7A00", "#FFB800", "#FACC15"], // Dynamic orange to yellow
    textColor: "#FFFFFF",
    title: "DON'T JUST PLAY!",
    subTitle: "DOMINATE!",
    meta: "Best Gear | Fast Delivery | Wide Variety",
    ctaText: "Shop Now - Min 40% Off",
    brandLogo: "F", // Placeholder for brand
    bgImg: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800",
  },
  {
    id: "promo-2",
    bgGradient: ["#1E1B4B", "#312E81", "#4F46E5"], // Dark energetic
    textColor: "#FFFFFF",
    title: "PLAY FEARLESS!",
    subTitle: "ROCKET GEAR",
    meta: "Protect Your Game Daily",
    ctaText: "Explore Collection",
    brandLogo: "P",
    bgImg: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=800",
  }
];

export const DiscoverScreen = ({
  events,
  facilities,
  query,
  setQuery,
  onSelectEvent,
  onOpenProfile,
  onOpenAllEvents,
  onOpenGameHub,
  onSelectFacility,
  onTabChange,
  initialTab,
  selectedCity,
  onCityChange,
  onOpenLocation,
  onOpenNotifications,
  hasNotifications,
}: DiscoverScreenProps) => {
  const [activeTab, setActiveTab] = React.useState<"events" | "gamehub">(initialTab || "events");
  const tabAnim = React.useRef(new Animated.Value(initialTab === "gamehub" ? 1 : 0)).current;
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  const [profileImage, setProfileImage] = React.useState<string | null>(null);
  const [selectedSportCategory, setSelectedSportCategory] = React.useState<string | null>(null);
  const [liveMatches, setLiveMatches] = React.useState<any[]>([]);
  const [matchHistory, setMatchHistory] = React.useState<any[]>([]);
  const [isLeaderboardVisible, setIsLeaderboardVisible] = React.useState(false);
  const { socket } = useSocket();

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const forYouListRef = React.useRef<FlatList>(null);
  const scrollIndex = React.useRef(0);

  const filteredFacilities = useMemo(() => {
    let list = facilities.filter(f => 
      f.location.toLowerCase().includes(selectedCity.toLowerCase())
    );
    if (selectedSportCategory) {
      list = list.filter(f => f.type.toLowerCase() === selectedSportCategory.toLowerCase());
    }
    return list;
  }, [facilities, selectedCity, selectedSportCategory]);

  /* Removing local filtering as navigation is used instead */
  React.useEffect(() => {
    if (activeTab !== 'events' || events.length === 0) return;
    const interval = setInterval(() => {
      scrollIndex.current = (scrollIndex.current + 1) % events.length;
      const itemWidth = SCREEN_WIDTH;
      // Use local ref for scrolling functionality
      // forYouListRef.current?.scrollToOffset({ ... });
    }, 3500);
    return () => clearInterval(interval);
  }, [activeTab, events]);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, []);

  // Fetch Live Matches & Socket Setup
  React.useEffect(() => {
    if (!socket) return;

    const fetchLiveMatches = async () => {
      try {
        const facilityIds = facilities.map(f => f.id);
        if (facilityIds.length > 0) {
          const results = await Promise.all(
            facilityIds.map(id => apiGet<any[]>(`/live-match/facility/${id}`).catch(() => []))
          );
          const allLive = results.flat().filter(m => m.status === 'LIVE');
          setLiveMatches(allLive);

          // Fetch History
          const historyResults = await Promise.all(
            facilityIds.map(id => apiGet<any[]>(`/live-match/history/facility/${id}`).catch(() => []))
          );
          setMatchHistory(historyResults.flat().slice(0, 10));

          // Join rooms
          facilityIds.forEach(id => socket.emit('live-match:join', id));
        }
      } catch (err) {
        console.warn('Failed to fetch live matches:', err);
      }
    };

    fetchLiveMatches();

    const handleUpdate = (update: any) => {
      setLiveMatches(prev => prev.map(m => 
        m.id === update.matchId 
          ? { ...m, scoreData: update.scoreData, status: update.status } 
          : m
      ).filter(m => m.status === 'LIVE'));
    };

    socket.on('live-match:update', handleUpdate);
    return () => {
      socket.off('live-match:update', handleUpdate);
      facilities.forEach(f => socket.emit('live-match:leave', f.id));
    };
  }, [socket, facilities]);

  React.useEffect(() => {
    Animated.spring(tabAnim, {
      toValue: activeTab === 'events' ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [activeTab]);

  const toggleTab = (tab: "events" | "gamehub") => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const sliderTranslateX = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (SCREEN_WIDTH - 16) / 2],
  });

  const sliderWidth = tabAnim.interpolate({
    inputRange: [0, 0.4, 0.6, 1],
    outputRange: ['48%', '55%', '55%', '48%'],
  });

  const sliderScaleY = tabAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.94, 1],
  });
  const navigationScale = React.useRef(new Animated.Value(1)).current;
  const navigationOpacity = React.useRef(new Animated.Value(1)).current;

  const sections = useMemo(() => {
    const music = events.filter((event) => event.category === "Music");
    const comedy = events.filter((event) => event.category === "Comedy");
    return [
      { title: "Trending in Events", data: music },
    ];
  }, [events]);

  const formatCurrency = (value: number) => `₹${new Intl.NumberFormat("en-IN").format(value || 0)}`;

  const posterEvent = events[0] ?? null;

  const renderHeroPoster = ({ item, index }: { item: EventItem; index: number }) => {
    // Generate some fun mock live views
    const viewCount = ["36.2Cr", "10.4k", "8.1M", "1.2Cr"][index % 4];
    const statusLine = index % 2 === 0 ? "Tickets selling fast!" : "Trending in Live Music";

    return (
      <View style={{ width: SCREEN_WIDTH, alignItems: 'center' }}>
        <Pressable onPress={() => onSelectEvent(item)} style={[styles.posterContainer, { width: SCREEN_WIDTH - 40, marginRight: 0 }]}>
          <View style={styles.mainPosterCard}>
            <Image source={{ uri: item.image }} style={styles.posterImage} />
            <LinearGradient colors={["rgba(15,10,31,0)", "rgba(15,10,31,0.2)", "rgba(15,10,31,0.94)"]} style={styles.posterOverlay} />

            <View style={styles.posterContent}>
              <View style={styles.topRow}>
              </View>

              <View style={styles.posterFooter}>
                <View style={styles.posterTextContent}>
                  <Text style={styles.posterTitleBold} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.posterSubHeader}>TATA IPL 2026</Text>
                  <Text style={styles.posterMetaInfo}>
                    {item.venue} • {item.category}
                  </Text>
                  <Text style={styles.posterStatusHighlight}>{statusLine}</Text>
                </View>

                <View style={styles.playIconCircle}>
                  <Play size={24} color="#0F0A1F" fill="#0F0A1F" style={{ marginLeft: 3 }} />
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  const SectionEventCard = ({ item }: { item: EventItem }) => (
    <View style={styles.eventCard}>
      <Image source={{ uri: item.image }} style={styles.eventCardImage} />
      <LinearGradient colors={["transparent", "transparent", "rgba(10,5,20,0.85)", "#05020F"]} style={styles.eventCardGradient} />

      <View style={styles.glassPriceTag}>
        <Text style={styles.glassPriceText}>{formatCurrency(item.price)}</Text>
      </View>

      <View style={styles.cardInnerContent}>
        <View style={styles.cardMetaRow}>
          <Text style={styles.cardDateHighlight}>
            {new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.cardTitlePremium} numberOfLines={1}>{item.title}</Text>
        <View style={styles.cardLocationRow}>
          <MapPin size={12} color="rgba(255,255,255,0.6)" />
          <Text style={styles.cardSubtitleDark} numberOfLines={1}>{item.venue}</Text>
        </View>
      </View>
    </View>
  );

  const FacilityCard = ({ item }: { item: FacilityItem }) => (
    <Pressable 
      onPress={() => onSelectFacility?.(item)}
      style={[styles.card, { backgroundColor: '#FFFFFF', borderColor: 'rgba(0,0,0,0.05)', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05, elevation: 3 }]}
    >
      <View style={styles.cardImageWrapper}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <LinearGradient colors={["transparent", "rgba(15,10,31,0.85)"]} style={styles.cardGradient} />
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>₹{item.pricePerHour}/hr</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: '#065F46' }]} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <View style={{ backgroundColor: 'rgba(5,150,105,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
            <Text style={{ color: '#059669', fontSize: 10, fontFamily: typography.bold }}>{item.type.toUpperCase()}</Text>
          </View>
          <Text style={{ color: 'rgba(0,0,0,0.5)', fontSize: 10 }}>★ {item.rating}</Text>
        </View>
        <Text style={[styles.cardSubtitleDark, { color: 'rgba(6,95,70,0.6)' }]} numberOfLines={1}>
          {item.location}
        </Text>
      </View>
    </Pressable>
  );

  const renderHeroFacility = ({ item }: { item: FacilityItem }) => (
    <View style={styles.posterContainer}>
      <View style={styles.mainPosterCard}>
        <Image source={{ uri: item.image }} style={styles.posterImage} />
        <LinearGradient colors={["rgba(15,10,31,0)", "rgba(15,10,31,0.9)"]} style={styles.posterOverlay} />
        <View style={styles.posterContent}>
          <View style={styles.topRow}>
            <View style={[styles.categoryBadge, { backgroundColor: '#FF7A00' }]}>
              <Text style={styles.categoryBadgeText}>PREMIUM</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={[styles.liveDot, { backgroundColor: '#4ADE80' }]} />
              <Text style={styles.liveText}>AVAILABLE</Text>
            </View>
          </View>
          <View style={styles.posterFooter}>
            <View style={styles.posterTextContent}>
              <Text style={styles.posterTitle} numberOfLines={1}>{item.name}</Text>
              <View style={styles.posterMetaRow}>
                <MapPin size={12} color="rgba(255,255,255,0.6)" />
                <Text style={styles.posterSubtitle}>{item.location}</Text>
              </View>
            </View>
            <View style={styles.posterPriceBox}>
              <Text style={styles.posterPriceLabel}>STARTS</Text>
              <Text style={styles.posterPriceVal}>₹{item.pricePerHour}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const isGameHub = activeTab === 'gamehub';

  return (
    <View style={styles.screenWrap}>
      <LinearGradient
        colors={isGameHub ? ["#F0FDF4", "#FFFFFF", "#F8FAFC"] : ["#1A0F3D", "#0B0820", "#000000"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, isGameHub && { justifyContent: 'space-between', alignItems: 'center' }]}>
          {isGameHub ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Pressable onPress={handlePickImage} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Text style={{ fontSize: 20, fontFamily: typography.bold, color: '#6B7280' }}>H</Text>
                  )}
                </Pressable>
                <View style={{ justifyContent: 'center' }}>
                  <Text style={{ fontSize: 16, color: '#111827', fontFamily: typography.bold, marginBottom: -2, letterSpacing: -0.5 }}>Hey Hariharan!</Text>
                  <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 }} onPress={onOpenLocation}>
                    <Text style={{ fontSize: 13, color: '#6B7280', fontFamily: typography.primary }}>CJX6+2R2 D.V.S.Com...</Text>
                    <ChevronDown size={14} color="rgba(17,24,39,0.5)" />
                  </Pressable>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                 <Pressable onPress={() => Alert.alert("Messages", "Your inbox will be available soon in the next update!")}>
                   <MessageSquareText size={24} color="#111827" strokeWidth={1.8} />
                 </Pressable>
                 <Pressable onPress={() => Alert.alert("Notifications", "You have no new notifications.")}>
                   <Bell size={24} color="#111827" strokeWidth={1.8} />
                 </Pressable>
                 <Pressable onPress={() => Alert.alert("My Calendar", "Your upcoming bookings and calendar sync will appear here.")}>
                   <CalendarDays size={24} color="#111827" strokeWidth={1.8} />
                 </Pressable>
              </View>
            </>
          ) : (
            <>
              <Pressable style={styles.locationContainer} onPress={onOpenLocation}>
                <Text style={styles.locationLabel}>CURRENT LOCATION</Text>
                <View style={styles.cityRow}>
                  <MapPin size={16} color={colors.purpleBrand} />
                  <Text style={styles.locationText}>{selectedCity}</Text>
                  <ChevronDown size={14} color="rgba(255,255,255,0.6)" style={{ marginLeft: -2 }} />
                </View>
              </Pressable>
              <View style={styles.headerIcons}>
                <Pressable style={styles.iconBtn}>
                  <Bell size={20} color="#FFFFFF" />
                  <View style={styles.notiDot} />
                </Pressable>
                <Pressable onPress={handlePickImage} onLongPress={onOpenProfile}>
                  <Animated.View style={[
                    styles.profileBtn,
                    {
                      borderColor: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['rgba(124,58,237,0.3)', 'rgba(124,58,237,0.8)']
                      }),
                      borderWidth: 2,
                      overflow: 'hidden',
                    }
                  ]}>
                    {profileImage ? (
                      <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Text style={{ fontSize: 18, fontFamily: typography.bold, color: '#FFF' }}>H</Text>
                    )}
                  </Animated.View>
                </Pressable>
              </View>
            </>
          )}
        </View>

        <View style={styles.searchWrapper}>
          <LinearGradient
            colors={isGameHub ? ["rgba(16,185,129,0.12)", "rgba(16,185,129,0.06)"] : ["#00A8FF", "#8A2BE2", "#FF007F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.searchBarBorder, isGameHub && { backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.15)' }]}
          >
            <View style={styles.searchBarInner}>
              <LinearGradient
                colors={isGameHub ? ["#FFFFFF", "#F0FDF4"] : ["#060410", "#0B091B"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
              <Search size={20} color={isGameHub ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)"} style={{ zIndex: 2 }} />
              <TextInput
                style={[styles.searchInput, { zIndex: 2 }, isGameHub && { color: '#065F46' }]}
                placeholder="Search events, artists, venues..."
                placeholderTextColor={isGameHub ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.4)"}
                value={query}
                onChangeText={setQuery}
              />
            </View>
          </LinearGradient>
        </View>

        <View style={styles.buttonPanelWrap}>
          <View style={[styles.buttonPanel, { backgroundColor: isGameHub ? '#F8FAFC' : '#0F0C29', borderWidth: 1, borderColor: isGameHub ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)' }]}>
            <View style={styles.buttonRow}>
              {/* Shared Flowing Background with Cross-Fade */}
              <Animated.View
                style={[
                  styles.tabHighlight,
                  {
                    width: sliderWidth,
                    transform: [
                      { translateX: sliderTranslateX },
                      { scaleY: sliderScaleY }
                    ]
                  }
                ]}
              >
                {/* Purple Flow Layer */}
                <Animated.View style={[StyleSheet.absoluteFill, {
                  opacity: tabAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
                }]}>
                  <LinearGradient
                    colors={["#00A8FF", "#8A2BE2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
                {/* GameHub Green Flow Layer */}
                <Animated.View style={[StyleSheet.absoluteFill, {
                  opacity: tabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })
                }]}>
                  <LinearGradient
                    colors={["#34D399", "#10B981"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </Animated.View>

              <PremiumButton
                title="Events"
                type="purple"
                isActive={activeTab === 'events'}
                onPress={() => toggleTab('events')}
                shimmerAnim={shimmerAnim}
                pulseAnim={pulseAnim}
              />
              <PremiumButton
                title="GameHub"
                type="orange"
                isActive={activeTab === 'gamehub'}
                onPress={() => toggleTab('gamehub')}
                shimmerAnim={shimmerAnim}
                pulseAnim={pulseAnim}
              />
            </View>
          </View>
        </View>

        {activeTab === 'events' ? (
          <>
            <View style={styles.heroSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>For You</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Pressable style={styles.upgradeBtn}>
                    <Text style={styles.upgradeText}>Upgrade</Text>
                  </Pressable>
                  <Cast size={24} color="#FFF" />
                </View>
              </View>
              <FlatList
                ref={forYouListRef}
                horizontal
                pagingEnabled
                data={events}
                renderItem={(props) => renderHeroPoster(props)}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
              />
            </View>

            {/* SECTION 0: TRENDING */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{sections[0].title}</Text>
                <Pressable onPress={onOpenAllEvents}>
                  <Text style={styles.seeAllLink}>See all</Text>
                </Pressable>
              </View>
              <FlatList
                horizontal
                data={sections[0].data}
                renderItem={({ item }) => (
                  <Pressable onPress={() => onSelectEvent(item)}>
                    <SectionEventCard item={item} />
                  </Pressable>
                )}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
              {posterEvent && (
                <Pressable style={styles.posterBannerWrap} onPress={() => onSelectEvent(posterEvent)}>
                  <Image source={{ uri: posterEvent.image }} style={styles.posterBannerImage} />
                  <LinearGradient colors={["rgba(17,24,39,0)", "rgba(17,24,39,0.72)"]} style={styles.posterBannerOverlay} />
                  <View style={styles.posterBannerContent}>
                    <Text style={styles.posterBannerTag}>SPOTLIGHT</Text>
                    <Text style={styles.posterBannerTitle} numberOfLines={1}>{posterEvent.title}</Text>
                    <Text style={styles.posterBannerMeta} numberOfLines={1}>{posterEvent.venue}</Text>
                  </View>
                </Pressable>
              )}
            </View>

            {/* NEW ALL EVENTS GRID SECTION (Now downside of Trending) */}
            <View style={styles.gridSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Events</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterBar}
              >
                <Pressable style={styles.filterPill}>
                  <Sliders size={14} color="#FFF" />
                  <Text style={styles.filterPillText}>Filters</Text>
                  <ChevronDown size={14} color="rgba(255,255,255,0.6)" />
                </Pressable>
                <Pressable style={styles.filterPill}>
                  <Text style={styles.filterPillText}>Date</Text>
                  <ChevronDown size={14} color="rgba(255,255,255,0.6)" />
                </Pressable>
                <Pressable style={styles.filterPill}>
                  <Text style={styles.filterPillText}>Today</Text>
                </Pressable>
                <Pressable style={styles.filterPill}>
                  <Text style={styles.filterPillText}>Tomorrow</Text>
                </Pressable>
              </ScrollView>

              <View style={styles.gridContainer}>
                {events.map((event) => (
                  <GridEventCard key={event.id} item={event} onSelectEvent={onSelectEvent} />
                ))}
              </View>
            </View>

            {/* REMAINING SECTIONS */}
            {sections.slice(1).map((section) => (
              <View key={section.title} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Pressable onPress={onOpenAllEvents}>
                    <Text style={styles.seeAllLink}>See all</Text>
                  </Pressable>
                </View>
                <FlatList
                  horizontal
                  data={section.data}
                  renderItem={({ item }) => (
                    <Pressable onPress={() => onSelectEvent(item)}>
                      <SectionEventCard item={item} />
                    </Pressable>
                  )}
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                />
              </View>
            ))}
          </>
        ) : (
          <>


            <View style={styles.promoCarouselSection}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
                snapToInterval={SCREEN_WIDTH * 0.85 + 16}
                decelerationRate="fast"
              >
                {PROMO_BANNERS.map((banner) => (
                  <View key={banner.id} style={styles.promoCardContainer}>
                    <LinearGradient
                      colors={banner.bgGradient as [string, string, ...string[]]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    
                    {/* Background Texture/Image Overlay */}
                    <Image source={{ uri: banner.bgImg }} style={[StyleSheet.absoluteFillObject, { opacity: 0.2 }]} blurRadius={3} />
                    
                    {/* Motion lines overlay */}
                    <LinearGradient
                      colors={["rgba(255,255,255,0.1)", "transparent", "rgba(0,0,0,0.2)"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />

                    <View style={styles.promoContentInner}>
                      <Text style={styles.promoHeadline}>{banner.title}</Text>
                      <Text style={styles.promoSubline}>{banner.subTitle}</Text>
                      
                      <View style={{ marginTop: 6, marginBottom: 16 }}>
                        <Text style={styles.promoSupportText}>{banner.meta}</Text>
                      </View>

                      <View style={styles.promoCtaBtn}>
                        <Text style={styles.promoCtaText}>{banner.ctaText}</Text>
                      </View>
                    </View>
                    
                    {/* Brand Element Placeholder */}
                    <View style={styles.promoBrandBadge}>
                      <Text style={styles.promoBrandText}>{banner.brandLogo}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.categoriesSection}>
              <View style={styles.categoriesRoot}>
                {FACILITY_CATEGORIES.map((cat: any) => {
                  const isVector = cat.id === 'more';
                  const iconSize = isVector ? 42 : 72;
                  const isSelected = selectedSportCategory?.toLowerCase() === cat.title.toLowerCase();
                  
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={styles.categoryCard}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (isVector) {
                          onOpenGameHub();
                        } else {
                          setSelectedSportCategory(prev => prev === cat.title ? null : cat.title);
                        }
                      }}
                    >
                      <View style={{
                        width: 72,
                        height: 72,
                        borderRadius: 22,
                        backgroundColor: '#FFFFFF',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                        shadowColor: isSelected ? cat.color : '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: isSelected ? 0.4 : 0.12,
                        shadowRadius: isSelected ? 12 : 8,
                        elevation: isSelected ? 10 : 5,
                        borderWidth: isSelected ? 2.5 : 0,
                        borderColor: isSelected ? cat.color : 'transparent',
                      }}>
                        <cat.Icon size={iconSize} color={cat.color} strokeWidth={2.5} />
                      </View>
                      <Text style={[
                        styles.categoryLabel,
                        {
                          color: '#FFFFFF',
                          fontFamily: typography.bold,
                          fontSize: 10,
                          letterSpacing: 0.5,
                          marginTop: 8,
                          textAlign: 'center',
                          opacity: isSelected ? 1 : 0.8,
                        }
                      ]}>
                        {cat.title.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Live Matches Section */}
            {liveMatches.length > 0 && (
              <View style={[styles.section, { marginTop: 24 }]}>
                <View style={styles.sectionHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.sectionTitle, { color: '#065F46' }]}>Live Matches</Text>
                    <View style={{ backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ color: '#FFF', fontSize: 9, fontFamily: typography.bold }}>LIVE</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => setIsLeaderboardVisible(true)} style={styles.leaderboardBtn}>
                    <Award size={18} color="#10B981" />
                    <Text style={styles.leaderboardBtnText}>Leaderboard</Text>
                  </Pressable>
                </View>
                <FlatList
                  horizontal
                  data={liveMatches}
                  renderItem={({ item }) => <LiveMatchCard match={item} />}
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                />
              </View>
            )}

            {/* Match History Section */}
            {matchHistory.length > 0 && (
              <View style={[styles.section, { marginTop: 24 }]}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: '#1E293B' }]}>Recently Finished</Text>
                </View>
                <FlatList
                  horizontal
                  data={matchHistory}
                  renderItem={({ item }) => (
                    <View style={[styles.historyCard, { backgroundColor: '#F8FAFC' }]}>
                      <View style={styles.historyHeader}>
                        <Text style={styles.historySport}>{item.sportType}</Text>
                        <Text style={styles.historyDate}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
                      </View>
                      <View style={styles.historyScoreRow}>
                        <Text style={styles.historyScore}>{item.scoreData.runs || 0}/{item.scoreData.wickets || 0}</Text>
                        <Text style={styles.historyOvers}>{item.scoreData.overs || 0}.{item.scoreData.balls || 0} ov</Text>
                      </View>
                      <Text style={styles.historyUser} numberOfLines={1}>Owner: {item.booking.user.name}</Text>
                    </View>
                  )}
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                />
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: '#065F46' }]}>
                  {selectedSportCategory ? `${selectedSportCategory} Facilities` : "Popular Facilities"}
                </Text>
                <Pressable onPress={() => {
                  setSelectedSportCategory(null);
                  onOpenGameHub();
                }}>
                  <Text style={[styles.seeAllLink, { color: '#10B981' }]}>
                    {selectedSportCategory ? "Clear" : "See all"}
                  </Text>
                </Pressable>
              </View>
              <FlatList
                horizontal
                data={filteredFacilities}
                renderItem={({ item }) => <FacilityCard item={item} />}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            </View>

            {filteredFacilities.length > 0 && (
              <View style={[styles.posterBannerWrap, { marginTop: 20 }]}>
                <Image source={{ uri: filteredFacilities[0].image }} style={styles.posterBannerImage} />
                <LinearGradient colors={["rgba(15,10,31,0)", "rgba(15,10,31,0.8)"]} style={styles.posterBannerOverlay} />
                <View style={styles.posterBannerContent}>
                  <Text style={[styles.posterBannerTag, { backgroundColor: '#FF7A00' }]}>BOOK NOW</Text>
                  <Text style={styles.posterBannerTitle}>{filteredFacilities[0].name}</Text>
                  <Text style={styles.posterBannerMeta}>{filteredFacilities[0].location}</Text>
                </View>
              </View>
            )}
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <LeaderboardModal 
        visible={isLeaderboardVisible} 
        onClose={() => setIsLeaderboardVisible(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrap: {
    flex: 1,
  },
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  locationContainer: { gap: 4 },
  locationLabel: { color: 'rgba(255,255,255,0.62)', fontSize: 10, fontFamily: typography.bold, letterSpacing: 1 },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { color: '#FFFFFF', fontSize: 18, fontFamily: typography.bold },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.purpleBrand, justifyContent: 'center', alignItems: 'center' },

  promoCarouselSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  promoCardContainer: {
    width: SCREEN_WIDTH * 0.85,
    height: 170,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 8,
  },
  promoContentInner: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  promoHeadline: {
    fontFamily: typography.bold,
    fontSize: 22,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 26,
  },
  promoSubline: {
    fontFamily: typography.bold,
    fontSize: 26,
    fontStyle: 'italic',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    lineHeight: 30,
    letterSpacing: 1,
  },
  promoSupportText: {
    fontFamily: typography.primary,
    fontSize: 10,
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: 0.5,
  },
  promoCtaBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  promoCtaText: {
    color: '#FFFFFF',
    fontFamily: typography.bold,
    fontSize: 11,
  },
  promoBrandBadge: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    backgroundColor: '#FFFFFF',
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  promoBrandText: {
    color: '#111827',
    fontFamily: typography.bold,
    fontSize: 16,
  },

  searchWrapper: { paddingHorizontal: 20, marginBottom: 24 },
  searchBarBorder: {
    height: 48,
    borderRadius: 16,
    padding: 1, // 1px border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  searchBarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: typography.secondary,
    paddingVertical: 0,
  },

  buttonPanelWrap: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  buttonPanel: {
    padding: 2,
    borderRadius: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    height: 56,
    padding: 3,
    gap: 24,
    alignItems: 'center',
    position: 'relative',
  },
  tabHighlight: {
    position: 'absolute',
    height: '90%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowColor: '#000',
    elevation: 3,
    top: '5%',
  },
  premiumPressable: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  outerGlow: {
    height: 54,
    borderRadius: 20,
    padding: 1,
    justifyContent: 'center',
  },
  outerGlowPurple: {
    shadowColor: '#0088FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  outerGlowGreen: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 8,
  },
  innerGlass: {
    flex: 1,
    borderRadius: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  innerGlassPurple: {
    borderColor: 'rgba(255,255,255,0.1)',
  },
  innerGlassGreen: {
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  buttonTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: typography.secondary,
  },

  heroSection: { marginBottom: 32 },
  posterContainer: { width: SCREEN_WIDTH - 80, height: 420, marginRight: 16 },
  mainPosterCard: { width: '100%', height: '100%', borderRadius: 32, overflow: 'hidden' },
  posterImage: { width: '100%', height: '100%' },
  posterOverlay: { ...StyleSheet.absoluteFillObject },
  posterContent: { ...StyleSheet.absoluteFillObject, padding: 24, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  liveBannerMain: { color: '#FFF', fontSize: 11, fontFamily: typography.bold, letterSpacing: 0.5 },
  liveDivider: { width: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 8 },
  liveBannerViews: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontFamily: typography.secondary },
  posterFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  posterTextContent: { flex: 1, marginRight: 12 },
  posterTitleBold: {
    color: '#fff',
    fontSize: 24,
    fontFamily: typography.bold,
    fontStyle: 'italic',
    lineHeight: 28,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  posterSubHeader: { color: '#fff', fontSize: 14, fontFamily: typography.bold, marginBottom: 4 },
  posterMetaInfo: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: typography.secondary, marginBottom: 4 },
  posterStatusHighlight: { color: '#FFD700', fontSize: 13, fontFamily: typography.bold },
  playIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  upgradeText: { color: '#FFD700', fontSize: 11, fontFamily: typography.bold },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  categoryBadgeText: { color: '#FFFFFF', fontSize: 10, fontFamily: typography.bold, letterSpacing: 1 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  liveText: { color: '#fff', fontSize: 10, fontFamily: typography.bold },
  posterTitle: { color: '#fff', fontSize: 20, fontFamily: typography.bold },
  posterMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  posterSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: typography.secondary },
  posterPriceBox: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignItems: 'center' },
  posterPriceLabel: { fontSize: 8, fontFamily: typography.bold, color: 'rgba(255,255,255,0.4)' },
  posterPriceVal: { fontSize: 16, fontFamily: typography.bold, color: '#FFFFFF' },
  notiDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#0B0820'
  },

  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { color: '#FFFFFF', fontSize: 22, fontFamily: typography.bold },
  seeAllLink: { color: '#10B981', fontSize: 14, fontFamily: typography.bold },
  listContent: { paddingHorizontal: 20, gap: 16 },
  eventCard: { width: 240, height: 320, borderRadius: 28, overflow: 'hidden', backgroundColor: '#1B1030', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  eventCardImage: { width: '100%', height: '100%' },
  eventCardGradient: { ...StyleSheet.absoluteFillObject },
  glassPriceTag: { position: 'absolute', top: 16, right: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  glassPriceText: { color: '#FFF', fontSize: 13, fontFamily: typography.bold },
  cardInnerContent: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  cardMetaRow: { marginBottom: 8 },
  cardDateHighlight: { color: '#4ADE80', fontSize: 12, fontFamily: typography.bold, letterSpacing: 1 },
  cardTitlePremium: { color: '#FFFFFF', fontSize: 17, fontFamily: typography.bold, marginBottom: 6 },
  cardLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  card: { width: 220 },
  cardImageWrapper: {
    width: '100%',
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,77,166,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 14,
  },
  cardImage: { width: '100%', height: '100%' },
  cardGradient: { ...StyleSheet.absoluteFillObject },
  priceTag: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(17,24,39,0.15)' },
  priceText: { color: '#111827', fontSize: 12, fontFamily: typography.bold },
  cardContent: { marginTop: 12 },
  cardTitle: { color: '#FFFFFF', fontSize: 18, fontFamily: typography.bold },
  cardSubtitleDark: { color: 'rgba(255,255,255,0.72)', fontSize: 14, marginTop: 4, fontFamily: typography.secondary },
  cardDate: { color: colors.purpleBrand, fontSize: 12, marginTop: 6, fontFamily: typography.bold, textTransform: 'uppercase' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { height: SCREEN_HEIGHT * 0.8, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, overflow: 'hidden', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: 'rgba(17,24,39,0.1)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  modalTitle: { fontSize: 24, color: '#111827', fontFamily: typography.bold },
  modalSubtitle: { fontSize: 14, color: 'rgba(17,24,39,0.6)', fontFamily: typography.secondary, marginTop: 4 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(17,24,39,0.08)', justifyContent: 'center', alignItems: 'center' },
  closeText: { fontSize: 14, color: '#111827' },
  citySearchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, height: 56, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(17,24,39,0.12)' },
  citySearchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#111827', fontFamily: typography.secondary },
  cityGroupLabel: { fontSize: 10, color: 'rgba(17,24,39,0.55)', letterSpacing: 2, marginBottom: 16, marginTop: 8, fontFamily: typography.bold },
  popularGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  cityPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(17,24,39,0.12)' },
  cityPillActive: { backgroundColor: colors.purpleBrand, borderColor: 'transparent' },
  cityPillText: { fontSize: 14, color: 'rgba(17,24,39,0.75)', fontFamily: typography.secondary },
  cityPillTextActive: { color: '#fff', fontFamily: typography.bold },
  cityListCard: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(17,24,39,0.1)' },
  cityListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(17,24,39,0.08)' },
  cityListText: { fontSize: 16, color: 'rgba(17,24,39,0.85)', fontFamily: typography.secondary },
  cityListTextActive: { color: '#111827', fontFamily: typography.bold },
  cityCheck: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  posterBannerWrap: {
    height: 160,
    marginTop: 18,
    marginHorizontal: 20,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
  },
  posterBannerImage: { width: '100%', height: '100%' },
  posterBannerOverlay: { ...StyleSheet.absoluteFillObject },
  posterBannerContent: { position: 'absolute', left: 16, right: 16, bottom: 14 },
  posterBannerTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(124,58,237,0.95)',
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: typography.bold,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  posterBannerTitle: { color: '#FFFFFF', fontSize: 17, fontFamily: typography.bold },
  posterBannerMeta: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: typography.secondary, marginTop: 4 },
  gridSection: { paddingVertical: 16, marginBottom: 80 },
  filterBar: { paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  filterPillText: { color: '#FFF', fontSize: 13, fontFamily: typography.bold },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    justifyContent: 'space-between'
  },
  gridCard: { width: (SCREEN_WIDTH - 40) / 2, marginBottom: 20, paddingHorizontal: 6 },
  gridImageWrapper: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
  },
  gridImage: { width: '100%', height: '100%' },
  bookmarkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  gridContent: { marginTop: 10 },
  gridTitle: { color: '#FFF', fontSize: 15, fontFamily: typography.bold, lineHeight: 20 },
  gridMeta: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4, fontFamily: typography.secondary },
  gridMetaLocation: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2, fontFamily: typography.secondary },
  offerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  offerText: { color: '#4ADE80', fontSize: 12, fontFamily: typography.bold },
  categoriesSection: { marginBottom: 32 },
  categoriesRoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#10B981',
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'flex-start',
  },
  categoryCard: { alignItems: 'center', flex: 1, gap: 8 },
  categoryGlow: {
    position: 'absolute',
    top: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20, // Reduced glow for Android stability
    zIndex: -1,
  },
  categoryIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  categoryIconInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 10, 31, 0.4)',
  },
  categoryLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: typography.bold,
    letterSpacing: 0.8,
    textAlign: 'center',
    opacity: 0.8,
  },
  historyCard: {
    width: 200,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historySport: {
    fontSize: 10,
    fontFamily: typography.bold,
    color: '#64748B',
    textTransform: 'uppercase',
  },
  historyDate: {
    fontSize: 10,
    fontFamily: typography.primary,
    color: '#94A3B8',
  },
  historyScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  historyScore: {
    fontSize: 20,
    fontFamily: typography.bold,
    color: '#0F172A',
  },
  historyOvers: {
    fontSize: 12,
    fontFamily: typography.bold,
    color: '#94A3B8',
  },
  historyUser: {
    fontSize: 11,
    fontFamily: typography.primary,
    color: '#64748B',
    marginTop: 4,
  },
  leaderboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  leaderboardBtnText: {
    fontSize: 12,
    fontFamily: typography.bold,
    color: '#059669',
  },
});