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

    public function index(Request $request)
    {
        try {
            // Fetch all OWN_FLEET drivers for this dashboard
            $drivers = $this->geoService->getDrivers(['type' => 'OWN_FLEET']);

            if (!is_array($drivers)) {
                $drivers = [];
            }

            // Search Filter
            $search = $request->query('search');
            if (!empty($search)) {
                $drivers = array_filter($drivers, function($d) use ($search) {
                    return stripos($d['name'], $search) !== false;
                });
            }

            // Status Filter
            $status = $request->query('status');
            if (!empty($status) && $status !== 'all') {
                $drivers = array_filter($drivers, function($d) use ($status) {
                    return $d['status'] === $status;
                });
            }

            // Reset array keys after filtering
            $drivers = array_values($drivers);

            // Pagination
            $page = (int) $request->query('page', 1);
            $perPage = (int) $request->query('per_page', 15);
            $total = count($drivers);
            $lastPage = max(1, ceil($total / $perPage));
            $offset = ($page - 1) * $perPage;

            $paginatedData = array_slice($drivers, $offset, $perPage);

            return $this->success([
                'data' => $paginatedData,
                'current_page' => $page,
                'last_page' => $lastPage,
                'total' => $total,
                'per_page' => $perPage
            ]);
        } catch (\Exception $e) {
            return $this->error('Failed to fetch drivers: ' . $e->getMessage(), 500);
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
