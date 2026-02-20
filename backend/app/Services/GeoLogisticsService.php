<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeoLogisticsService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = env('GEOLOGISTICS_BASE_URL', 'http://localhost:3001');
        
        $setting = \App\Models\CompanySetting::first();
        if ($setting) {
            $this->apiKey = $setting->geologistics_api_key ?? '';
        } else {
            $this->apiKey = '';
        }
    }

    protected function client()
    {
        if (empty($this->apiKey)) {
            // Se a chave não estiver configurada ou a rotina não estiver em uso,
            // podemos retornar uma instância que falha propositalmente ou deixar a requisição seguir sem chave.
            // Para manter a coerência caso haja erro de contrato:
        }

        return Http::withHeaders([
            'x-api-key' => $this->apiKey,
            'Content-Type' => 'application/json',
        ])->baseUrl($this->baseUrl);
    }

    /**
     * Create a new order in GeoLogistics
     *
     * @param array $data {
     *   tenant_id: string,
     *   pickup_lat: number,
     *   pickup_lon: number,
     *   pickup_address?: string,
     *   dropoff_lat: number,
     *   dropoff_lon: number,
     *   dropoff_address?: string
     * }
     */
    public function createOrder(array $data)
    {
        $response = $this->client()->post('/orders', $data);
        
        if ($response->failed()) {
            throw new \Exception('Failed to create order: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Get all drivers
     */
    public function getDrivers(array $params = [])
    {
        return $this->client()->get('/drivers', $params)->json();
    }

    /**
     * Check if the tenant has an active contract (valid API Key)
     */
    public function checkContractStatus()
    {
        try {
            // Check if we can find the tenant by the configured API Key
            $response = $this->client()->get('/tenants', [
                'api_key' => $this->apiKey
            ]);

            if ($response->successful()) {
                $tenants = $response->json();
                return is_array($tenants) && count($tenants) > 0;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Register a new driver in GeoLogistics
     */
    public function createDriver(array $data)
    {
        $response = $this->client()->post('/drivers', $data);

        if ($response->failed()) {
            throw new \Exception('Failed to register driver in GeoLogistics: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Get the tenant info associated with the API Key
     */
    public function getTenant()
    {
        $response = $this->client()->get('/tenants', [
            'api_key' => $this->apiKey
        ]);

        if ($response->successful()) {
            $tenants = $response->json();
            if (is_array($tenants) && count($tenants) > 0) {
                return $tenants[0]; // Returning the first matched tenant
            }
        }
        return null;
    }

    /**
     * Estimate shipping cost
     */
    public function estimate(float $pLat, float $pLon, float $dLat, float $dLon)
    {
        $tenant = $this->getTenant();
        if (!$tenant) {
            throw new \Exception('Tenant configuration missing or invalid API Key.');
        }

        return $this->client()->get('/routing/estimate', [
            'tenantId' => $tenant['id'],
            'originLat' => $pLat,
            'originLon' => $pLon,
            'destLat' => $dLat,
            'destLon' => $dLon,
        ])->json();
    }
}
