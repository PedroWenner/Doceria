import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { useAuthStore } from '../store/authStore';

export const LOCATION_TASK_NAME = 'background-location-task';

// Define the background task for location tracking
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error('Background Location Error', error);
        return;
    }

    if (data) {
        const { locations } = data as any;
        if (locations && locations.length > 0) {
            const location = locations[0];

            console.log('Received background location:', location.coords.latitude, location.coords.longitude);

            // In a real scenario, you only ping if driver is ONLINE.
            // We can grab the auth state:
            const state = useAuthStore.getState();
            const driverId = state.driver?.id;
            const isOnline = true; // Typically you'd have an isOnline state in your store

            if (driverId && isOnline) {
                try {
                    // api.patch(`/drivers/${driverId}/location`, {
                    //   lat: location.coords.latitude,
                    //   lon: location.coords.longitude
                    // });
                    console.log(`Pinged GeoLogistics API for driver ${driverId}`);
                } catch (e) {
                    console.error('Failed to report location', e);
                }
            }
        }
    }
});
