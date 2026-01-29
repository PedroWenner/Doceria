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
            'total_amount' => 'required|numeric',
            'payment_method' => 'required|string',
            'delivery_type' => 'required|string',
            'delivery_address' => 'nullable|array',
            'notes' => 'nullable|json' // Expecting JSON string or handle array if needed, but Checkout sends JSON string per plan? Actually let's accept string or array and cast properly or let model handle it. Model expects casting.
            // Wait, front-end sends `notes` as a JSON string in my plan. But maybe it's cleaner to send objects?
            // "notes": JSON.stringify({...}) in previous code.
            // Let's allow nullable string.
        ]);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($validated, $request) {
            $order = Order::create([
                'user_id' => $request->user()->id,
                'customer_name' => $request->user()->name,
                'customer_phone' => null, // We don't have phone in User yet? Or maybe from profile? Leaving null for now.
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
                    'unit_price' => $item['unit_price']
                ]);
            }

            return $this->success($order->load('items.product'), 'Order created successfully', 201);
        });
    }
}
