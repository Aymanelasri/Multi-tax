<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Public API endpoints - no CSRF needed for Sanctum token auth
        'api/login',
        'api/register',
        'api/password/*',
        'api/email/*',
    ];
}
