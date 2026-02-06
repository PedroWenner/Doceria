<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends Controller
{
    use \App\Traits\ApiResponse;

    public function index(Request $request)
    {
        $query = Expense::with(['category', 'user', 'attachments']);

        // Search
        if ($request->has('search') && $request->search != '') {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        // Filters
        if ($request->has('category_id') && $request->category_id != 'all') {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('status') && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('start_date') && $request->start_date) {
            $query->whereDate('date', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date) {
            $query->whereDate('date', '<=', $request->end_date);
        }

        $expenses = $query->orderBy('date', 'desc')
                          ->orderBy('created_at', 'desc')
                          ->paginate($request->get('per_page', 15));

        return $this->success($expenses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'category_id' => 'required|exists:expense_categories,id',
            'payment_method' => 'required|string', // money, pix, card, transfer, boleto
            'status' => 'required|in:paid,pending',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'documents.*' => 'nullable|file|max:10240', // Max 10MB per file
        ]);

        $validated['user_id'] = Auth::id();
        
        if ($validated['status'] === 'paid' && !isset($validated['paid_at'])) {
            $validated['paid_at'] = now();
        }

        $expense = Expense::create($validated);

        // Handle File Uploads
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $file) {
                $path = $file->store('expenses', 'public');
                
                $expense->attachments()->create([
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }

        // Load relationships for response
        $expense->load(['category', 'user', 'attachments']);

        return $this->success($expense, 'Despesa registrada com sucesso.', 201);
    }

    public function show($id)
    {
        $expense = Expense::with(['category', 'user', 'attachments'])->findOrFail($id);
        return $this->success($expense);
    }

    public function update(Request $request, $id)
    {
        $expense = Expense::findOrFail($id);
        
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'category_id' => 'required|exists:expense_categories,id',
            'payment_method' => 'required|string',
            'status' => 'required|in:paid,pending',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'documents.*' => 'nullable|file|max:10240',
        ]);

        if ($validated['status'] === 'paid' && $expense->status !== 'paid') {
            $validated['paid_at'] = now();
        }

        $expense->update($validated);

         // Handle New File Uploads
         if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $file) {
                $path = $file->store('expenses', 'public');
                
                $expense->attachments()->create([
                    'file_path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getClientMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }
        }
        
        $expense->load('attachments');

        return $this->success($expense, 'Despesa atualizada com sucesso.');
    }

    public function removeAttachment($id)
    {
        $attachment = \App\Models\ExpenseAttachment::findOrFail($id);
        
        // Check permissions (optional, but good practice)
        // if ($attachment->expense->user_id !== Auth::id()) ...

        // Delete file from storage
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($attachment->file_path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($attachment->file_path);
        }

        $attachment->delete();

        return $this->success(null, 'Anexo removido com sucesso.');
    }

    public function destroy($id)
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();
        return $this->success(null, 'Despesa removida com sucesso.');
    }
}
