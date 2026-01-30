<?php

namespace App\Services\Payments;

use App\Models\Order;
use App\Models\PaymentGatewaySetting;
use Illuminate\Http\Request;

interface PaymentGatewayInterface
{
    /**
     * Create a payment preference or payload.
     * 
     * @param Order $order
     * @param PaymentGatewaySetting $settings
     * @return array { 'type': 'redirect'|'payload', 'data': string }
     */
    public function createPreference(Order $order, PaymentGatewaySetting $settings): array;
}
