<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Illuminate\Http\Request::capture());

$user = \App\Models\User::firstOrCreate(
    ['email' => 'cliente_novo@teste.com'],
    [
        'name' => 'Cliente Teste',
        'password' => bcrypt('password123'),
        'role_id' => 3 // Assuming 3 is customer
    ]
);
$user->password = bcrypt('password123');
$user->save();
echo "User setup complete.";
