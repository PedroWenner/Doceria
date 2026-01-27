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
    Route::post('logout', [App\Http\Controllers\AuthController::class, 'logout']);
    Route::post('refresh', [App\Http\Controllers\AuthController::class, 'refresh']);
    Route::post('me', [App\Http\Controllers\AuthController::class, 'me']);
});

Route::group(['middleware' => ['api', 'auth:api', 'role:admin']], function () {
    Route::get('/users', [App\Http\Controllers\UserController::class, 'index']);
    Route::put('/users/{user}/roles', [App\Http\Controllers\UserController::class, 'updateRoles']);
    Route::get('/roles', [App\Http\Controllers\UserController::class, 'roles']);
});
