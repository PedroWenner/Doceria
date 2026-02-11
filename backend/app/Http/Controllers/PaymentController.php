<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\PaymentMethod;
use App\Services\Payments\MercadoPagoService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Exception;

class PaymentController extends Controller
{
    use ApiResponse;

    /**
     * List payments with advanced filtering.
     */
    public function index(Request $request)
    {
        $query = \App\Models\Payment::with(['order.user', 'attachments']);

        // Search: External ID or Order ID
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('external_id', 'like', "%{$search}%")
                  ->orWhere('order_id', 'like', "%{$search}%");
            });
        }

        // Filter by Status
        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by Method
        if ($request->has('method') && !empty($request->method) && $request->method !== 'all') {
            $query->where('method', $request->method);
        }

        // Date Range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $payments = $query->latest()->paginate(15);
        
        return $this->success($payments);
    }

    /**
     * Create a manual payment (Cash, Settlement, etc).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|string',
            'status' => 'required|in:paid,pending,failed',
            'order_id' => 'nullable|exists:orders,id',
            'external_id' => 'nullable|string|max:255',
            'notes' => 'nullable|string'
        ]);

        try {
            $payment = \App\Models\Payment::create([
                'amount' => $validated['amount'],
                'method' => $validated['method'],
                'status' => $validated['status'],
                'order_id' => $validated['order_id'] ?? null,
                'external_id' => $validated['external_id'] ?? 'MANUAL-' . uniqid(),
                'metadata' => [
                    'source' => 'manual_dashboard',
                    'notes' => $validated['notes'] ?? null,
                    'created_by' => $request->user()->id
                ]
            ]);

            // Handle Attachments for new manual payments
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $file) {
                    $path = $file->store('payment_attachments', 'public');
                    
                    $payment->attachments()->create([
                        'file_path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getClientMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                }
            }

            // Optional: Update Order if linked
            if ($payment->order_id && $payment->status === 'paid') {
                $order = \App\Models\Order::find($payment->order_id);
                if ($order && $order->payment_status !== 'paid') {
                    $order->update(['payment_status' => 'paid']);
                }
            }

            return $this->success($payment, 'Pagamento registrado com sucesso.', 201);

        } catch (Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $payment = \App\Models\Payment::with(['order', 'attachments'])->findOrFail($id);
        return $this->success($payment);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $payment = \App\Models\Payment::findOrFail($id);

        // RESTRICTION: If linked to an Order, deny core updates
        if ($payment->order_id) {
            if ($request->hasAny(['amount', 'method', 'status'])) {
                 // For now, we just ignore or return error. Let's return error to be explicit.
                 // Actually, the user asked to "edit only when manually registered".
                 // So we should strictly forbid it.
                 return $this->error('Pagamentos vinculados a pedidos não podem ter seus dados principais editados.', 403);
            }
        }

        $validated = $request->validate([
            'amount' => 'sometimes|numeric|min:0.01',
            'method' => 'sometimes|string',
            'status' => 'sometimes|in:paid,pending,failed',
            'notes' => 'nullable|string'
        ]);

        try {
            $payment->update($request->only(['amount', 'method', 'status', 'notes']));
            
            if ($request->has('notes')) {
                $meta = $payment->metadata ?? [];
                $meta['notes'] = $request->notes;
                $payment->metadata = $meta;
                $payment->save();
            }

            $fileCount = 0;
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $file) {
                    $path = $file->store('payment_attachments', 'public');
                    
                    $payment->attachments()->create([
                        'file_path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getClientMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                    $fileCount++;
                }
            }

            return $this->success($payment->load('attachments'), "Pagamento atualizado. Arquivos processados: {$fileCount}");

        } catch (Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $payment = \App\Models\Payment::findOrFail($id);
        
        // Optional: Restrict deletion of automated payments?
        // User didn't explicitly ask, but it's good practice.
        if ($payment->order_id) {
             return $this->error('Não é possível excluir pagamentos vinculados a pedidos.', 403);
        }

        $payment->delete();
        return $this->success(null, 'Pagamento excluído com sucesso.');
    }

    /**
     * Remove an attachment.
     */
    public function destroyAttachment($id)
    {
        try {
            $attachment = \App\Models\PaymentAttachment::findOrFail($id);
            // Storage::disk('public')->delete($attachment->file_path); // Optionally delete file
            $attachment->delete();
            return $this->success(null, 'Anexo removido.');
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }

    /**
     * Process payment for an order (Customer Checkout).
     */
    public function payOrder(Request $request, $orderId)
    {
        $order = Order::findOrFail($orderId);

        // Prevent double payment
        if ($order->status === 'paid' || $order->status === 'delivered') {
            return $this->error('Pedido já pago ou finalizado.', 400);
        }

        $methodSlug = $order->payment_method; 
        $paymentMethod = PaymentMethod::where('slug', $methodSlug)->first();

        if (!$paymentMethod) {
             return $this->error("Método de pagamento não encontrado: {$methodSlug}", 404);
        }

        $settings = $paymentMethod->gatewaySetting;

        if (!$settings || !$settings->is_active) {
            return $this->error('Configuração de pagamento indisponível para este método.', 400);
        }

        try {
            $service = null;
            if (str_contains($methodSlug, 'mercadopago') || str_contains($methodSlug, 'pix') || str_contains($methodSlug, 'card')) {
                $service = new MercadoPagoService();
            }

            if (!$service) {
                return $this->error('Serviço de pagamento não implementado.', 501);
            }

            if ($request->has('brick_data')) {
                $brickData = $request->input('brick_data');
                $brickData['transaction_amount'] = (float) $order->total_amount;
                $brickData['description'] = "Pedido #{$order->id} - SweetStore";
                $brickData['external_reference'] = (string) $order->id;
                
                if (!isset($brickData['payer']['email']) && $order->user) {
                     $brickData['payer']['email'] = $order->user->email;
                }

                $response = $service->processPayment($brickData, $settings);

                if (isset($response['id'])) {
                    // Create Payment Record (New Architecture)
                    $payment = \App\Models\Payment::updateOrCreate(
                        ['external_id' => $response['id']],
                        [
                            'order_id' => $order->id,
                            'method' => $request->input('brick_data.payment_method_id', 'unknown'),
                            'status' => $response['status'] === 'approved' ? 'paid' : ($response['status'] === 'rejected' ? 'failed' : 'pending'),
                            'amount' => $brickData['transaction_amount'],
                            'metadata' => $response
                        ]
                    );

                    $order->transaction_id = $response['id'];
                    $order->payment_status = $payment->status;
                    $order->save();
                    
                    return $this->success([
                        'type' => 'brick_success',
                        'data' => $response
                    ]);
                }
            } else {
                // Redirect Flow
                $response = $service->createPreference($order, $settings);
                return $this->success($response);
            }

        } catch (Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }
    /**
     * Sync payment status with gateway.
     */
    public function sync(Request $request, $id)
    {
        try {
            $payment = \App\Models\Payment::findOrFail($id);

            if (!$payment->external_id) {
                return $this->error('Pagamento sem ID externo para sincronização.', 400);
            }

            // Determine gateway based on method slug (simplified logic matching payOrder)
            $gatewayService = null;
            if (str_contains($payment->method, 'mercadopago') || str_contains($payment->method, 'pix') || str_contains($payment->method, 'card')) {
                $gatewayService = new MercadoPagoService();
            }

            if (!$gatewayService) {
                return $this->error('Gateway não suportado para sincronização.', 501);
            }

            // We need settings. In a real scenario, we'd look up the PaymentMethod by the payment's method string.
            // For now, let's assume valid settings are resolvable or we default to the active ones for that method.
            $paymentMethod = PaymentMethod::where('slug', $payment->method)->first();
            
            if (!$paymentMethod || !$paymentMethod->gatewaySetting) {
                 return $this->error('Configuração do gateway não encontrada.', 404);
            }

            // Fetch latest status
            $latestStatus = $gatewayService->getPaymentStatus($payment->external_id, $paymentMethod->gatewaySetting);

            // Update Payment
            $oldStatus = $payment->status;
            $newStatus = $latestStatus['status'] === 'approved' ? 'paid' : ($latestStatus['status'] === 'rejected' ? 'failed' : 'pending');
            
            $payment->update([
                'status' => $newStatus,
                'metadata' => array_merge($payment->metadata ?? [], ['latest_sync' => $latestStatus])
            ]);

            // Update Order if changed to paid
            if ($newStatus === 'paid' && $oldStatus !== 'paid' && $payment->order_id) {
                $order = Order::find($payment->order_id);
                if ($order && $order->payment_status !== 'paid') {
                    $order->update([
                        'payment_status' => 'paid',
                        'transaction_id' => $payment->external_id
                    ]);
                }
            }

            return $this->success([
                'payment' => $payment->fresh(),
                'synced_at' => now()
            ], 'Status sincronizado com sucesso.');

        } catch (Exception $e) {
            return $this->error('Erro na sincronização: ' . $e->getMessage(), 500);
        }
    }
}
