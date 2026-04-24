import React, { useState, useEffect, createContext, useContext } from 'react';
import { StorageKeys, getSecureData, saveSecureData, removeSecureData } from '../lib/storage';
import { apiPost, apiGet } from '../lib/api';

type User = {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'PARTNER' | 'ADMIN';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  skipLogin: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const authDataSerialized = await getSecureData(StorageKeys.AUTH_USER);
      if (authDataSerialized) {
        setUser(JSON.parse(authDataSerialized));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await apiPost<{ user: User; token: string }>('/auth/login', { email, password });
      
      const { user: userData, token } = response;
      await saveSecureData(StorageKeys.AUTH_TOKEN, token);
      await saveSecureData(StorageKeys.AUTH_USER, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await apiPost<{ user: User; token: string }>('/auth/register', { name, email, password });
      
      const { user: userData, token } = response;
      await saveSecureData(StorageKeys.AUTH_TOKEN, token);
      await saveSecureData(StorageKeys.AUTH_USER, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Registration Error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await removeSecureData(StorageKeys.AUTH_TOKEN);
    await removeSecureData(StorageKeys.AUTH_USER);
    setUser(null);
  };

  const skipLogin = () => {
    setUser({ id: 'guest', email: 'guest@bookvibe.in', name: 'Guest', role: 'USER' });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, skipLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
