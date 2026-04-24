import { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  Dimensions,
  Modal,
  TextInput,
  FlatList,
  ScrollView,
  Platform,
  BackHandler,
} from "react-native";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
import { StatusBar } from "expo-status-bar";
import * as Device from "expo-device";
import { useFonts } from "expo-font";
import { BlurView } from "expo-blur";
import * as Location from 'expo-location';
import { apiGet } from "./src/lib/api";
import { colors } from "./src/theme/colors";
import { typography } from "./src/theme/typography";
import {
  EventItem,
  FacilityItem,
  TicketItem,
  Screen,
  BookingDraft,
  FacilityBookingDraft,
} from "./src/types";

// Auth
import { AuthProvider, useAuth } from "./src/hooks/useAuth";
import { SocketProvider } from "./src/context/SocketContext";

// Screens
import { LinearGradient } from "expo-linear-gradient";
import { DiscoverScreen } from "./src/screens/DiscoverScreen";
import { AllEventsScreen } from "./src/screens/AllEventsScreen";
import { EventDetailScreen } from "./src/screens/EventDetailScreen";
import { BookingScreen } from "./src/screens/BookingScreen";
import { CheckoutScreen } from "./src/screens/CheckoutScreen";
import { TicketScreen } from "./src/screens/TicketScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { GameHubScreen } from "./src/screens/GameHubScreen";
import { PartnerDashboardScreen } from "./src/screens/PartnerDashboardScreen";
import { FacilityBookingScreen } from "./src/screens/FacilityBookingScreen";
import { VenueDetailScreen } from "./src/screens/VenueDetailScreen";
import { SeatSelectionScreen } from "./src/screens/SeatSelectionScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { BackgroundEngine } from "./src/components/BackgroundEngine";
import { Search, Sparkles, User, LocateFixed } from "lucide-react-native";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

const POPULAR_CITIES = [
  "Hyderabad",
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
];

const ALL_CITIES = [
  "Agra",
  "Amritsar",
  "Bhopal",
  "Chandigarh",
  "Coimbatore",
  "Guwahati",
  "Indore",
  "Jaipur",
  "Kochi",
  "Lucknow",
  "Madurai",
  "Nagpur",
  "Patna",
  "Surat",
  "Thane",
  "Vadodara",
  "Visakhapatnam",
];

const FALLBACK_EVENTS: EventItem[] = [
  {
    id: "ev-1",
    title: "Arijit Singh: One Night Only Tour",
    category: "Music",
    location: "Mumbai",
    venue: "DY Patil Stadium",
    hostName: "Live Nation",
    date: new Date(Date.now() + 86400000 * 14).toISOString(),
    time: "7:00 PM",
    price: 2499,
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1200",
    description: "The biggest musical extravaganza of 2026. Experience Arijit live in an immersive 360-degree stage setup.",
  },
  {
    id: "ev-2",
    title: "Comic Con India 2026",
    category: "Comedy",
    location: "Delhi",
    venue: "NSIC Ground, Okhla",
    partnerName: "Maruti Suzuki",
    date: new Date(Date.now() + 86400000 * 25).toISOString(),
    time: "11:00 AM",
    price: 899,
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200",
    description: "India's greatest pop culture celebration return to Delhi. Cosplay, collectibles, and global guest stars.",
  },
  {
    id: "ev-3",
    title: "TATA IPL 2026: RCB vs SRH",
    category: "Sports",
    location: "Hyderabad",
    venue: "Rajiv Gandhi International Stadium",
    partnerName: "IPL Official",
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    time: "7:30 PM",
    price: 1500,
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200",
    description: "Watch the giants of the south clash in this high-intensity T20 battle. Uppal will be a sea of orange and red.",
  },
  {
    id: "ev-4",
    title: "Trevor Noah: Laugh Out Loud",
    category: "Comedy",
    location: "Bengaluru",
    venue: "Manyata Tech Park Area",
    hostName: "BookMyShow Live",
    date: new Date(Date.now() + 86400000 * 30).toISOString(),
    time: "8:00 PM",
    price: 3500,
    image: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?q=80&w=1200",
    description: "The global comedy icon returns to Namma Bengaluru with an all-new set about AI and world travel.",
  },
  {
    id: "ev-5",
    title: "Bacardi NH7 Weekender",
    category: "Music",
    location: "Pune",
    venue: "Mahalakshmi Lawns",
    partnerName: "NODWIN Gaming",
    date: new Date(Date.now() + 86400000 * 45).toISOString(),
    time: "3:00 PM",
    price: 3999,
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200",
    description: "The happiest music festival is back in its hometown. Multis-genre stages and the best food in the city.",
  },
];

