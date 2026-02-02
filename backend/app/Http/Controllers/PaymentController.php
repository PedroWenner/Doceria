<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\PaymentMethod;
use App\Services\Payments\MercadoPagoService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Exception;

class PaymentController extends Controller
{
    use ApiResponse;

    /**
     * Process payment for an order.
     */
    public function store(Request $request, $orderId)
    {
        $order = Order::findOrFail($orderId);

        // Prevent double payment
        if ($order->status === 'paid' || $order->status === 'delivered') {
            return $this->error('Pedido já pago ou finalizado.', 400);
        }

        // Find Payment Method from Order's payment_method string (slug matches?)
        // In our current Order table we store "payment_method" as string ("credit_card", "pix").
        // We need to find the corresponding PaymentMethod model to get settings.
        
        // Assumption: The string in orders table matches the slug in payment_methods table.
        // Or we might need to map them. Let's assume slug match for now.
        $methodSlug = $order->payment_method; 
        
        $paymentMethod = PaymentMethod::where('slug', $methodSlug)->first();

        if (!$paymentMethod) {
            // Fallback or specific heuristic if slug doesn't match exactly
            // For now, let's try to find by similarity or return error
            // Actually, frontend sends "credit_card" or "pix".
            // Let's assume we have payment methods with these slugs.
             return $this->error("Método de pagamento não encontrado: {$methodSlug}", 404);
        }

        // Get Gateway Settings
        $settings = $paymentMethod->gatewaySetting;

        if (!$settings || !$settings->is_active) {
            return $this->error('Configuração de pagamento indisponível para este método.', 400);
        }

        try {
            // Simple Factory for now. 
            // If we have more gateways later, we can move this to a dedicated Factory class.
            $service = null;

            if (str_contains($methodSlug, 'mercadopago') || str_contains($methodSlug, 'pix') || str_contains($methodSlug, 'card')) {
                // Assuming Mercado Pago handles Pix and Cards for now if associated
                // Check if it's really Mercado Pago based on settings or name?
                // For this implementation, we default to MercadoPagoService for these types if settings exist.
                $service = new MercadoPagoService();
            }

            if (!$service) {
                return $this->error('Serviço de pagamento não implementado para este método.', 501);
            }

            $response = $service->createPreference($order, $settings);

            // Update Order with transaction info if available
            if (isset($response['preference_id'])) {
                $order->transaction_id = $response['preference_id'];
                $order->save();
            }

            return $this->success($response);

        } catch (Exception $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                // 'trace' => $e->getTraceAsString() // Maybe too much for prod but good for debug
            ], 500);
        }
    }
}
