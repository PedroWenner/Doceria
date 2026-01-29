<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('login', [App\Http\Controllers\AuthController::class, 'login']);
    Route::post('register', [App\Http\Controllers\AuthController::class, 'register']);
    Route::post('logout', [App\Http\Controllers\AuthController::class, 'logout']);
    Route::post('refresh', [App\Http\Controllers\AuthController::class, 'refresh']);
    Route::post('me', [App\Http\Controllers\AuthController::class, 'me']);
});

Route::group(['middleware' => ['api', 'auth:api', 'role:admin']], function () {
    Route::get('users', [App\Http\Controllers\UserController::class, 'index']);
    Route::post('users/{user}/roles', [App\Http\Controllers\UserController::class, 'updateRoles']);
    Route::get('roles', [App\Http\Controllers\UserController::class, 'roles']);
    
    // Audits
    Route::get('audits', [App\Http\Controllers\AuditController::class, 'index']);

    // Orders (Kanban)
    // Orders (Kanban)
    Route::get('orders', [App\Http\Controllers\OrderController::class, 'index']);
    Route::put('orders/{order}/status', [App\Http\Controllers\OrderController::class, 'updateStatus']);

    // Admin Product Management (Write)
    Route::post('/categories', [App\Http\Controllers\CategoryController::class, 'store']);
    Route::put('/categories/{category}', [App\Http\Controllers\CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [App\Http\Controllers\CategoryController::class, 'destroy']);
    
    Route::post('products', [App\Http\Controllers\ProductController::class, 'store']);
    Route::put('products/{product}', [App\Http\Controllers\ProductController::class, 'update']);
    Route::delete('products/{product}', [App\Http\Controllers\ProductController::class, 'destroy']);

    // System Settings (Write)
    Route::put('settings', [App\Http\Controllers\CompanySettingController::class, 'update']);
});

// Public Routes (Storefront)
Route::group(['middleware' => ['api']], function () {
    Route::get('/categories', [App\Http\Controllers\CategoryController::class, 'index']);
    Route::get('products', [App\Http\Controllers\ProductController::class, 'index']);
    Route::get('products/{product}', [App\Http\Controllers\ProductController::class, 'show']);
    Route::get('settings', [App\Http\Controllers\CompanySettingController::class, 'show']);
});
