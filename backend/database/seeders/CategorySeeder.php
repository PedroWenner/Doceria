<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = ['Cakes', 'Pies', 'Macarons', 'Eclairs', 'Donuts'];

        foreach ($categories as $name) {
            Category::firstOrCreate(
                ['name' => $name],
                [
                    'slug' => Str::slug($name),
                    'description' => "Delicious $name made with love."
                ]
            );
        }
    }
}
