"use client";
import React, { createContext, useContext, useState } from "react";

export const LOCATIONS = [
  { id: 1, city: "Mumbai", detail: "Maharashtra", lat: 19.0760, lon: 72.8777 },
  { id: 2, city: "Delhi", detail: "National Capital Region", lat: 28.6139, lon: 77.2090 },
  { id: 3, city: "Bangalore", detail: "Karnataka", lat: 12.9716, lon: 77.5946 },
  { id: 4, city: "Hyderabad", detail: "Telangana", lat: 17.3850, lon: 78.4867 },
  { id: 5, city: "Chennai", detail: "Tamil Nadu", lat: 13.0827, lon: 80.2707 },
  { id: 6, city: "Kolkata", detail: "West Bengal", lat: 22.5726, lon: 88.3639 },
  { id: 7, city: "Pune", detail: "Maharashtra", lat: 18.5204, lon: 73.8567 },
  { id: 8, city: "Ahmedabad", detail: "Gujarat", lat: 23.0225, lon: 72.5714 },
  { id: 9, city: "Jaipur", detail: "Rajasthan", lat: 26.9124, lon: 75.7873 },
  { id: 10, city: "Surat", detail: "Gujarat", lat: 21.1702, lon: 72.8311 },
  { id: 11, city: "Lucknow", detail: "Uttar Pradesh", lat: 26.8467, lon: 80.9462 },
  { id: 12, city: "Kanpur", detail: "Uttar Pradesh", lat: 26.4499, lon: 80.3319 },
  { id: 13, city: "Nagpur", detail: "Maharashtra", lat: 21.1458, lon: 79.0882 },
  { id: 14, city: "Indore", detail: "Madhya Pradesh", lat: 22.7196, lon: 75.8577 },
  { id: 15, city: "Thane", detail: "Maharashtra", lat: 19.2183, lon: 72.9781 },
  { id: 16, city: "Bhopal", detail: "Madhya Pradesh", lat: 23.2599, lon: 77.4126 },
  { id: 17, city: "Visakhapatnam", detail: "Andhra Pradesh", lat: 17.6868, lon: 83.2185 },
  { id: 18, city: "Pimpri-Chinchwad", detail: "Maharashtra", lat: 18.6298, lon: 73.7997 },
  { id: 19, city: "Patna", detail: "Bihar", lat: 25.5941, lon: 85.1376 },
  { id: 20, city: "Vadodara", detail: "Gujarat", lat: 22.3072, lon: 73.1812 },
  { id: 21, city: "Ghaziabad", detail: "Uttar Pradesh", lat: 28.6692, lon: 77.4538 },
  { id: 22, city: "Ludhiana", detail: "Punjab", lat: 30.9010, lon: 75.8573 },
  { id: 23, city: "Agra", detail: "Uttar Pradesh", lat: 27.1767, lon: 78.0081 },
  { id: 24, city: "Nashik", detail: "Maharashtra", lat: 19.9975, lon: 73.7898 },
  { id: 25, city: "Faridabad", detail: "Haryana", lat: 28.4089, lon: 77.3178 },
  { id: 26, city: "Meerut", detail: "Uttar Pradesh", lat: 28.9845, lon: 77.7064 },
  { id: 27, city: "Rajkot", detail: "Gujarat", lat: 22.3039, lon: 70.8022 },
  { id: 28, city: "Kalyan-Dombivli", detail: "Maharashtra", lat: 19.2403, lon: 73.1305 },
  { id: 29, city: "Vasai-Virar", detail: "Maharashtra", lat: 19.4258, lon: 72.8225 },
  { id: 30, city: "Varanasi", detail: "Uttar Pradesh", lat: 25.3176, lon: 82.9739 },
  { id: 31, city: "Srinagar", detail: "Jammu and Kashmir", lat: 34.0837, lon: 74.7973 },
  { id: 32, city: "Aurangabad", detail: "Maharashtra", lat: 19.8762, lon: 75.3433 },
  { id: 33, city: "Dhanbad", detail: "Jharkhand", lat: 23.7957, lon: 86.4304 },
  { id: 34, city: "Amritsar", detail: "Punjab", lat: 31.6340, lon: 74.8723 },
  { id: 35, city: "Navi Mumbai", detail: "Maharashtra", lat: 19.0330, lon: 73.0297 },
  { id: 36, city: "Allahabad", detail: "Uttar Pradesh", lat: 25.4358, lon: 81.8463 },
  { id: 37, city: "Ranchi", detail: "Jharkhand", lat: 23.3441, lon: 85.3096 },
  { id: 38, city: "Howrah", detail: "West Bengal", lat: 22.5958, lon: 88.2636 },
  { id: 39, city: "Coimbatore", detail: "Tamil Nadu", lat: 11.0168, lon: 76.9558 },
  { id: 40, city: "Jabalpur", detail: "Madhya Pradesh", lat: 23.1815, lon: 79.9864 },
  { id: 41, city: "Gwalior", detail: "Madhya Pradesh", lat: 26.2124, lon: 78.1772 },
  { id: 42, city: "Vijayawada", detail: "Andhra Pradesh", lat: 16.5062, lon: 80.6480 },
  { id: 43, city: "Jodhpur", detail: "Rajasthan", lat: 26.2389, lon: 73.0243 },
  { id: 44, city: "Madurai", detail: "Tamil Nadu", lat: 9.9252, lon: 78.1198 },
  { id: 45, city: "Raipur", detail: "Chhattisgarh", lat: 21.2514, lon: 81.6296 },
  { id: 46, city: "Kota", detail: "Rajasthan", lat: 25.2138, lon: 75.8648 },
  { id: 47, city: "Guwahati", detail: "Assam", lat: 26.1445, lon: 91.7362 },
  { id: 48, city: "Chandigarh", detail: "Chandigarh", lat: 30.7333, lon: 76.7794 },
  { id: 49, city: "Solapur", detail: "Maharashtra", lat: 17.6599, lon: 75.9064 },
  { id: 50, city: "Hubli-Dharwad", detail: "Karnataka", lat: 15.3647, lon: 75.1240 },
  { id: 51, city: "Vaddeswaram", detail: "Andhra Pradesh", lat: 16.4419, lon: 80.6226 },
];

