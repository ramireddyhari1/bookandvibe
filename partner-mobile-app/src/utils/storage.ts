import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * A platform-agnostic storage utility.
 * Uses SecureStore on iOS/Android for better security.
 * Falls back to LocalStorage on Web/Windows because SecureStore is not supported there.
 */
export const storage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('LocalStorage failed:', e);
      }
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.error('LocalStorage failed:', e);
        return null;
      }
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },

  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('LocalStorage failed:', e);
      }
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};
