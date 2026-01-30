<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentGatewaySetting extends Model
{
    protected $fillable = [
        'payment_method_id',
        'credentials',
        'mode',
        'is_active',
    ];

    protected $casts = [
        'credentials' => 'encrypted:array',
        'is_active' => 'boolean',
    ];

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }}
