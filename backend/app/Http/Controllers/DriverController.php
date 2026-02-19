<?php

namespace App\Http\Controllers;

use App\Services\GeoLogisticsService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DriverController extends Controller
{
    use ApiResponse;

    protected $geoService;

    public function __construct(GeoLogisticsService $geoService)
    {
        $this->geoService = $geoService;
    }

    public function index()
    {
        try {
            // Filter only OWN_FLEET drivers for this dashboard
            $drivers = $this->geoService->getDrivers(['type' => 'OWN_FLEET']);
            return $this->success($drivers);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch drivers: ' . $e->getMessage());
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:OWN_FLEET,FREELANCER',
        ]);

        // 1. Verify Contract
        if (!$this->geoService->checkContractStatus()) {
            return $this->error('Empresa sem contrato ativo de logística.', 403);
        }

        // 2. Create Driver
        try {
            $driver = $this->geoService->createDriver($request->all());
            return $this->success($driver, 'Driver registered successfully');
        } catch (\Exception $e) {
            Log::error('Driver Registration Failed: ' . $e->getMessage());
            return $this->error('Failed to register driver: ' . $e->getMessage(), 500);
        }
    }
}
