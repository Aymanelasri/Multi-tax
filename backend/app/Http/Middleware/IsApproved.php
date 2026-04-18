<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsApproved
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'code' => 401,
                'message' => 'Unauthorized'
            ], 401);
        }

        if ($user->status !== 'approved') {
            return response()->json([
                'status' => 'error',
                'code' => 403,
                'message' => 'Votre compte est en attente d\'approbation. Vous ne pouvez pas accéder à cette section pour le moment.'
            ], 403);
        }

        return $next($request);
    }
}
