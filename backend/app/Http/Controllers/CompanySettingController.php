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
            'auth_token_expiration' => 'nullable|integer|min:5|max:43200',
            'pagination_limit' => 'nullable|integer|min:1|max:100',
            
            // Stock & Operations
            'enable_stock_control' => 'nullable|boolean', 
            'global_min_stock' => 'nullable|integer|min:0',
            
            // Visual
            'logo_url' => 'nullable', 
            'login_bg_url' => 'nullable',
            'welcome_message' => 'nullable|string|max:255',
            
            // Integrations
            'whatsapp_number' => 'nullable|string|max:20',
            'delivery_message' => 'nullable|string'
        ]);
        
        // Handle boolean conversion explicitly for stock control if it comes as string
        if ($request->has('enable_stock_control')) {
            $validated['enable_stock_control'] = filter_var($request->enable_stock_control, FILTER_VALIDATE_BOOLEAN);
        }

        // Handle File Uploads
        if ($request->hasFile('logo_url')) {
            // Delete old file if exists and is not technical URL
            if ($settings->logo_url && \Illuminate\Support\Facades\Storage::disk('public')->exists($settings->logo_url)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($settings->logo_url);
            }
            $path = $request->file('logo_url')->store('settings', 'public');
            $validated['logo_url'] = $path;
        }

        if ($request->hasFile('login_bg_url')) {
            if ($settings->login_bg_url && \Illuminate\Support\Facades\Storage::disk('public')->exists($settings->login_bg_url)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($settings->login_bg_url);
            }
            $path = $request->file('login_bg_url')->store('settings', 'public');
            $validated['login_bg_url'] = $path;
        }

        $settings->update($validated);

        return $this->success($settings, 'Settings updated successfully');
    }
}
