<?php

namespace App\Services\Payments;

use App\Models\Order;
use App\Models\PaymentGatewaySetting;
use Illuminate\Support\Facades\Http;
use Exception;

class MercadoPagoService implements PaymentGatewayInterface
{
    protected function getBaseUrl(string $mode): string
    {
        return 'https://api.mercadopago.com';
    }

    public function createPreference(Order $order, PaymentGatewaySetting $settings): array
    {
        $accessToken = $settings->credentials['access_token'] ?? null;
        
        if (!$accessToken) {
            throw new Exception("Access Token não configurado para Mercado Pago.");
        }

        $items = [];
        foreach ($order->items as $item) {
            $items[] = [
                'title' => $item->product ? $item->product->name : 'Produto Indisponível',
                'quantity' => $item->quantity,
                'currency_id' => 'BRL',
                'unit_price' => (float) $item->unit_price
            ];
        }

        // Add Shipping if exists? (Maybe later)
        if ($order->delivery_fee > 0) {
            $items[] = [
                'title' => 'Taxa de Entrega',
                'quantity' => 1,
                'currency_id' => 'BRL',
                'unit_price' => (float) $order->delivery_fee
            ];
        }

        $payload = [
            'items' => $items,
            'payer' => [
                'name' => $order->customer_name ?? 'Cliente',
                'email' => 'test_user_123@testuser.com', // TODO: Use real customer email
            ],
            'back_urls' => [
                'success' => config('app.frontend_url') . "/checkout/status",
                'failure' => config('app.frontend_url') . "/checkout/status",
                'pending' => config('app.frontend_url') . "/checkout/status",
            ],
            'auto_return' => 'approved',
            'external_reference' => (string) $order->id,
            'statement_descriptor' => 'SWEETSTORE',
        ];

        $response = Http::withToken($accessToken)
            ->post($this->getBaseUrl($settings->mode) . '/checkout/preferences', $payload);

        if ($response->failed()) {
            throw new Exception("Erro ao criar preferência no Mercado Pago: " . $response->body());
        }

        $data = $response->json();

        // For Sandbox, we use sandbox_init_point. For Production, init_point.
        // However, modern MP API might just stick to init_point and rely on the access token type (test vs prod).
        // Let's use init_point but respect mode check if needed.
        $initPoint = $settings->mode === 'sandbox' ? ($data['sandbox_init_point'] ?? $data['init_point']) : $data['init_point'];

        return [
            'type' => 'redirect',
            'data' => $initPoint,
            'preference_id' => $data['id'] ?? null
        ];
    }

    public function getPaymentStatus(string $paymentId, PaymentGatewaySetting $settings): array
    {
        $accessToken = $settings->credentials['access_token'] ?? null;

        if (!$accessToken) {
            throw new Exception("Access Token não configurado.");
        }

        $response = Http::withToken($accessToken)
            ->get($this->getBaseUrl($settings->mode) . "/v1/payments/{$paymentId}");

        if ($response->failed()) {
            throw new Exception("Erro ao consultar pagamento no Mercado Pago: " . $response->body());
        }

        return $response->json();
    }
}