const FALLBACK_FACILITIES: FacilityItem[] = [
  {
    id: "fac-1",
    name: "Smaaash: Game On!",
    type: "Gaming & VR",
    location: "LEPL Centro Mall, Vijayawada",
    rating: 4.8,
    pricePerHour: 1200,
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200",
  },
  {
    id: "fac-2",
    name: "Urban Turf Arena",
    type: "Cricket & Football",
    location: "Madhapur, Hyderabad",
    rating: 4.7,
    pricePerHour: 1500,
    image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=1200",
  },
  {
    id: "fac-3",
    name: "Thunder Bolt Bowling",
    type: "Bowling",
    location: "DLF Cyber City, Gurgaon",
    rating: 4.9,
    pricePerHour: 800,
    image: "https://images.unsplash.com/photo-1544145945-f904253db0ad?q=80&w=1200",
  },
];

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function MainApp() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const { user, login, register, loading: authLoading, logout, skipLogin } = useAuth();
  const [hasOnboarded, setHasOnboarded] = useState(true);
  const [screen, setScreen] = useState<Screen | "gamehub" | "partner" | "seats">("discover");
  const [isSecurityCompromised, setIsSecurityCompromised] = useState(false);
  const navAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let toVal = 1; // home
    if (screen === "discover") toVal = 1; 
    if (screen === "profile") toVal = 2;
    if (screen === "tickets") toVal = 0; // mapping search icon to tickets for now as placeholder

    Animated.spring(navAnim, {
      toValue: toVal,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [screen]);

  // Security Integrity Check
  useEffect(() => {
    async function checkIntegrity() {
      // In production, Device.isDevice being false (emulator) or 
      // other indications of rooting would trigger a block.
      const isEmulator = !Device.isDevice;
      
      if (__DEV__) {
        console.log("🛡️ [Security] Running in Development Mode. Integrity check bypassed.");
        return;
      }

      if (isEmulator) {
        // High-security apps often block emulators in production to prevent botting/scripts
        console.warn("🛡️ [Security] Potential Integrity Violation: Emulator detected.");
        // setIsSecurityCompromised(true); 
      }
    }
    checkIntegrity();
  }, []);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<FacilityItem | null>(null);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [draft, setDraft] = useState<BookingDraft>({ qty: 2, seatZone: "Premium", paymentMethod: "UPI" });
  const [facilityDraft, setFacilityDraft] = useState<FacilityBookingDraft | null>(null);
  const [discoverTab, setDiscoverTab] = useState<"events" | "gamehub">("events");
  const [selectedCity, setSelectedCity] = useState("Hyderabad");
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [gameHubInitialSport, setGameHubInitialSport] = useState<string>("all");
  const [isLocating, setIsLocating] = useState(false);

  const fetchGPSLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (geocode && geocode.length > 0) {
        const city = geocode[0].city || geocode[0].subregion || geocode[0].region || geocode[0].district || "Hyderabad";
        // Clean up the city string if it contains extra data (like 'Hyderabad City')
        const shortCity = city.split(' ')[0]; 
        setSelectedCity(shortCity);
      } else {
        setSelectedCity("Hyderabad");
      }
      setIsLocationModalVisible(false);
      setCitySearch("");
    } catch (error) {
      console.warn("GPS fetching error:", error);
      alert("Could not fetch location. Defaulting to Hyderabad.");
      setSelectedCity("Hyderabad");
      setIsLocationModalVisible(false);
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      try {
        const [eventsRes, facilitiesRes] = await Promise.all([
          apiGet<any[]>("/events?limit=30").catch(() => []),
          apiGet<any[]>("/facilities?limit=20").catch(() => []),
        ]);
        setEvents(eventsRes.length ? eventsRes : FALLBACK_EVENTS);
        setFacilities(facilitiesRes.length ? facilitiesRes : FALLBACK_FACILITIES);
      } catch (err) {
        console.warn("Bootstrap error", err);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  // Global Back Handler for Android Edge Swipe / Hardware Back Button
  useEffect(() => {
    const handleBackPress = () => {
      if (screen === "discover") {
        return false; // Exit app
      }
      
      switch (screen) {
        case "gamehub":
        case "events":
        case "profile":
        case "tickets":
        case "partner":
          setScreen("discover");
          break;
        case "event":
          setScreen("events");
          break;
        case "seats":
          setScreen("event");
          break;
        case "facility-detail":
          setScreen("gamehub");
          break;
        case "facility-booking":
          setScreen("facility-detail");
          break;
        case "checkout":
          setScreen("discover");
          break;
        default:
          setScreen("discover");
          break;
      }
      return true; // Prevent default exit
    };

    BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
  }, [screen]);

  const isReady = fontsLoaded && !loading && !authLoading;

  if (!isReady) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.purpleBrand} />
      </View>
    );
  }

  if (isSecurityCompromised) {
    return (
      <View style={[styles.loadingWrap, { padding: 40 }]}>
        <Text style={{ color: '#EF4444', fontSize: 24, fontFamily: typography.bold, textAlign: 'center' }}>
          Security Violation
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, textAlign: 'center', marginTop: 12 }}>
          Your device does not meet the minimum security requirements to run Book & Vibe. 
          Please ensure your device is not rooted or jailbroken.
        </Text>
      </View>
    );
  }

  if (!fontsLoaded || loading || authLoading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.purpleBrand} />
      </View>
    );
  }

  if (!hasOnboarded) {
    return (
      <View style={styles.safeArea}>
        <BackgroundEngine />
        <OnboardingScreen onStart={() => setHasOnboarded(true)} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar style="light" />
        <AuthScreen onLogin={login} onRegister={register} onSkip={skipLogin} />
      </View>
    );
  }

  const isLightMode = screen === "discover" && discoverTab === "gamehub";

  return (
    <SafeAreaView style={[styles.safeArea, isLightMode && { backgroundColor: '#F8FAFC' }]}>
      <StatusBar style={isLightMode ? "dark" : "light"} />

      <BackgroundEngine />

      {/* Live Notifications Modal */}
      <Modal
        visible={isNotificationsVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsNotificationsVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Live Alerts</Text>
                <Text style={styles.modalSubtitle}>Happening right now in your city</Text>
              </View>
              <Pressable onPress={() => setIsNotificationsVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            {liveMatches.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Bell size={48} color="#CBD5E1" />
                <Text style={styles.emptyNotiText}>No live matches at the moment.</Text>
              </View>
            ) : (
              <FlatList
                data={liveMatches}
                renderItem={({ item }) => (
                  <Pressable 
                    onPress={() => {
                      setIsNotificationsVisible(false);
                      // Scroll to live matches section or highlight
                    }}
                    style={styles.notiItem}
                  >
                    <View style={styles.notiIconWrap}>
                      <Trophy size={18} color="#10B981" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.notiTitle}>Live {item.sportType} Match!</Text>
                      <Text style={styles.notiBody}>{item.booking.user.name} is scoring live at {item.facility.name}.</Text>
                    </View>
                    <View style={styles.liveDot} />
                  </Pressable>
                )}
                keyExtractor={(item) => item.id}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Global Location Modal */}
      <Modal
        visible={isLocationModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsLocationModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select City</Text>
                <Text style={styles.modalSubtitle}>Events will update automatically</Text>
              </View>
              <Pressable onPress={() => setIsLocationModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.citySearchContainer}>
              <Search size={20} color="rgba(0,0,0,0.3)" />
              <TextInput
                style={styles.citySearchInput}
                placeholder="Search your city"
                placeholderTextColor="rgba(0,0,0,0.3)"
                value={citySearch}
                onChangeText={setCitySearch}
              />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              <Pressable 
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' }}
                disabled={isLocating}
                onPress={fetchGPSLocation}
              >
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center' }}>
                  {isLocating ? <ActivityIndicator size="small" color="#10B981" /> : <LocateFixed size={20} color="#10B981" />}
                </View>
                <View style={{ marginLeft: 16 }}>
                  <Text style={{ fontSize: 16, color: '#065F46', fontFamily: typography.bold }}>{isLocating ? 'Locating...' : 'Use my current location'}</Text>
                  <Text style={{ fontSize: 13, color: 'rgba(6,95,70,0.7)', fontFamily: typography.primary, marginTop: 2 }}>Using GPS & Google Maps Data</Text>
                </View>
              </Pressable>

              <Text style={styles.cityGroupLabel}>POPULAR</Text>
              <View style={styles.popularGrid}>
                {POPULAR_CITIES.map((city) => (
                  <Pressable
                    key={city}
                    style={[styles.cityPill, selectedCity === city && styles.cityPillActive]}
                    onPress={() => {
                      setSelectedCity(city);
                      setIsLocationModalVisible(false);
                      setCitySearch("");
                    }}
                  >
                    <Text style={[styles.cityPillText, selectedCity === city && styles.cityPillTextActive]}>{city}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.cityGroupLabel}>ALL CITIES</Text>
              <View style={styles.cityListCard}>
                {ALL_CITIES.filter((city) => city.toLowerCase().includes(citySearch.toLowerCase())).map((city, idx, arr) => (
                  <Pressable
                    key={city}
                    style={[styles.cityListItem, idx === arr.length - 1 && { borderBottomWidth: 0 }]}
                    onPress={() => {
                      setSelectedCity(city);
                      setIsLocationModalVisible(false);
                      setCitySearch("");
                    }}
                  >
                    <Text style={[styles.cityListText, selectedCity === city && styles.cityListTextActive]}>{city}</Text>
                    {selectedCity === city && (
                      <LinearGradient
                        colors={["#10B981", "#059669"]}
                        style={styles.cityCheck}
                      >
                        <Text style={{ color: '#FFF', fontSize: 10 }}>✓</Text>
                      </LinearGradient>
                    )}
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={[styles.mainContainer, { width: '100%' }]}>
        <View style={{ flex: 1, width: '100%' }}>
          {screen === "discover" && (
            <DiscoverScreen
              events={events}
              facilities={facilities}
              query={query}
              setQuery={setQuery}
              onSelectEvent={(ev) => { setSelectedEvent(ev); setScreen("event"); }}
              onOpenProfile={() => setScreen("profile")}
              onOpenAllEvents={() => setScreen("events")}
              onOpenGameHub={(sportId) => {
                setGameHubInitialSport(sportId || "all");
                setScreen("gamehub");
              }}
              onSelectFacility={(fac) => {
                setSelectedFacility(fac);
                setScreen("facility-detail");
              }}
              onTabChange={(tab) => setDiscoverTab(tab)}
              initialTab={discoverTab}
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
              onOpenLocation={() => setIsLocationModalVisible(true)}
              onOpenNotifications={() => setIsNotificationsVisible(true)}
              hasNotifications={liveMatches.length > 0}
            />
          )}

          {screen === "events" && (
            <AllEventsScreen
              events={events}
              onBack={() => setScreen("discover")}
              onSelectEvent={(ev) => {
                setSelectedEvent(ev);
                setScreen("event");
              }}
            />
          )}

          {screen === "event" && selectedEvent && (
            <EventDetailScreen
              event={selectedEvent}
              onBack={() => setScreen("discover")}
              onStartBooking={() => setScreen("seats")}
            />
          )}

          {screen === "seats" && selectedEvent && (
            <SeatSelectionScreen
              event={selectedEvent}
              onBack={() => setScreen("event")}
              onConfirm={(seats) => {
                setDraft((prev) => ({ ...prev, qty: seats.length }));
                setScreen("booking");
              }}
            />
          )}

          {screen === "booking" && selectedEvent && (
            <BookingScreen event={selectedEvent} draft={draft} setDraft={setDraft} onContinue={() => setScreen("checkout")} />
          )}

          {screen === "checkout" && (selectedEvent || selectedFacility) && (
            <CheckoutScreen
              event={selectedEvent}
              facility={selectedFacility}
              eventDraft={draft}
              facilityDraft={facilityDraft}
              onUpdateEventDraft={setDraft}
              onUpdateFacilityDraft={setFacilityDraft}
              onComplete={() => {
                const ticket: TicketItem = {
                  id: uid("tk"),
                  bookingId: uid("bk"),
                  eventTitle: isLightMode ? (selectedFacility?.name || "") : (selectedEvent?.title || ""),
                  venue: isLightMode ? (selectedFacility?.location || "") : (selectedEvent?.venue || ""),
                  date: isLightMode ? (facilityDraft?.date || "") : (selectedEvent?.date || ""),
                  qty: isLightMode ? 1 : draft.qty,
                  amount: isLightMode ? (facilityDraft?.price || 0) : ((selectedEvent?.price || 0) * draft.qty),
                  seatZone: isLightMode ? "Facility" : draft.seatZone,
                  paymentMethod: isLightMode ? (facilityDraft?.paymentMethod || "UPI") : draft.paymentMethod,
                  createdAt: new Date().toISOString(),
                };
                setTickets((prev) => [ticket, ...prev]);
                setScreen("tickets");
              }}
            />
          )}

          {screen === "tickets" && <TicketScreen tickets={tickets} onGoToDiscover={() => setScreen("discover")} />}
          {screen === "profile" && (
            <ProfileScreen
              email={user?.email || "guest@bookvibe.in"}
              ticketCount={tickets.length}
              onBackToDiscover={() => setScreen("discover")}
              onOpenTickets={() => setScreen("tickets")}
              onSignOut={async () => {
                await logout();
                setScreen("discover");
              }}
            />
          )}
          {screen === "gamehub" && (
            <GameHubScreen 
              initialSport={gameHubInitialSport} 
              onBack={() => {
                setDiscoverTab("gamehub");
                setScreen("discover");
              }} 
              onSelectFacility={(fac) => {
                setSelectedFacility(fac);
                setScreen("facility-detail");
              }}
              selectedCity={selectedCity}
              onOpenLocation={() => setIsLocationModalVisible(true)}
            />
          )}

          {screen === "facility-detail" && selectedFacility && (
            <VenueDetailScreen
              facility={selectedFacility}
              onBack={() => setScreen("gamehub")}
              onBook={() => setScreen("facility-booking")}
            />
          )}

          {screen === "facility-booking" && selectedFacility && (
            <FacilityBookingScreen
              facility={selectedFacility}
              onBack={() => setScreen("facility-detail")}
              onConfirm={(draft) => {
                setFacilityDraft(draft);
                setScreen("checkout");
              }}
            />
          )}

          {screen === "partner" && <PartnerDashboardScreen />}
        </View>

        {[
          "tickets",
          "profile",
        ].includes(screen) && (
          <View style={styles.navDock}>
            <View style={[styles.matteDock, isLightMode && { backgroundColor: '#FFFFFF', borderColor: 'rgba(0,0,0,0.05)', shadowColor: '#000', shadowOpacity: 0.05 }]}>
              {/* Liquid Slider Indicator */}
              <Animated.View 
                style={[
                  styles.navSliderOffset,
                  { 
                    transform: [{ 
                      translateX: navAnim.interpolate({
                        inputRange: [0, 1, 2],
                        outputRange: [0, (SCREEN_WIDTH - 48) / 3, ((SCREEN_WIDTH - 48) / 3) * 2]
                      }) 
                    }] 
                  }
                ]}
              >
                <View style={[styles.navSlider, isLightMode && { backgroundColor: '#F0FDF4', borderColor: '#34D399' }]} />
              </Animated.View>

              <View style={styles.navRow}>
                <Pressable style={styles.navSideBtn} onPress={() => setScreen("discover")}>
                  <Search
                    size={24}
                    color={screen === "discover" ? (isLightMode ? "#059669" : "#EAEEFF") : (isLightMode ? "rgba(6,95,70,0.3)" : "rgba(220,220,255,0.4)")}
                    strokeWidth={2}
                  />
                </Pressable>

                <Pressable style={styles.navCenterBtn} onPress={() => setScreen("discover")}>
                  <View style={styles.centerIconWrap}>
                    <Sparkles size={24} color={screen === "discover" ? (isLightMode ? "#059669" : "#F3F7FF") : (isLightMode ? "rgba(6,95,70,0.3)" : "rgba(220,220,255,0.4)")} strokeWidth={1.8} />
                  </View>
                  <Text style={[
                    styles.centerLabel,
                    screen !== "discover" ? { color: isLightMode ? "rgba(6,95,70,0.4)" : "rgba(220,220,255,0.4)" } : { color: isLightMode ? "#059669" : "#E9EEF9" }
                  ]}>Home</Text>
                </Pressable>

                <Pressable style={styles.navSideBtn} onPress={() => setScreen("profile")}>
                  <User
                    size={24}
                    color={screen === "profile" ? (isLightMode ? "#059669" : "#EAEEFF") : (isLightMode ? "rgba(6,95,70,0.3)" : "rgba(220,220,255,0.4)")}
                    strokeWidth={2}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainApp />
      </SocketProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0820",
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: {
    height: SCREEN_HEIGHT * 0.8,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: 'rgba(17,24,39,0.1)'
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  modalTitle: { fontSize: 24, color: '#111827', fontFamily: typography.bold },
  modalSubtitle: { fontSize: 14, color: 'rgba(17,24,39,0.6)', fontFamily: typography.secondary, marginTop: 4 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(17,24,39,0.08)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeText: { fontSize: 14, color: '#111827' },
  citySearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.12)'
  },
  citySearchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#111827', fontFamily: typography.secondary },
  cityGroupLabel: { fontSize: 10, color: 'rgba(17,24,39,0.55)', letterSpacing: 2, marginBottom: 16, marginTop: 8, fontFamily: typography.bold },
  popularGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  cityPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.12)'
  },
  cityPillActive: { backgroundColor: "#7C3AED", borderColor: 'transparent' },
  cityPillText: { fontSize: 14, color: 'rgba(17,24,39,0.75)', fontFamily: typography.secondary },
  cityPillTextActive: { color: '#fff', fontFamily: typography.bold },
  cityListCard: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(17,24,39,0.1)' },
  cityListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17,24,39,0.08)'
  },
  cityListText: { fontSize: 16, color: 'rgba(17,24,39,0.85)', fontFamily: typography.secondary },
  cityListTextActive: { color: '#111827', fontFamily: typography.bold },
  cityCheck: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  mainContainer: { flex: 1, width: '100%' },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0F0A1F" },
  masterBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F0A1F',
    overflow: 'hidden'
  },
  navDock: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  matteDock: {
    width: '100%',
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0D0821',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  navSliderOffset: {
    position: 'absolute',
    width: (SCREEN_WIDTH - 48) / 3,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navSlider: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 2,
  },
  navSideBtn: {
    width: 60,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  navCenterBtn: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  centerIconWrap: {
    marginBottom: 0,
  },
  centerLabel: {
    marginTop: 2,
    color: '#059669',
    fontSize: 10,
    fontFamily: typography.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  notiDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#0B0820',
  },
  emptyNotifications: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
    gap: 16,
  },
  emptyNotiText: {
    fontSize: 16,
    fontFamily: typography.primary,
    color: '#94A3B8',
    textAlign: 'center',
  },
  notiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notiIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notiTitle: {
    fontSize: 15,
    fontFamily: typography.bold,
    color: '#0F172A',
  },
  notiBody: {
    fontSize: 12,
    fontFamily: typography.primary,
    color: '#64748B',
    marginTop: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  profileOrb: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1A7AFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
});
