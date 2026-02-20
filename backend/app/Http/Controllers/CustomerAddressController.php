<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CustomerAddressController extends Controller
{
    use \App\Traits\ApiResponse;

    public function index(Request $request)
    {
        $addresses = $request->user()->addresses()->latest()->get();
        return $this->success($addresses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100', // e.g., Casa, Trabalho
            'street' => 'required|string|max:255',
            'number' => 'required|string|max:50',
            'complement' => 'nullable|string|max:100',
            'neighborhood' => 'required|string|max:150',
            'city' => 'required|string|max:150',
            'state' => 'required|string|max:2',
            'zip_code' => 'required|string|max:20',
            'is_default' => 'boolean'
        ]);

        // If this is the first address, or is_default is true, un-default others
        if (!empty($validated['is_default']) || $request->user()->addresses()->count() === 0) {
            $request->user()->addresses()->update(['is_default' => false]);
            $validated['is_default'] = true;
        } else {
            $validated['is_default'] = false;
        }

        // Geocode the address using Nominatim API
        $query = "{$validated['street']}, {$validated['number']} {$validated['neighborhood']}, {$validated['city']} {$validated['state']} {$validated['zip_code']}, Brazil";
        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'User-Agent' => 'Doceria/1.0 (contact@doceria.com)'
            ])->get('https://nominatim.openstreetmap.org/search', [
                'q' => $query,
                'format' => 'json',
                'limit' => 1
            ]);
            
            if ($response->successful() && count($response->json()) > 0) {
                $location = $response->json()[0];
                $validated['latitude'] = $location['lat'];
                $validated['longitude'] = $location['lon'];
            }
        } catch (\Exception $e) {
            // Ignore geocoding errors, we just won't have the coordinates
            \Illuminate\Support\Facades\Log::warning("Geocoding failed for address: " . $e->getMessage());
        }

        $address = $request->user()->addresses()->create($validated);

        return $this->success($address, 'Address created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'street' => 'required|string|max:255',
            'number' => 'required|string|max:50',
            'complement' => 'nullable|string|max:100',
            'neighborhood' => 'required|string|max:150',
            'city' => 'required|string|max:150',
            'state' => 'required|string|max:2',
            'zip_code' => 'required|string|max:20',
            'is_default' => 'boolean'
        ]);

        if (!empty($validated['is_default']) && !$address->is_default) {
            $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        // Geocode the address using Nominatim API if it has changed
        if ($address->street !== $validated['street'] || $address->number !== $validated['number'] || $address->city !== $validated['city'] || $address->zip_code !== $validated['zip_code']) {
            $query = "{$validated['street']}, {$validated['number']} {$validated['neighborhood']}, {$validated['city']} {$validated['state']} {$validated['zip_code']}, Brazil";
            try {
                $response = \Illuminate\Support\Facades\Http::withHeaders([
                    'User-Agent' => 'Doceria/1.0 (contact@doceria.com)'
                ])->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $query,
                    'format' => 'json',
                    'limit' => 1
                ]);
                
                if ($response->successful() && count($response->json()) > 0) {
                    $location = $response->json()[0];
                    $validated['latitude'] = $location['lat'];
                    $validated['longitude'] = $location['lon'];
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning("Geocoding failed for address: " . $e->getMessage());
            }
        }

        $address->update($validated);

        return $this->success($address, 'Address updated successfully');
    }

    public function destroy(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        
        $wasDefault = $address->is_default;
        $address->delete();

        // If we deleted the default, set another one as default if any exist
        if ($wasDefault) {
            $fallback = $request->user()->addresses()->first();
            if ($fallback) {
                $fallback->update(['is_default' => true]);
            }
        }

        return $this->success(null, 'Address deleted successfully');
    }
}
