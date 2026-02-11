<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Expense;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    use \App\Traits\ApiResponse;

    public function financialSummary(Request $request)
    {
        // Date Range: Default to last 6 months
        $startDate = $request->get('start_date', Carbon::now()->subMonths(6)->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        $revenue = \App\Models\Payment::select(
            DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
            DB::raw('SUM(amount) as total')
        )
            ->where('status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $expenses = Expense::select(
            DB::raw("DATE_FORMAT(date, '%Y-%m') as month"),
            DB::raw('SUM(amount) as total')
        )
            ->where('status', 'paid')
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $months = [];
        $current = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        while ($current <= $end) {
            $monthKey = $current->format('Y-m');
            $months[] = [
                'name' => $current->translatedFormat('M Y'), // Localized month name
                'revenue' => $revenue->get($monthKey)->total ?? 0,
                'expenses' => $expenses->get($monthKey)->total ?? 0,
                'profit' => ($revenue->get($monthKey)->total ?? 0) - ($expenses->get($monthKey)->total ?? 0)
            ];
            $current->addMonth();
        }

        $paymentStatus = \App\Models\Payment::select('status as payment_status', DB::raw('count(*) as count'), DB::raw('sum(amount) as total'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('status')
            ->get();

        $expensesByCategory = Expense::with('category')
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->where('status', 'paid') // Only paid expenses? Usually yes for cash flow.
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy('category_id')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->category->name ?? 'Sem Categoria',
                    'color' => $item->category->color ?? '#cbd5e1',
                    'total' => $item->total
                ];
            });

        // 5. Top Products (Revenue & Volume)
        $topProducts = \App\Models\OrderItem::select(
            'product_id',
            DB::raw('SUM(quantity) as total_sold'),
            DB::raw('SUM(quantity * unit_price) as total_revenue')
        )
            ->whereHas('order', function ($q) use ($startDate, $endDate) {
                $q->where('payment_status', 'paid')
                  ->whereBetween('created_at', [$startDate, $endDate]);
            })
            ->with('product:id,name,image_path')
            ->groupBy('product_id')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->product_id,
                    'name' => $item->product->name ?? 'Produto Removido',
                    'image' => $item->product->image_path ?? null,
                    'sold' => $item->total_sold,
                    'revenue' => $item->total_revenue
                ];
            });

        // 6. Low Stock Alerts
        $lowStock = \App\Models\Product::select('id', 'name', 'stock_quantity', 'min_stock_level', 'image_path')
            ->whereColumn('stock_quantity', '<=', 'min_stock_level')
            ->whereNull('deleted_at')
            ->orderBy('stock_quantity', 'asc')
            ->limit(5)
            ->get();

        // 7. Settings (for frontend toggles)
        $settings = \App\Models\CompanySetting::first();
        $stockControlEnabled = $settings ? $settings->enable_stock_control : false;

        return $this->success([
            'overview' => $months,
            'payment_status' => $paymentStatus,
            'expenses_by_category' => $expensesByCategory,
            'top_products' => $topProducts,
            'low_stock' => $lowStock,
            'settings' => [
                'enable_stock_control' => $stockControlEnabled
            ]
        ]);
    }

    public function financialReports(Request $request)
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        $groupBy = $request->get('group_by', 'day'); // day, month, year
        
        // Optional Comparison Period
        $compareStartDate = $request->get('compare_start_date');
        $compareEndDate = $request->get('compare_end_date');

        // 1. Primary Period Data
        $primary = $this->getPeriodSummary($startDate, $endDate, $groupBy);
        
        // 2. Comparison Period Data (if provided)
        $comparison = null;
        if ($compareStartDate && $compareEndDate) {
            $comparison = $this->getPeriodSummary($compareStartDate, $compareEndDate, $groupBy);
        }

        return $this->success([
            'primary' => $primary,
            'comparison' => $comparison
        ]);
    }

    private function getPeriodSummary($startDate, $endDate, $groupBy = 'day')
    {
        // Totals (Always the same regardless of grouping)
        $revenueTotal = \App\Models\Payment::where('status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount');

        $expensesTotal = \App\Models\Expense::where('status', 'paid')
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');

        // Determine SQL format and Date Interval based on GroupBy
        $dateFormat = '%Y-%m-%d';
        $keyFormat = 'Y-m-d';
        $incrementMethod = 'addDay';
        $labelFormat = 'd/m/Y';

        switch ($groupBy) {
            case 'month':
                $dateFormat = '%Y-%m';
                $keyFormat = 'Y-m';
                $incrementMethod = 'addMonth';
                $labelFormat = 'M Y';
                break;
            case 'year':
                $dateFormat = '%Y';
                $keyFormat = 'Y';
                $incrementMethod = 'addYear';
                $labelFormat = 'Y';
                break;
        }

        // Revenue Query
        $revenueQuery = \App\Models\Payment::select(
            DB::raw("DATE_FORMAT(created_at, '$dateFormat') as date_key"),
            DB::raw('SUM(amount) as total')
        )
            ->where('status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date_key')
            ->get()
            ->keyBy('date_key');

        // Expenses Query
        $expensesQuery = \App\Models\Expense::select(
            DB::raw("DATE_FORMAT(date, '$dateFormat') as date_key"),
            DB::raw('SUM(amount) as total')
        )
            ->where('status', 'paid')
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy('date_key')
            ->get()
            ->keyBy('date_key');

        // Fill gaps
        $chartData = [];
        $current = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        // Adjust start/end for grouping to ensure full coverage
        if ($groupBy === 'month') {
            $current->startOfMonth();
            $end->endOfMonth();
        } elseif ($groupBy === 'year') {
            $current->startOfYear();
            $end->endOfYear();
        }

        while ($current <= $end) {
            $dateKey = $current->format($keyFormat);
            $chartData[] = [
                'date' => $dateKey,
                'formatted_date' => $current->translatedFormat($labelFormat),
                'revenue' => $revenueQuery->get($dateKey)->total ?? 0,
                'expenses' => $expensesQuery->get($dateKey)->total ?? 0,
                'profit' => ($revenueQuery->get($dateKey)->total ?? 0) - ($expensesQuery->get($dateKey)->total ?? 0)
            ];
            $current->$incrementMethod();
        }

        return [
            'totals' => [
                'revenue' => $revenueTotal,
                'expenses' => $expensesTotal,
                'profit' => $revenueTotal - $expensesTotal
            ],
            'chart_data' => $chartData
        ];
    }
    public function financialTransactions(Request $request)
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        
        // Filters
        $type = $request->get('type'); // 'income', 'expense', or null
        $categoryId = $request->get('category_id');
        $paymentMethodId = $request->get('payment_method_id');

        $transactions = collect([]);

        // 1. Fetch Incomes (if filtering allow)
        if (!$type || $type === 'income') {
            $incomesQuery = \App\Models\Payment::with(['order:id,customer_name', 'paymentMethod:id,name'])
                ->where('status', 'paid')
                ->whereBetween('created_at', [$startDate, $endDate]);

            if ($paymentMethodId) {
                $incomesQuery->where('payment_method_id', $paymentMethodId);
            }

            // Incomes don't have "expense categories", so if category_id is set, we might skip incomes 
            // OR checks if we ever implement income categories. For now, skip if category_id is set.
            if (!$categoryId) {
                $incomes = $incomesQuery->get()->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'date' => $item->created_at->format('Y-m-d H:i:s'),
                        'description' => "Pedido #{$item->order_id} - " . ($item->order->customer_name ?? 'Cliente'),
                        'category' => 'Venda',
                        'type' => 'income',
                        'amount' => $item->amount,
                        'method' => $item->paymentMethod->name ?? 'N/A',
                        'status' => 'paid'
                    ];
                });
                $transactions = $transactions->concat($incomes);
            }
        }

        // 2. Fetch Expenses (if filtering allow)
        if (!$type || $type === 'expense') {
            $expensesQuery = \App\Models\Expense::with(['category:id,name,color', 'paymentMethod:id,name'])
                ->where('status', 'paid')
                ->whereBetween('date', [$startDate, $endDate]);

            if ($paymentMethodId) {
                $expensesQuery->where('payment_method_id', $paymentMethodId);
            }

            if ($categoryId) {
                $expensesQuery->where('category_id', $categoryId);
            }

            $expenses = $expensesQuery->get()->map(function ($item) {
                return [
                    'id' => $item->id,
                    'date' => $item->date . ' 00:00:00',
                    'description' => $item->description,
                    'category' => $item->category->name ?? 'Sem Categoria',
                    'type' => 'expense',
                    'amount' => $item->amount,
                    'method' => $item->paymentMethod->name ?? 'N/A',
                    'status' => 'paid'
                ];
            });
            $transactions = $transactions->concat($expenses);
        }

        // Sort by Date Descending
        return $this->success($transactions->sortByDesc('date')->values());
    }

    public function financialReportWidgets(Request $request)
    {
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));

        // 1. Top Products (Revenue & Volume) for the Period
        $topProducts = \App\Models\OrderItem::select(
            'product_id',
            DB::raw('SUM(quantity) as total_sold'),
            DB::raw('SUM(quantity * unit_price) as total_revenue')
        )
            ->whereHas('order', function ($q) use ($startDate, $endDate) {
                $q->where('payment_status', 'paid')
                  ->whereBetween('created_at', [$startDate, $endDate]);
            })
            ->with('product:id,name,image_path')
            ->groupBy('product_id')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->product_id,
                    'name' => $item->product->name ?? 'Items Removed',
                    'image' => $item->product->image_path ?? null,
                    'sold' => $item->total_sold,
                    'revenue' => $item->total_revenue
                ];
            });

        // 2. Expenses by Category for the Period
        $expensesByCategory = \App\Models\Expense::with('category')
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->where('status', 'paid')
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy('category_id')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->category->name ?? 'Uncategorized',
                    'color' => $item->category->color ?? '#cbd5e1',
                    'total' => $item->total
                ];
            });

        // 3. Income by Payment Method for the Period
        $incomeByMethod = \App\Models\Payment::with('paymentMethod')
            ->select('payment_method_id', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->where('status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('payment_method_id')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->paymentMethod->name ?? 'Unknown',
                    'total' => $item->total,
                    'count' => $item->count
                ];
            });

        return $this->success([
            'top_products' => $topProducts,
            'expenses_by_category' => $expensesByCategory,
            'income_by_method' => $incomeByMethod
        ]);
    }
}
