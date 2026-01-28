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
        $request->validate([
            'status' => 'required|in:pending,preparing,ready,delivered,canceled'
        ]);

        $order->update(['status' => $request->status]);

        return $this->success($order, 'Status updated successfully');
    }
}
