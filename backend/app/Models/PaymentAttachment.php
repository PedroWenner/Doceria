<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'file_path',
        'original_name',
        'mime_type',
        'file_size',
    ];

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
