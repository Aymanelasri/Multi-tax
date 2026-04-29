<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * SECURITY: Verify user is authenticated AND has admin role
     * Also checks if user is approved
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // SECURITY: Check if user exists
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated. Please log in.'
            ], 401);
        }

        // SECURITY: Check if user has admin role
        if ($user->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        // SECURITY: Check if admin is approved
        if ($user->status !== 'approved') {
            return response()->json([
                'status' => 'error',
                'message' => 'Account not approved. Contact system administrator.'
            ], 403);
        }

        return $next($request);
    }
}
