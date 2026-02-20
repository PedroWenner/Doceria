import 'dart:async';
import 'package:flutter_background_geolocation/flutter_background_geolocation.dart'
    as bg;

class TrackingService {
  static Future<void> initialize() async {
    // Fired whenever a location is recorded
    bg.BackgroundGeolocation.onLocation((bg.Location location) {
      print('[location] - $location');
      // Here you would dispatch to a Repository to ping the Node.js backend
      // if the driver is ONLINE:
      // api.patch('/drivers/123/location', data: {lat: location.coords.latitude, lon: location.coords.longitude})
    });

    // Fired whenever state changes ('moving' or 'stationary')
    bg.BackgroundGeolocation.onMotionChange((bg.Location location) {
      print('[motionchange] - $location');
    });

    // Fired whenever the plugin changes provider-state (gps enabled/disabled)
    bg.BackgroundGeolocation.onProviderChange((bg.ProviderChangeEvent event) {
      print('[providerchange] - $event');
    });

    // Configure the plugin
    await bg.BackgroundGeolocation.ready(
      bg.Config(
        desiredAccuracy: bg.Config.DESIRED_ACCURACY_HIGH,
        distanceFilter: 10.0, // Update every 10 meters
        stopOnTerminate:
            false, // Keep running after app is closed (crucial for deliveries)
        startOnBoot: true,
        debug:
            false, // Set true to hear sounds on background events (helps testing)
        logLevel: bg.Config.LOG_LEVEL_VERBOSE,
        reset: true,

        // Android specific Notification customization
        notificationTitle: "GeoLogistics",
        notificationText: "Rastreando localização para entregas",
        notificationColor: "#10B981",
        notificationChannelName: "Tracking",
      ),
    );
  }

  static Future<void> startTracking() async {
    bg.State state = await bg.BackgroundGeolocation.state;
    if (!state.enabled) {
      await bg.BackgroundGeolocation.start();
    }
  }

  static Future<void> stopTracking() async {
    await bg.BackgroundGeolocation.stop();
  }
}
