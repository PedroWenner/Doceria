<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeoLogisticsService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = env('GEOLOGISTICS_BASE_URL');
        $this->apiKey = env('GEOLOGISTICS_API_KEY');
    }

    protected function client()
    {
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
     * Estimate shipping cost
     */
    public function estimate(float $pLat, float $pLon, float $dLat, float $dLon)
    {
        return $this->client()->get('/routing/estimate', [
            'origin_lat' => $pLat,
            'origin_lon' => $pLon,
            'dest_lat' => $dLat,
            'dest_lon' => $dLon,
        ])->json();
    }
}
