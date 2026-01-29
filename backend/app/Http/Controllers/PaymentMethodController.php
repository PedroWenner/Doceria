<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    use ApiResponse;

    // Public: List active payment methods
    public function index()
    {
        $methods = PaymentMethod::where('is_active', true)->get();
        return $this->success($methods);
    }

    // Admin: List all
    public function indexAdmin()
    {
        $methods = PaymentMethod::all();
        return $this->success($methods);
    }

    // Admin: Toggle active status
    public function toggle($id)
    {
        $method = PaymentMethod::findOrFail($id);
        $method->is_active = !$method->is_active;
        $method->save();

        return $this->success($method, 'Status atualizado com sucesso.');
    }

    // Admin: Store
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:payment_methods,slug',
        ]);

        $method = PaymentMethod::create($validated);
        return $this->success($method, 'Meio de pagamento criado com sucesso.');
    }

    // Admin: Update
    public function update(Request $request, $id)
    {
        $method = PaymentMethod::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:payment_methods,slug,' . $id,
        ]);

        $method->update($validated);
        return $this->success($method, 'Meio de pagamento atualizado com sucesso.');
    }

    // Admin: Destroy
    public function destroy($id)
    {
        $method = PaymentMethod::findOrFail($id);
        $method->delete();
        return $this->success(null, 'Meio de pagamento removido com sucesso.');
    }
}
