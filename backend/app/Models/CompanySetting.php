<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use OwenIt\Auditing\Contracts\Auditable;

class CompanySetting extends Model implements Auditable
{
    use HasFactory, SoftDeletes, \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'system_name',
        'description',
        'brand_color',
        'logo_path',
        'cnpj',
        'state_registration',
        'municipal_registration',
        'fiscal_regime',
        'street',
        'number',
        'neighborhood',
        'city',
        'state',
        'zip_code',
        'orders_refresh_rate',
        'auth_token_expiration'
    ];
}
