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
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\GenerationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Auth Routes (with rate limiting)
Route::middleware('throttle:login')->post('/login', [AuthController::class, 'login']);
Route::middleware('throttle:api')->post('/register', [AuthController::class, 'register']);
Route::middleware('throttle:api')->post('/verify-email', [AuthController::class, 'verifyEmail']);
Route::middleware('throttle:api')->post('/resend-verification-email', [AuthController::class, 'resendVerificationEmail']);

// Password Reset Routes (with rate limiting)
Route::middleware('throttle:password-reset')->post('/password/forgot', [PasswordResetController::class, 'forgotPassword']);
Route::middleware('throttle:password-reset')->post('/password/reset', [PasswordResetController::class, 'resetPassword']);

// Email Verification Route (public - signature validation built-in)
Route::get('/email/verify/{id}/{hash}', VerifyEmailController::class)
    ->name('verification.verify');

// Email Resend Route (public - for frontend compatibility)
Route::post('/email/resend-verification', [AuthController::class, 'resendVerificationEmail']);

// Contact Form Route (public)
Route::post('/contact', [ContactController::class, 'store']);

// Email Resend Route (requires authentication - legacy)
Route::middleware('auth:sanctum')->post('/email/resend', [EmailVerificationNotificationController::class, 'store'])
    ->name('verification.resend');

// Protected Routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth endpoints
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/password/update', [PasswordController::class, 'update']);

    // Societes endpoints (require approval)
    Route::middleware('is-approved')->apiResource('societes', SocieteController::class);
    Route::middleware('is-approved')->get('/societes/my-companies', [SocieteController::class, 'myCompanies']);
    Route::middleware('is-approved')->post('/societes/{societe}/increment-usage', [SocieteController::class, 'incrementUsage']);

    // Declarations endpoints (require approval)
    Route::middleware('is-approved')->apiResource('declarations', DeclarationController::class);

    // Modules endpoints (require approval)
    Route::middleware('is-approved')->apiResource('modules', ModuleController::class);

    // Historique endpoints (require approval)
    Route::middleware('is-approved')->apiResource('historique', HistoriqueController::class);

    // Generations endpoints (require approval)
    Route::middleware('is-approved')->get('/generations/recent', [GenerationController::class, 'recent']);
    Route::middleware('is-approved')->get('/generations', [GenerationController::class, 'index']);
    Route::middleware('is-approved')->post('/generations', [GenerationController::class, 'store']);
    Route::middleware('is-approved')->get('/generations/{id}/download', [GenerationController::class, 'download']);

    // Admin routes (require admin role)
    Route::middleware('is-admin')->group(function () {
        // Dashboard stats
        Route::get('/admin/stats', [AdminController::class, 'stats']);

        // User management
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::post('/admin/users', [AdminController::class, 'store']);
        Route::get('/admin/users/pending', [AdminController::class, 'pendingUsers']);
        Route::get('/admin/users-with-societes', [AdminController::class, 'usersWithSocietes']);
        Route::get('/admin/users/{user}/societes', [AdminController::class, 'userSocietes']);
        Route::put('/admin/users/{user}/approve', [AdminController::class, 'approve']);
        Route::put('/admin/users/{user}/reject', [AdminController::class, 'reject']);
        Route::put('/admin/users/{user}', [AdminController::class, 'updateUser']);
        Route::delete('/admin/users/{user}', [AdminController::class, 'deleteUser']);

        // Companies list
        Route::get('/admin/societes', [AdminController::class, 'companies']);

        // Declarations list
        Route::get('/admin/declarations', [AdminController::class, 'declarations']);

        // Admin profile management
        Route::put('/admin/profile', [AdminController::class, 'updateProfile']);
        Route::put('/admin/password', [AdminController::class, 'updatePassword']);

        // Messages management
        Route::get('/admin/messages', [AdminController::class, 'messages']);
        Route::put('/admin/messages/{contact}/read', [AdminController::class, 'markMessageAsRead']);
    });
});
