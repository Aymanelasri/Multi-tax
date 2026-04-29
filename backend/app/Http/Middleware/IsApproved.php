<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsApproved
{
    /**
     * SECURITY: Verify user is authenticated AND approved
     * Prevents pending/rejected users from accessing protected resources
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // SECURITY: Check if user exists
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'code' => 401,
                'message' => 'Unauthenticated. Please log in.'
            ], 401);
        }

        // SECURITY: Check if user is approved
        if ($user->status !== 'approved') {
            $message = $user->status === 'pending'
                ? 'Votre compte est en attente d\'approbation. Vous ne pouvez pas accéder à cette section pour le moment.'
                : 'Votre compte a été rejeté. Contactez l\'administrateur.';

            return response()->json([
                'status' => 'error',
                'code' => 403,
                'message' => $message
            ], 403);
        }

        // SECURITY: Check if email is verified (production only)
        if (config('app.env') === 'production' && !$user->email_verified_at) {
            return response()->json([
                'status' => 'error',
                'code' => 403,
                'message' => 'Email not verified. Please verify your email address.'
            ], 403);
        }

        return $next($request);
    }
}
