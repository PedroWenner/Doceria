<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;

class Order extends Model implements Auditable
{
    use HasFactory, SoftDeletes, \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'user_id',
        'customer_name',
        'customer_phone',
        'status',
        'payment_status',
        'total_amount',
        'payment_method',
        'delivery_type',
        'delivery_address',
        'courier_name',
        'notes'
    ];

    protected $casts = [
        'delivery_address' => 'array',
        'payment_metadata' => 'array',
    ];

    public function getNotesAttribute($value)
    {
        if (empty($value)) return null;
        
        // Try to decode JSON
        $decoded = json_decode($value, true);
        
        // If it's valid JSON and is an array/object
        if (json_last_error() === JSON_ERROR_NONE && (is_array($decoded) || is_object($decoded))) {
            // If it has a specific 'text' or 'content' key, return that
            if (is_array($decoded)) {
                return $decoded['text'] ?? $decoded['content'] ?? $decoded['notes'] ?? implode(' ', $decoded);
            }
            return json_encode($decoded); // Fallback? Or just return the string? 
            // Actually, if it's JSON, the user probably wants the plain text inner content.
            // But if we can't find a key, maybe it's fine to return the raw or try to clean it.
        }
        
        // Return original string if not JSON (e.g. "Sem cebola")
        return $value;
    }

    public function getPaymentMethodAttribute($value)
    {
        if (empty($value)) return $value;

        // Clean quotes if double encoded like '"pix"'
        $clean = trim($value, '"');
        
        $decoded = json_decode($clean, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded['slug'] ?? $decoded['id'] ?? $decoded['name'] ?? $clean;
        }

        return $clean;
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
