<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();
        $statuses = ['pending', 'preparing', 'ready', 'delivered'];
        $paymentMethods = ['Credit Card', 'Pix', 'Cash'];

        if ($products->count() === 0) {
            $this->command->info('No products found, skipping Order Seeder.');
            return;
        }

        // Create 15 orders
        for ($i = 0; $i < 15; $i++) {
            $status = $statuses[array_rand($statuses)];
            
            $order = Order::create([
                'user_id' => 1, // Admin for now, or random
                'customer_name' => 'Customer ' . ($i + 1),
                'status' => $status,
                'total_amount' => 0, // Will update below
                'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                'notes' => rand(0, 1) ? 'Sem cebola' : null
            ]);

            $total = 0;

            // 1 to 4 items per order
            $itemCount = rand(1, 4);
            for ($j = 0; $j < $itemCount; $j++) {
                $product = $products->random();
                $qty = rand(1, 3);
                $price = $product->price;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'unit_price' => $price
                ]);

                $total += $qty * $price;
            }

            $order->update(['total_amount' => $total]);
        }
    }
}
