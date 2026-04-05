"use client";
import React, { createContext, useContext, useState } from "react";

export const LOCATIONS = [
  { id: 1, city: "Mumbai", detail: "Maharashtra" },
  { id: 2, city: "Delhi", detail: "National Capital Region" },
  { id: 3, city: "Bangalore", detail: "Karnataka" },
  { id: 4, city: "Hyderabad", detail: "Telangana" },
  { id: 5, city: "Chennai", detail: "Tamil Nadu" },
  { id: 6, city: "Kolkata", detail: "West Bengal" },
  { id: 7, city: "Pune", detail: "Maharashtra" },
  { id: 8, city: "Ahmedabad", detail: "Gujarat" },
  { id: 9, city: "Jaipur", detail: "Rajasthan" },
  { id: 10, city: "Surat", detail: "Gujarat" },
  { id: 11, city: "Lucknow", detail: "Uttar Pradesh" },
  { id: 12, city: "Kanpur", detail: "Uttar Pradesh" },
  { id: 13, city: "Nagpur", detail: "Maharashtra" },
  { id: 14, city: "Indore", detail: "Madhya Pradesh" },
  { id: 15, city: "Thane", detail: "Maharashtra" },
  { id: 16, city: "Bhopal", detail: "Madhya Pradesh" },
  { id: 17, city: "Visakhapatnam", detail: "Andhra Pradesh" },
  { id: 18, city: "Pimpri-Chinchwad", detail: "Maharashtra" },
  { id: 19, city: "Patna", detail: "Bihar" },
  { id: 20, city: "Vadodara", detail: "Gujarat" },
  { id: 21, city: "Ghaziabad", detail: "Uttar Pradesh" },
  { id: 22, city: "Ludhiana", detail: "Punjab" },
  { id: 23, city: "Agra", detail: "Uttar Pradesh" },
  { id: 24, city: "Nashik", detail: "Maharashtra" },
  { id: 25, city: "Faridabad", detail: "Haryana" },
  { id: 26, city: "Meerut", detail: "Uttar Pradesh" },
  { id: 27, city: "Rajkot", detail: "Gujarat" },
  { id: 28, city: "Kalyan-Dombivli", detail: "Maharashtra" },
  { id: 29, city: "Vasai-Virar", detail: "Maharashtra" },
  { id: 30, city: "Varanasi", detail: "Uttar Pradesh" },
  { id: 31, city: "Srinagar", detail: "Jammu and Kashmir" },
  { id: 32, city: "Aurangabad", detail: "Maharashtra" },
  { id: 33, city: "Dhanbad", detail: "Jharkhand" },
  { id: 34, city: "Amritsar", detail: "Punjab" },
  { id: 35, city: "Navi Mumbai", detail: "Maharashtra" },
  { id: 36, city: "Allahabad", detail: "Uttar Pradesh" },
  { id: 37, city: "Ranchi", detail: "Jharkhand" },
  { id: 38, city: "Howrah", detail: "West Bengal" },
  { id: 39, city: "Coimbatore", detail: "Tamil Nadu" },
  { id: 40, city: "Jabalpur", detail: "Madhya Pradesh" },
  { id: 41, city: "Gwalior", detail: "Madhya Pradesh" },
  { id: 42, city: "Vijayawada", detail: "Andhra Pradesh" },
  { id: 43, city: "Jodhpur", detail: "Rajasthan" },
  { id: 44, city: "Madurai", detail: "Tamil Nadu" },
  { id: 45, city: "Raipur", detail: "Chhattisgarh" },
  { id: 46, city: "Kota", detail: "Rajasthan" },
  { id: 47, city: "Guwahati", detail: "Assam" },
  { id: 48, city: "Chandigarh", detail: "Chandigarh" },
  { id: 49, city: "Solapur", detail: "Maharashtra" },
  { id: 50, city: "Hubli-Dharwad", detail: "Karnataka" },
  { id: 51, city: "Vaddeswaram", detail: "Andhra Pradesh" },
];

export type LocationType = typeof LOCATIONS[0];

interface LocationContextType {
  selectedLocation: LocationType;
  setSelectedLocation: (loc: LocationType) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<LocationType>(LOCATIONS[0]);

  return (
    <LocationContext.Provider value={{ selectedLocation, setSelectedLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocation must be used within LocationProvider");
  return context;
}
