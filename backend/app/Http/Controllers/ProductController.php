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
}
