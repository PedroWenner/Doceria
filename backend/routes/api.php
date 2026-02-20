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

Route::post('forgot-password', [App\Http\Controllers\Auth\NewPasswordController::class, 'forgotPassword']);
Route::post('reset-password', [App\Http\Controllers\Auth\NewPasswordController::class, 'resetPassword']);

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
        Route::put('users/{id}', [App\Http\Controllers\UserController::class, 'update']);
        Route::put('users/{id}/password', [App\Http\Controllers\UserController::class, 'updatePassword']);
        Route::delete('users/{id}', [App\Http\Controllers\UserController::class, 'destroy']);
    });

    // Dashboard
    Route::get('/dashboard/financial-summary', [App\Http\Controllers\DashboardController::class, 'financialSummary']);
    Route::get('/dashboard/financial-reports', [App\Http\Controllers\DashboardController::class, 'financialReports']);
    Route::get('/dashboard/financial-report-widgets', [App\Http\Controllers\DashboardController::class, 'financialReportWidgets']);
    Route::get('/dashboard/financial-transactions', [App\Http\Controllers\DashboardController::class, 'financialTransactions']);

    Route::post('users/{user}/roles', [App\Http\Controllers\UserController::class, 'updateRoles']); // Keep strict admin for changing roles

    // Orders (Kanban) - Allow Admin and Manager
    Route::group(['middleware' => ['role:admin,manager']], function () {
        Route::get('orders/report', [App\Http\Controllers\OrderController::class, 'report']);
        Route::get('orders', [App\Http\Controllers\OrderController::class, 'index']);
        Route::put('orders/{order}/status', [App\Http\Controllers\OrderController::class, 'updateStatus']);
        Route::post('orders/{order}/dispatch', [App\Http\Controllers\OrderController::class, 'dispatchOrder']);
    });
    
    // Admin Product Management (Write)
    Route::get('products/report', [App\Http\Controllers\ProductController::class, 'report']);
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
    Route::get('payments/{id}', [App\Http\Controllers\PaymentController::class, 'show']);
    Route::post('payments', [App\Http\Controllers\PaymentController::class, 'store']);
    Route::post('payments/{id}', [App\Http\Controllers\PaymentController::class, 'update']);
    Route::delete('payments/{id}', [App\Http\Controllers\PaymentController::class, 'destroy']);
    Route::delete('payments/attachments/{id}', [App\Http\Controllers\PaymentController::class, 'destroyAttachment']);

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
    Route::get('/drivers', [App\Http\Controllers\DriverController::class, 'index']);
    Route::post('/drivers', [App\Http\Controllers\DriverController::class, 'store']);
});

// Webhooks (Public)
Route::post('/webhooks/mercadopago', [App\Http\Controllers\WebhookController::class, 'handleMercadoPago']);
Route::post('/webhooks/geologistics', [App\Http\Controllers\WebhookController::class, 'handleGeoLogistics']);

// Authenticated Routes (Customers & Admins)
Route::group(['middleware' => ['api', 'auth:api']], function () {
    // Orders
    Route::get('orders/my-orders', [App\Http\Controllers\OrderController::class, 'myOrders']);
    Route::post('orders', [App\Http\Controllers\OrderController::class, 'store']);
    Route::post('orders/{order}/pay', [App\Http\Controllers\PaymentController::class, 'payOrder']);
    Route::post('orders/{order}/verify-payment', [App\Http\Controllers\OrderController::class, 'verifyPayment']);
    Route::get('orders/{order}', [App\Http\Controllers\OrderController::class, 'show']);

    // Customer Addresses
    Route::apiResource('addresses', App\Http\Controllers\CustomerAddressController::class);
    Route::post('delivery/estimate', [App\Http\Controllers\OrderController::class, 'estimateDelivery']);
});
