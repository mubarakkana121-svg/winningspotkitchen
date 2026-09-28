<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MenuItemController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\TipReportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Winning Spot Kitchen — API v1
|--------------------------------------------------------------------------
|
| Public:
|   GET    /api/v1/menu
|   GET    /api/v1/menu/{menuItem}
|   POST   /api/v1/orders
|   POST   /api/v1/reservations
|   POST   /api/v1/login
|
| Staff (bearer token):
|   POST   /api/v1/admin/logout
|   GET    /api/v1/admin/orders
|   PATCH  /api/v1/admin/orders/{order}/status
|   GET    /api/v1/admin/reservations
|   PATCH  /api/v1/admin/reservations/{reservation}/status
|   GET    /api/v1/admin/tips/report
|   (plus menu-items CRUD for manager/supervisor)
*/

Route::prefix('v1')->group(function () {
    // -------- Public menu --------
    Route::get('menu', [MenuItemController::class, 'index']);
    Route::get('menu/{menuItem}', [MenuItemController::class, 'show']);

    // -------- Public orders & reservations --------
    Route::post('orders', [OrderController::class, 'store'])->middleware('throttle:10,1');
    Route::post('reservations', [ReservationController::class, 'store'])->middleware('throttle:5,1');

    // -------- Staff auth --------
    Route::post('login', [AuthController::class, 'login']);

    // -------- Authenticated staff area --------
    Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);

        // Manager + Supervisor
        Route::middleware('role:manager,supervisor')->group(function () {
            Route::apiResource('menu-items', MenuItemController::class)->except(['index', 'show']);
            Route::get('reservations', [ReservationController::class, 'index']);
            Route::patch('reservations/{reservation}/status', [ReservationController::class, 'updateStatus']);
        });

        // Manager + Supervisor + Staff
        Route::middleware('role:manager,supervisor,staff')->group(function () {
            Route::get('orders', [OrderController::class, 'index']);
            Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus']);
        });

        // Manager only
        Route::middleware('role:manager')->group(function () {
            Route::get('tips/report', [TipReportController::class, 'index']);
        });
    });
});