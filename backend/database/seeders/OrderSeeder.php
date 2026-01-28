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

        // Create 20 orders with deterministic statuses for easier testing
        for ($i = 0; $i < 20; $i++) {
            $deliveryType = $i % 2 === 0 ? 'delivery' : 'pickup'; // Alternates
            
            // Status distribution
            $status = 'pending';
            if ($i > 5) $status = 'preparing';
            if ($i > 10) $status = 'ready'; // Good for testing dispatch
            if ($i > 15) $status = 'delivered';

            $order = Order::create([
                'user_id' => 1, 
                'customer_name' => "Cliente " . ($deliveryType === 'delivery' ? 'Delivery' : 'Retirada') . " " . ($i + 1),
                'customer_phone' => '551199999' . sprintf('%04d', $i),
                'status' => $status,
                'total_amount' => 0, 
                'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                'delivery_type' => $deliveryType,
                'delivery_address' => $deliveryType === 'delivery' ? [
                    'street' => 'Av. Paulista',
                    'number' => 1000 + $i,
                    'neighborhood' => 'Bela Vista',
                    'city' => 'São Paulo',
                    'zip_code' => '01310-100'
                ] : null,
                'courier_name' => ($status === 'delivered' && $deliveryType === 'delivery') ? 'Motoboy Teste' : null,
                'notes' => rand(0, 1) ? 'Capricha no recheio!' : null
            ]);

            $total = 0;
            $itemCount = rand(1, 3);
            for ($j = 0; $j < $itemCount; $j++) {
                $product = $products->random();
                $qty = rand(1, 2);
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
