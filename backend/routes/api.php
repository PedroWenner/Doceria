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
    Route::post('me', [App\Http\Controllers\AuthController::class, 'me']);
});

// Fallback for Auth Middleware Redirects
Route::get('login', function() { 
    return response()->json(['message' => 'Unauthenticated.'], 401); 
})->name('login');

Route::group(['middleware' => ['api', 'auth:api', 'role:admin']], function () {
    // Users & Audits - Allow Admin and Manager (Read)
    Route::group(['middleware' => ['role:admin,manager']], function () {
        Route::get('users', [App\Http\Controllers\UserController::class, 'index']);
        Route::post('users', [App\Http\Controllers\UserController::class, 'store']); // Create User
        Route::get('audits', [App\Http\Controllers\AuditController::class, 'index']);
        Route::get('roles', [App\Http\Controllers\UserController::class, 'roles']);
    });

    Route::post('users/{user}/roles', [App\Http\Controllers\UserController::class, 'updateRoles']); // Keep strict admin for changing roles

    // Orders (Kanban) - Allow Admin and Manager
    Route::group(['middleware' => ['role:admin,manager']], function () {
        Route::get('orders', [App\Http\Controllers\OrderController::class, 'index']);
        Route::put('orders/{order}/status', [App\Http\Controllers\OrderController::class, 'updateStatus']);
    });
    
    // Admin Product Management (Write)
    Route::post('/categories', [App\Http\Controllers\CategoryController::class, 'store']);
    Route::put('/categories/{category}', [App\Http\Controllers\CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [App\Http\Controllers\CategoryController::class, 'destroy']);
    
    Route::post('products', [App\Http\Controllers\ProductController::class, 'store']);
    Route::put('products/{product}', [App\Http\Controllers\ProductController::class, 'update']);
    Route::delete('products/{product}', [App\Http\Controllers\ProductController::class, 'destroy']);

    // System Settings (Write)
    Route::put('settings', [App\Http\Controllers\CompanySettingController::class, 'update']);

    // Payment Gateway Settings
    Route::get('/payment-gateway-settings', [App\Http\Controllers\PaymentGatewaySettingController::class, 'index']);
    Route::put('/payment-gateway-settings/{paymentMethod}', [App\Http\Controllers\PaymentGatewaySettingController::class, 'update']);

    // Payments Dashboard (Admin)
    Route::post('payments/{id}/sync', [App\Http\Controllers\PaymentController::class, 'sync']);
    Route::get('payments', [App\Http\Controllers\PaymentController::class, 'index']);
    Route::post('payments', [App\Http\Controllers\PaymentController::class, 'store']);

    // Financial Module (Expenses)
    Route::apiResource('expenses', App\Http\Controllers\ExpenseController::class);
    Route::apiResource('expense-categories', App\Http\Controllers\ExpenseCategoryController::class);

    // Payment Methods (Admin)
    Route::get('payment-methods/admin', [App\Http\Controllers\PaymentMethodController::class, 'indexAdmin']);
    Route::post('payment-methods', [App\Http\Controllers\PaymentMethodController::class, 'store']);
    Route::put('payment-methods/{id}', [App\Http\Controllers\PaymentMethodController::class, 'update']);
    Route::post('payment-methods/{id}/toggle', [App\Http\Controllers\PaymentMethodController::class, 'toggle']);
    Route::delete('payment-methods/{id}', [App\Http\Controllers\PaymentMethodController::class, 'destroy']);
});

// Public Routes (Storefront)
Route::group(['middleware' => ['api']], function () {
    Route::get('/categories', [App\Http\Controllers\CategoryController::class, 'index']);
    Route::get('products', [App\Http\Controllers\ProductController::class, 'index']);
    Route::get('products/{product}', [App\Http\Controllers\ProductController::class, 'show']);
    Route::get('products/{product}', [App\Http\Controllers\ProductController::class, 'show']);
    Route::get('settings', [App\Http\Controllers\CompanySettingController::class, 'show']);
    Route::get('payment-methods', [App\Http\Controllers\PaymentMethodController::class, 'index']);
});

// Webhooks (Public)
Route::post('/webhooks/mercadopago', [App\Http\Controllers\WebhookController::class, 'handleMercadoPago']);

// Authenticated Routes (Customers & Admins)
Route::group(['middleware' => ['api', 'auth:api']], function () {
    Route::get('orders/my-orders', [App\Http\Controllers\OrderController::class, 'myOrders']);
    Route::post('orders', [App\Http\Controllers\OrderController::class, 'store']);
    Route::post('orders/{order}/pay', [App\Http\Controllers\PaymentController::class, 'payOrder']);
    Route::post('orders/{order}/verify-payment', [App\Http\Controllers\OrderController::class, 'verifyPayment']);
    Route::get('orders/{order}', [App\Http\Controllers\OrderController::class, 'show']);
});
