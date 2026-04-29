<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to your application's "home" route.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        // SECURITY: General API rate limit - 60 requests per minute
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // SECURITY: Strict rate limit for login attempts - 5 per minute
        RateLimiter::for('login', function (Request $request) {
            // More lenient in development
            $maxAttempts = config('app.env') === 'production' ? 5 : 20;
            return Limit::perMinute($maxAttempts)->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Too many login attempts. Please try again later.'
                    ], 429);
                });
        });

        // SECURITY: Rate limit for password reset - 3 per hour
        RateLimiter::for('password-reset', function (Request $request) {
            return Limit::perHour(3)->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Too many password reset attempts. Please try again later.'
                    ], 429);
                });
        });

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }
}
