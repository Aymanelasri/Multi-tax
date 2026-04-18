<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\VerifyEmailController;
use App\Http\Controllers\Api\EmailVerificationNotificationController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\SocieteController;
use App\Http\Controllers\Api\DeclarationController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\HistoriqueController;
use App\Http\Controllers\Api\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Password Reset Routes (public)
Route::post('/password/forgot', [PasswordResetController::class, 'forgotPassword']);
Route::post('/password/reset', [PasswordResetController::class, 'resetPassword']);

// Email Verification Route (public - signature validation built-in)
Route::get('/email/verify/{id}/{hash}', VerifyEmailController::class)
    ->name('verification.verify');

// Email Resend Route (public - for frontend compatibility)
Route::post('/email/resend-verification', [EmailVerificationNotificationController::class, 'store']);

// Email Resend Route (requires authentication - legacy)
Route::middleware('auth:sanctum')->post('/email/resend', [EmailVerificationNotificationController::class, 'store'])
    ->name('verification.resend');

// Protected Routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth endpoints
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/password/update', [PasswordController::class, 'update']);

    // Societes endpoints (require approval)
    Route::middleware('is-approved')->apiResource('societes', SocieteController::class);

    // Declarations endpoints (require approval)
    Route::middleware('is-approved')->apiResource('declarations', DeclarationController::class);

    // Modules endpoints (require approval)
    Route::middleware('is-approved')->apiResource('modules', ModuleController::class);

    // Historique endpoints (require approval)
    Route::middleware('is-approved')->apiResource('historique', HistoriqueController::class);

    // Admin routes (require admin role)
    Route::middleware('is-admin')->group(function () {
        // Dashboard stats
        Route::get('/admin/stats', [AdminController::class, 'stats']);

        // User management
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::get('/admin/users/pending', [AdminController::class, 'pendingUsers']);
        Route::put('/admin/users/{user}/approve', [AdminController::class, 'approve']);
        Route::put('/admin/users/{user}/reject', [AdminController::class, 'reject']);
        Route::delete('/admin/users/{user}', [AdminController::class, 'deleteUser']);

        // Companies list
        Route::get('/admin/societes', [AdminController::class, 'companies']);

        // Declarations list
        Route::get('/admin/declarations', [AdminController::class, 'declarations']);
    });
});

