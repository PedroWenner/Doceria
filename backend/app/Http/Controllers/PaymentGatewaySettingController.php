<?php

namespace App\Http\Controllers;

use App\Models\PaymentGatewaySetting;
use App\Models\PaymentMethod;
use App\Traits\ApiResponse;

class PaymentGatewaySettingController extends Controller
{
    use ApiResponse;

    /**
     * List all settings (grouped by payment method)
     */
    public function index()
    {
        // Get all payment methods that support gateway configuration
        // For now, we return all, or we could filter by specific slugs if needed
        $methods = PaymentMethod::with('gatewaySetting')->get();

        return $this->successResponse($methods);
    }

    /**
     * Update or Create settings for a specific payment method
     */
    public function update(Request $request, $methodId)
    {
        $method = PaymentMethod::findOrFail($methodId);

        $validated = $request->validate([
            'mode' => 'required|in:sandbox,production',
            'is_active' => 'boolean',
            'credentials' => 'nullable|array',
        ]);

        $setting = PaymentGatewaySetting::updateOrCreate(
            ['payment_method_id' => $method->id],
            [
                'mode' => $validated['mode'],
                'is_active' => $validated['is_active'],
                'credentials' => $validated['credentials'] ?? [],
            ]
        );

        return $this->successResponse($setting, 'Configurações salvas com sucesso!');
    }
}
