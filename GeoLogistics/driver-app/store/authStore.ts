import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface Driver {
    id: string;
    tenant_id: string;
    name: string;
    phone: string;
    vehicle_type: string;
    status: string;
    is_active: boolean;
}

interface AuthState {
    driver: Driver | null;
    token: string | null;
    isLoading: boolean;
    setAuth: (driver: Driver, token: string) => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => Promise<void>;
}

const TOKEN_KEY = 'geo_driver_token';
const DRIVER_KEY = 'geo_driver_data';

export const useAuthStore = create<AuthState>((set) => ({
    driver: null,
    token: null,
    isLoading: true,
    setAuth: async (driver, token) => {
        try {
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            await SecureStore.setItemAsync(DRIVER_KEY, JSON.stringify(driver));
            set({ driver, token });
        } catch (e) {
            console.error('Error saving auth state', e);
        }
    },
    logout: async () => {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(DRIVER_KEY);
            set({ driver: null, token: null });
        } catch (e) {
            console.error('Error clearing auth state', e);
        }
    },
    initialize: async () => {
        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            const driverStr = await SecureStore.getItemAsync(DRIVER_KEY);
            if (token && driverStr) {
                set({ token, driver: JSON.parse(driverStr), isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch (e) {
            console.error('Error initializing auth state', e);
            set({ isLoading: false });
        }
    },
}));
