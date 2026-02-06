<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PaymentMethod;

class PaymentMethodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $methods = [
            [
                'name' => 'Cartão de Crédito',
                'slug' => 'credit_card',
                'is_active' => true,
            ],
            [
                'name' => 'Pix',
                'slug' => 'pix',
                'is_active' => true,
            ],
            [
                'name' => 'Boleto Bancário',
                'slug' => 'boleto',
                'is_active' => true,
            ],
        ];

        foreach ($methods as $method) {
            PaymentMethod::updateOrCreate(
                ['slug' => $method['slug']],
                $method
            );
        }
    }
}
