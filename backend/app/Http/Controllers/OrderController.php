<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use ApiResponse;

    public function index()
    {
        // For Kanban, we usually want all active orders
        // Or we can paginate if too many. Let's return all active for now.
        $orders = Order::with('items.product')->latest()->get();
        return $this->success($orders);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,preparing,ready,delivered,canceled',
            'courier_name' => 'nullable|string'
        ]);

        $updateData = ['status' => $validated['status']];
        
        if (!empty($validated['courier_name'])) {
            $updateData['courier_name'] = $validated['courier_name'];
        }

        $order->update($updateData);

        return $this->success($order, 'Status updated successfully');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric',
            'items.*.observation' => 'nullable|string',
            'total_amount' => 'required|numeric',
            'payment_method' => 'required|string',
            'delivery_type' => 'required|string',
            'delivery_address' => 'nullable|array',
            'notes' => 'nullable|string' 
        ]);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $request) {
            $order = Order::create([
                'user_id' => $request->user()->id,
                'customer_name' => $request->user()->name,
                'customer_phone' => null, 
                'status' => 'pending',
                'total_amount' => $validated['total_amount'],
                'payment_method' => $validated['payment_method'],
                'delivery_type' => $validated['delivery_type'],
                'delivery_address' => $validated['delivery_address'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                \App\Models\OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'observation' => $item['observation'] ?? null
                ]);
            }

            return $this->success($order->load('items.product'), 'Order created successfully', 201);
        });
    }

    /**
     * Verify Payment Status
     * 
     * Manually verifies the payment status with Mercado Pago
     * and updates the order if necessary.
     */
    public function verifyPayment(Request $request, Order $order)
    {
        $paymentId = $request->input('payment_id');

        if (!$paymentId) {
            return $this->error('Payment ID required', 400);
        }

        try {
            // Pick a payment method to get credentials.
            // Assumption: All MP methods share the same credentials (unified form).
            $paymentMethod = \App\Models\PaymentMethod::where('slug', 'carto_de_credito')->first();

            if (!$paymentMethod || !$paymentMethod->gateway_setting) {
                return $this->error('Payment settings not found', 500);
            }

            /** @var \App\Services\Payments\MercadoPagoService $mpService */
            $mpService = app(\App\Services\Payments\MercadoPagoService::class);

            $statusData = $mpService->getPaymentStatus($paymentId, $paymentMethod->gateway_setting);

            $status = $statusData['status'] ?? 'pending';
            $amount = $statusData['transaction_amount'] ?? 0;
            $method = $statusData['payment_method_id'] ?? 'unknown';

            // Update or Create Payment Record
            $payment = \App\Models\Payment::updateOrCreate(
                ['external_id' => $paymentId],
                [
                    'order_id' => $order->id,
                    'method' => $method,
                    'status' => $this->mapStatus($status),
                    'amount' => $amount,
                    'metadata' => $statusData
                ]
            );

            // Update Order Payment Status if changed
            if ($order->payment_status !== $payment->status) {
                $order->update(['payment_status' => $payment->status]);
            }

            return $this->success([
                'order_status' => $order->status,
                'payment_status' => $order->payment_status,
                'payment_id' => $payment->id
            ], 'Payment status verified');

        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
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
    public function myOrders(Request $request)
    {
        $userId = $request->user()->id;

        $orders = Order::where('user_id', $userId)
            ->with(['items.product'])
            ->latest()
            ->get();
        
        return $this->success($orders);
    }
    public function show(Request $request, Order $order)
    {
        // Security: Ensure user owns the order
        if ($request->user() && $order->user_id !== $request->user()->id) {
            return $this->error('Unauthorized', 403);
        }

        // If guest (not logged in), we might strictly need signed URLs or just session checks. 
        // For now, let's assume valid token access.
        
        return $this->success($order->load('items.product'));
    }
}
