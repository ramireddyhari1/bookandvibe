import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Modern Storage Utility for Book & Vibe
 * Uses SecureStore for sensitive data (PII, Tokens)
 * Uses AsyncStorage for non-sensitive data (Preferences, UI state)
 */

export const StorageKeys = {
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',
  SELECTED_CITY: 'selectedCity',
};

export const saveSecureData = async (key: string, value: string) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Error saving secure data for key ${key}:`, error);
  }
};

export const getSecureData = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Error retrieving secure data for key ${key}:`, error);
    return null;
  }
};

export const removeSecureData = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Error removing secure data for key ${key}:`, error);
  }
};

export const savePublicData = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error saving public data for key ${key}:`, error);
  }
};

export const getPublicData = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Error retrieving public data for key ${key}:`, error);
    return null;
  }
};
