<?php

namespace App\Http\Controllers;

use App\Models\PaymentGatewaySetting;
use App\Models\PaymentMethod;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

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

        return $this->success($methods);
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
                'credentials' => array_map(function($value) {
                    return is_string($value) ? trim($value) : $value;
                }, $validated['credentials'] ?? []),
            ]
        );

        // Sync parent status
        if (isset($validated['is_active'])) {
            $method->update(['is_active' => $validated['is_active']]);
        }

        return $this->success($setting, 'Configurações salvas com sucesso!');
    }
}
