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
                // Fetch credentials
                $paymentMethod = PaymentMethod::where('slug', 'credit_card')->first();
                
                if (!$paymentMethod || !$paymentMethod->gateway_setting) {
                    Log::error('Webhook: Payment Settings not found.');
                    return response()->json(['error' => 'Settings not found'], 500);
                }

                // Fetch real status from MP
                $paymentData = $this->mercadoPagoService->getPaymentStatus($paymentId, $paymentMethod->gateway_setting);
                
                $orderId = $paymentData['external_reference'] ?? null;
                $status = $paymentData['status'] ?? 'pending';
                $amount = $paymentData['transaction_amount'] ?? 0;
                $method = $paymentData['payment_method_id'] ?? 'unknown';

                // Update or Create Payment Record
                $payment = \App\Models\Payment::updateOrCreate(
                    ['external_id' => $paymentId],
                    [
                        'order_id' => $orderId, // Nullable if not found
                        'method' => $method,
                        'status' => $this->mapStatus($status),
                        'amount' => $amount,
                        'metadata' => $paymentData
                    ]
                );

                Log::info("Payment {$payment->id} updated to {$payment->status}");

                // Sync with Order if exists
                if ($orderId) {
                    $order = Order::find($orderId);
                    if ($order) {
                        // We only update order payment_status if it changed
                        if ($order->payment_status !== $payment->status) {
                            $order->update(['payment_status' => $payment->status]);
                            Log::info("Order {$order->id} payment_status updated to {$payment->status}");
                        }
                    }
                }

                return response()->json(['status' => 'ok']);

            } catch (Exception $e) {
                Log::error("Webhook Error: " . $e->getMessage());
                return response()->json(['error' => $e->getMessage()], 500);
            }
        }

        return response()->json(['status' => 'ignored']);
    }

    private function mapStatus($mpStatus)
    {
        return match ($mpStatus) {
            'approved', 'authorized' => 'paid',
            'in_process', 'pending' => 'pending',
            'rejected', 'cancelled' => 'failed',
            'refunded', 'charged_back' => 'canceled',
            default => 'pending'
        };
    }

    /**
     * Handle GeoLogistics Webhook
     */
    public function handleGeoLogistics(Request $request)
    {
        $payload = $request->all();
        $event = $payload['event'] ?? 'unknown';
        $data = $payload['data'] ?? [];

        Log::info("GeoLogistics Webhook [{$event}]", $data);

        // TODO: Implement logic to update local Order status
        
        return response()->json(['message' => 'Webhook received']);
    }
}
