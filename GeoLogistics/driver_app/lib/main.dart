import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:driver_app/core/theme/app_theme.dart';
import 'package:driver_app/core/router/app_router.dart';

void main() {
  runApp(const ProviderScope(child: GeoLogisticsDriverApp()));
}

class GeoLogisticsDriverApp extends StatelessWidget {
  const GeoLogisticsDriverApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'GeoLogistics Driver',
      theme: AppTheme.light,
      routerConfig: appRouter,
      debugShowCheckedModeBanner: false,
    );
  }
}
