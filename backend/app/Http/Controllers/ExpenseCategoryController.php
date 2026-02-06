<?php

namespace App\Http\Controllers;

use App\Models\ExpenseCategory;
use Illuminate\Http\Request;

class ExpenseCategoryController extends Controller
{
    use \App\Traits\ApiResponse;

    public function index()
    {
        $categories = ExpenseCategory::orderBy('name')->get();
        return $this->success($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'color' => 'nullable|string|max:7',
        ]);

        $category = ExpenseCategory::create($validated);
        return $this->success($category, 'Categoria criada com sucesso.', 201);
    }

    public function show($id)
    {
        $category = ExpenseCategory::findOrFail($id);
        return $this->success($category);
    }

    public function update(Request $request, $id)
    {
        $category = ExpenseCategory::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'color' => 'nullable|string|max:7',
        ]);

        $category->update($validated);
        return $this->success($category, 'Categoria atualizada com sucesso.');
    }

    public function destroy($id)
    {
        $category = ExpenseCategory::findOrFail($id);
        
        if ($category->expenses()->exists()) {
            return $this->error('Não é possível excluir categorias em uso.', 409);
        }
        
        $category->delete();
        return $this->success(null, 'Categoria removida com sucesso.');
    }
}