export type LocationType = typeof LOCATIONS[0];

interface LocationContextType {
  selectedLocation: LocationType;
  setSelectedLocation: (loc: LocationType) => void;
  detectLocation: () => Promise<void>;
  isDetecting: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<LocationType>(LOCATIONS[0]);
  const [isDetecting, setIsDetecting] = useState(false);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Detected coordinates: ${latitude}, ${longitude}`);
        
        let closestCity = LOCATIONS[0];
        let minDistance = Infinity;

        LOCATIONS.forEach(loc => {
          if (loc.lat && loc.lon) {
            const dist = calculateDistance(latitude, longitude, loc.lat, loc.lon);
            if (dist < minDistance) {
              minDistance = dist;
              closestCity = loc;
            }
          }
        });

        console.log(`Matched to closest city: ${closestCity.city}`);
        setSelectedLocation(closestCity);
        setIsDetecting(false);
      },
      (error) => {
        console.error("Geolocation Error details:", {
          code: error.code,
          message: error.message
        });
        
        let errorMsg = "Unable to retrieve your location.";
        if (error.code === 1) errorMsg = "Location permission denied. Please allow location access in your browser settings.";
        else if (error.code === 2) errorMsg = "Location information is unavailable.";
        else if (error.code === 3) errorMsg = "Location request timed out.";
        
        alert(errorMsg);
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <LocationContext.Provider value={{ selectedLocation, setSelectedLocation, detectLocation, isDetecting }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocation must be used within LocationProvider");
  return context;
}
