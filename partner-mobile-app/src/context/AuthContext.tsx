import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import apiClient from '../api/client';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  partnerType?: string | null;
  eventHostId?: string | null;
  managedFacilities?: { id: string; name: string }[];
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  activePortal: 'EVENT' | 'VENUE' | null;
  isLoading: boolean;
  signIn: (token: string, userData: User) => Promise<void>;
  signOut: () => Promise<void>;
  setPortal: (portal: 'EVENT' | 'VENUE') => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Derives the portal mode from the user's explicit assignments.
 * eventHostId → 'EVENT', managedFacilities → 'VENUE'
 */
function derivePortal(user: User): 'EVENT' | 'VENUE' | null {
  if (user.eventHostId) return 'EVENT';
  if (user.managedFacilities && user.managedFacilities.length > 0) return 'VENUE';

  // Fallback for legacy compatibility
  if (user.partnerType === 'EVENT_HOST') return 'EVENT';
  if (user.partnerType === 'VENUE_OWNER') return 'VENUE';
  
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activePortal, setActivePortalState] = useState<'EVENT' | 'VENUE' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await storage.getItem('partner_token');
      const storedUser = await storage.getItem('partner_user');
      
      if (storedToken && storedUser) {
        const parsed = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsed);

        // Derive portal from explicit data or partnerType
        const portal = derivePortal(parsed);
        if (portal) {
          setActivePortalState(portal);
        } else {
          // Fallback: try cached portal for legacy/admin accounts
          const storedPortal = await storage.getItem('partner_portal');
          if (storedPortal === 'EVENT' || storedPortal === 'VENUE') {
            setActivePortalState(storedPortal);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load auth state', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(newToken: string, userData: User) {
    if (userData.role !== 'PARTNER' && userData.role !== 'ADMIN') {
      throw new Error('Access denied. Partner account required.');
    }
    
    await storage.setItem('partner_token', newToken);
    await storage.setItem('partner_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    // Automatically set portal from explicit data or partnerType
    const portal = derivePortal(userData);
    if (portal) {
      await storage.setItem('partner_portal', portal);
      setActivePortalState(portal);
    }
    // If no partnerType (e.g. ADMIN user), they'll hit the select-portal screen
  }

  async function setPortal(portal: 'EVENT' | 'VENUE') {
    await storage.setItem('partner_portal', portal);
    setActivePortalState(portal);
  }

  async function signOut() {
    await storage.deleteItem('partner_token');
    await storage.deleteItem('partner_user');
    await storage.deleteItem('partner_portal');
    setToken(null);
    setUser(null);
    setActivePortalState(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, activePortal, isLoading, signIn, signOut, setPortal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
