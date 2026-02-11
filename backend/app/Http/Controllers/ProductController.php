<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'discounts.paymentMethod']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->input('limit') === 'all') {
            return $this->success($query->latest()->get());
        }

        $limit = $request->input('limit', \App\Models\CompanySetting::first()->pagination_limit ?? 10);
        $products = $query->latest()->paginate($limit);
        return $this->success($products);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'min_stock_level' => 'sometimes|integer|min:0',
            'sku' => 'required|string|unique:products,sku',
            'status' => 'required|in:active,draft',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048', // Max 2MB
            'discounts' => 'nullable|array',
            'discounts.*.payment_method_id' => 'required_with:discounts|exists:payment_methods,id',
            'discounts.*.percentage' => 'required_with:discounts|numeric|min:0|max:100',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image_path'] = $path;
        }

        $product = Product::create($validated);

        if ($request->has('discounts')) {
            foreach ($request->discounts as $discount) {
                $product->discounts()->create([
                    'payment_method_id' => $discount['payment_method_id'],
                    'percentage' => $discount['percentage'],
                ]);
            }
        }

        return $this->success($product->load('discounts'), 'Product created successfully', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return $this->success($product->load(['category', 'discounts.paymentMethod']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'price' => 'sometimes|numeric|min:0',
            'stock_quantity' => 'sometimes|integer|min:0',
            'min_stock_level' => 'sometimes|integer|min:0',
            'sku' => 'sometimes|string|unique:products,sku,' . $product->id,
            'status' => 'sometimes|in:active,draft',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'discounts' => 'nullable|array',
            'discounts.*.payment_method_id' => 'required_with:discounts|exists:payment_methods,id',
            'discounts.*.percentage' => 'required_with:discounts|numeric|min:0|max:100',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $path = $request->file('image')->store('products', 'public');
            $validated['image_path'] = $path;
        }

        $product->update($validated);

        if ($request->has('discounts') || $request->boolean('clear_discounts')) {
            // Clear existing and re-create (simplest strategy for sync)
            $product->discounts()->delete();
            
            if ($request->has('discounts') && is_array($request->discounts)) {
                foreach ($request->discounts as $discount) {
                    $product->discounts()->create([
                        'payment_method_id' => $discount['payment_method_id'],
                        'percentage' => $discount['percentage'],
                    ]);
                }
            }
        }

        return $this->success($product->load('discounts'), 'Product updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }
        
        $product->delete();

        return $this->success(null, 'Product deleted successfully');
    }

    /**
     * Get product report data.
     */
    public function report(Request $request)
    {
        $query = Product::with('category');

        // Filters
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('min_price') && $request->min_price) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price') && $request->max_price) {
            $query->where('price', '<=', $request->max_price);
        }

        // Stock Status Filter
        if ($request->has('stock_status') && $request->stock_status) {
            switch ($request->stock_status) {
                case 'out_of_stock':
                    $query->where('stock_quantity', '<=', 0);
                    break;
                case 'low_stock':
                     // Assuming low stock is when quantity <= min_stock_level
                    $query->whereColumn('stock_quantity', '<=', 'min_stock_level')
                          ->where('stock_quantity', '>', 0);
                    break;
                case 'in_stock':
                    $query->whereColumn('stock_quantity', '>', 'min_stock_level');
                    break;
            }
        }

        $allProducts = $query->get();

        // Calculate Metrics
        $totalProducts = $allProducts->count();
        $totalValue = $allProducts->sum(function ($product) {
            return $product->price * $product->stock_quantity;
        });
        
        $lowStockCount = $allProducts->filter(function ($product) {
            return $product->stock_quantity <= $product->min_stock_level && $product->stock_quantity > 0;
        })->count();

        $outOfStockCount = $allProducts->where('stock_quantity', '<=', 0)->count();

        // Prepare Response
        return $this->success([
            'metrics' => [
                'total_products' => $totalProducts,
                'total_inventory_value' => $totalValue,
                'low_stock_count' => $lowStockCount,
                'out_of_stock_count' => $outOfStockCount,
            ],
            'products' => $allProducts
        ]);
    }
}
