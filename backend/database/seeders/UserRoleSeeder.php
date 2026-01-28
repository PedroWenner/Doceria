<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserRoleSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::updateOrCreate(
            ['email' => 'admin@sweetstore.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin'
            ]
        );

        // Manager
        User::updateOrCreate(
            ['email' => 'manager@sweetstore.com'],
            [
                'name' => 'Loja Manager',
                'password' => Hash::make('password'),
                'role' => 'manager'
            ]
        );

        // Customer
        User::updateOrCreate(
            ['email' => 'cliente@sweetstore.com'],
            [
                'name' => 'Cliente Feliz',
                'password' => Hash::make('password'),
                'role' => 'customer'
            ]
        );
    }
}
