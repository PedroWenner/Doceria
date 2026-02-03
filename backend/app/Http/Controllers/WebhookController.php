<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Services\Payments\MercadoPagoService;
use Illuminate\Support\Facades\Log;
use Exception;

class WebhookController extends Controller
{
    protected $mercadoPagoService;

    public function __construct(MercadoPagoService $mercadoPagoService)
    {
        $this->mercadoPagoService = $mercadoPagoService;
    }

    /**
     * Handle Mercado Pago Webhook
     * 
     * Receives 'payment.updated' notifications from Mercado Pago
     * and updates the local Order status.
     * 
     * @unauthenticated
     */
    public function handleMercadoPago(Request $request)
    {
        Log::info('Webhook Mercado Pago received', $request->all());

        $type = $request->input('type');
        $action = $request->input('action');
        
        // Mercado Pago sends 'payment.updated' or simply type='payment'
        if ($type === 'payment' || $action === 'payment.updated') {
            $paymentId = $request->input('data.id') ?? $request->input('id');

            if (!$paymentId) {
                return response()->json(['error' => 'Payment ID not found'], 400);
            }

            try {
                // We need the credentials. Since they are global for Mercado Pago, 
                // we can pick any method that uses MP credentials (e.g., 'carto_de_credito' or 'pix').
                // Ideally, we should check which method was used for the Order, but we don't have the Order ID yet.
                // So we fetch the 'carto_de_credito' method as a "config provider" since they are synced.
                $paymentMethod = PaymentMethod::where('slug', 'carto_de_credito')->first();
                
                if (!$paymentMethod || !$paymentMethod->gateway_setting) {
                    Log::error('Webhook: Payment Settings not found.');
                    return response()->json(['error' => 'Settings not found'], 500);
                }

                // Fetch real status from MP
                $paymentData = $this->mercadoPagoService->getPaymentStatus($paymentId, $paymentMethod->gateway_setting);
                
                $orderId = $paymentData['external_reference'] ?? null;
                $status = $paymentData['status'] ?? null;

                if (!$orderId) {
                    Log::error("Webhook: Order ID (external_reference) not found for payment $paymentId");
                    return response()->json(['error' => 'Order ID not found'], 404);
                }

                $order = Order::find($orderId);
                if (!$order) {
                    Log::error("Webhook: Order $orderId not found");
                    return response()->json(['error' => 'Order not found'], 404);
                }

                // Map MP status to System status
                $newStatus = match ($status) {
                    'approved' => 'paid',
                    'authorized' => 'paid', // Sometimes used for cards
                    'in_process', 'pending' => 'pending',
                    'rejected', 'cancelled' => 'failed',
                    'refunded', 'charged_back' => 'canceled',
                    default => 'pending'
                };

                // Update Order if status changed
                if ($order->status !== $newStatus) {
                    $order->update(['status' => $newStatus]);
                    
                    // If paid, ensure we record the payment method used if not already
                    // (Optional logic here)
                    
                    Log::info("Webhook: Order $orderId updated to $newStatus");
                }

                return response()->json(['status' => 'ok']);

            } catch (Exception $e) {
                Log::error("Webhook Error: " . $e->getMessage());
                return response()->json(['error' => $e->getMessage()], 500);
            }
        }

        return response()->json(['status' => 'ignored']);
    }
}
