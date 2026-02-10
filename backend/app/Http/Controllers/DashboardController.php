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

        // 1. Monthly Revenue (Orders Paid)
        $revenue = Order::select(
            DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
            DB::raw('SUM(total_amount) as total')
        )
            ->where('status', '!=', 'canceled') // Assuming 'canceled' shouldn't count, or specifically 'paid'/'delivered' depending on business logic. Sticking to 'paid' payment_status is safer.
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        // 2. Monthly Expenses
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

        // Combine for Area Chart
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

        // 3. Payment Status (Pie Chart)
        $paymentStatus = Order::select('payment_status', DB::raw('count(*) as count'), DB::raw('sum(total_amount) as total'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('payment_status')
            ->get();

        // 4. Expenses by Category (Bar Chart)
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

        return $this->success([
            'overview' => $months,
            'payment_status' => $paymentStatus,
            'expenses_by_category' => $expensesByCategory
        ]);
    }
}
