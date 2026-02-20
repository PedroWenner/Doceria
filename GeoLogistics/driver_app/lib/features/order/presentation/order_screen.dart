import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

enum OrderStatus {
  pending,
  accepted,
  enRouteToStore,
  enRouteToCustomer,
  delivered,
}

class OrderScreen extends StatefulWidget {
  final String orderId;
  const OrderScreen({super.key, required this.orderId});

  @override
  State<OrderScreen> createState() => _OrderScreenState();
}

class _OrderScreenState extends State<OrderScreen> {
  OrderStatus _status = OrderStatus.pending;
  bool _isLoading = false;

  void _updateStatus(OrderStatus newStatus) async {
    setState(() => _isLoading = true);

    // Mock API call
    await Future.delayed(const Duration(seconds: 1));

    setState(() {
      _status = newStatus;
      _isLoading = false;
    });

    if (newStatus == OrderStatus.delivered && mounted) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Sucesso'),
          content: const Text('Entrega finalizada com sucesso!'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                context.pop();
              },
              child: const Text('OK'),
            ),
          ],
        ),
      );
    }
  }

  Widget _buildActionButton() {
    if (_isLoading) {
      return Container(
        height: 64,
        decoration: BoxDecoration(
          color: Colors.grey.shade400,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Center(
          child: CircularProgressIndicator(color: Colors.white),
        ),
      );
    }

    switch (_status) {
      case OrderStatus.pending:
        return _ActionButton(
          label: 'Aceitar Corrida',
          icon: Icons.check_circle_outline,
          color: const Color(0xFF10B981),
          onTap: () => _updateStatus(OrderStatus.accepted),
        );
      case OrderStatus.accepted:
        return _ActionButton(
          label: 'A caminho da Loja',
          icon: Icons.navigation,
          color: const Color(0xFF3B82F6),
          onTap: () => _updateStatus(OrderStatus.enRouteToStore),
        );
      case OrderStatus.enRouteToStore:
        return _ActionButton(
          label: 'Pacote Coletado',
          icon: Icons.inventory_2,
          color: const Color(0xFF3B82F6),
          onTap: () => _updateStatus(OrderStatus.enRouteToCustomer),
        );
      case OrderStatus.enRouteToCustomer:
        return _ActionButton(
          label: 'Entregue ao Cliente',
          icon: Icons.location_on,
          color: const Color(0xFF0F172A),
          onTap: () => _updateStatus(OrderStatus.delivered),
        );
      case OrderStatus.delivered:
        return const SizedBox.shrink();
    }
  }

  String _getStatusText() {
    switch (_status) {
      case OrderStatus.pending:
        return 'NÃO ACEITA';
      case OrderStatus.accepted:
        return 'AGUARDANDO DESLOCAMENTO';
      case OrderStatus.enRouteToStore:
        return 'INDO PARA A LOJA';
      case OrderStatus.enRouteToCustomer:
        return 'INDO PARA O CLIENTE';
      case OrderStatus.delivered:
        return 'FINALIZADA';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: Text('Pedido #${widget.orderId.split('-').last}')),
      body: Column(
        children: [
          // Map Placeholder
          Container(
            height: 250,
            color: Colors.grey.shade200,
            child: const Center(
              child: Text(
                'Mapa interativo (flutter_map) vem aqui',
                style: TextStyle(color: Colors.grey),
              ),
            ),
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      _getStatusText(),
                      style: const TextStyle(
                        color: Colors.blue,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Valor a receber',
                        style: TextStyle(fontSize: 16, color: Colors.grey),
                      ),
                      Text(
                        'R\$ 15.50',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: Theme.of(context).colorScheme.secondary,
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 40),

                  const _AddressBlock(
                    title: 'Local de Coleta',
                    address: 'Doceria - Endereço Principal, 100',
                    icon: Icons.inventory_2,
                    iconColor: Color(0xFF0F172A),
                  ),
                  const SizedBox(height: 24),
                  const _AddressBlock(
                    title: 'Local de Entrega',
                    address: 'Rua do Cliente, 400',
                    icon: Icons.location_on,
                    iconColor: Colors.red,
                  ),

                  const SizedBox(height: 24),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Center(
                      child: Column(
                        children: [
                          Text(
                            'Distância Total',
                            style: TextStyle(fontSize: 14, color: Colors.grey),
                          ),
                          SizedBox(height: 4),
                          Text(
                            '3.2 km',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Color(0xFFF1F5F9))),
            ),
            child: SafeArea(child: _buildActionButton()),
          ),
        ],
      ),
    );
  }
}

class _AddressBlock extends StatelessWidget {
  final String title;
  final String address;
  final IconData icon;
  final Color iconColor;

  const _AddressBlock({
    required this.title,
    required this.address,
    required this.icon,
    required this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 20, color: iconColor),
            const SizedBox(width: 8),
            Text(
              title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        Padding(
          padding: const EdgeInsets.only(left: 28, top: 4),
          child: Text(
            address,
            style: const TextStyle(
              fontSize: 15,
              color: Colors.black87,
              height: 1.5,
            ),
          ),
        ),
      ],
    );
  }
}

class _ActionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ActionButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        height: 64, // Large touch area
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.15),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 24),
            const SizedBox(width: 12),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
