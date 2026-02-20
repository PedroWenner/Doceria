import 'package:driver_app/features/auth/presentation/login_screen.dart';
import 'package:driver_app/features/dashboard/presentation/dashboard_screen.dart';
import 'package:driver_app/features/order/presentation/order_screen.dart';
import 'package:go_router/go_router.dart';

final appRouter = GoRouter(
  initialLocation: '/login', // Will check auth state later
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const DashboardScreen(),
    ),
    GoRoute(
      path: '/order/:id',
      builder: (context, state) {
        final orderId = state.pathParameters['id']!;
        return OrderScreen(orderId: orderId);
      },
    ),
  ],
);
