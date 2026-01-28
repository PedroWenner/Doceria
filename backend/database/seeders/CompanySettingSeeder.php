<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CompanySetting;

class CompanySettingSeeder extends Seeder
{
    public function run(): void
    {
        if (CompanySetting::count() === 0) {
            CompanySetting::create([
                'system_name' => 'SweetStore Doceria',
                'description' => 'A melhor doceria da cidade, especializada em bolos e doces artesanais.',
                'brand_color' => '#fbcfe8',
                'city' => 'São Paulo',
                'state' => 'SP'
            ]);
        }
    }
}
