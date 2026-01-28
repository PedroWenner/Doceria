<?php

namespace App\Http\Controllers;

use App\Models\CompanySetting;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class CompanySettingController extends Controller
{
    use ApiResponse;

    public function show()
    {
        $settings = CompanySetting::firstOrCreate(
            ['id' => 1],
            ['system_name' => 'SweetStore']
        );
        return $this->success($settings);
    }

    public function update(Request $request)
    {
        $settings = CompanySetting::firstOrFail();

        $validated = $request->validate([
            'system_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'brand_color' => 'nullable|string|max:20',
            'cnpj' => 'nullable|string|max:20',
            'state_registration' => 'nullable|string|max:50',
            'municipal_registration' => 'nullable|string|max:50',
            'fiscal_regime' => 'nullable|string|max:100',
            'street' => 'nullable|string|max:255',
            'number' => 'nullable|string|max:20',
            'neighborhood' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:2',
            'zip_code' => 'nullable|string|max:20',
            'orders_refresh_rate' => 'nullable|integer|min:10|max:3600',
            'auth_token_expiration' => 'nullable|integer|min:5|max:43200'
        ]);

        $settings->update($validated);

        return $this->success($settings, 'Settings updated successfully');
    }
}
