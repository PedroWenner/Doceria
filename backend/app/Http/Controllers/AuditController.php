<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use OwenIt\Auditing\Models\Audit;

class AuditController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Audit::with('user')->latest();

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('event')) {
            $query->where('event', $request->event);
        }

        if ($request->filled('auditable_type')) {
            $query->where('auditable_type', 'like', '%' . $request->auditable_type . '%');
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $limit = \App\Models\CompanySetting::first()->pagination_limit ?? 10;
        $audits = $query->paginate($limit);

        return $this->success($audits);
    }
}
