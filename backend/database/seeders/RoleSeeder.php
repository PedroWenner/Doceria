<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['name' => 'Admin', 'slug' => 'admin', 'description' => 'System Administrator'],
            ['name' => 'Manager', 'slug' => 'manager', 'description' => 'Store Manager'],
            ['name' => 'Customer', 'slug' => 'customer', 'description' => 'Registered Customer'],
        ];

        foreach ($roles as $role) {
            \App\Models\Role::create($role);
        }

        $admin = \App\Models\User::create([
            'name' => 'Admin User',
            'email' => 'admin@sweetstore.com',
            'password' => bcrypt('password'),
        ]);

        $admin->roles()->attach(\App\Models\Role::where('slug', 'admin')->first());
    }
}
