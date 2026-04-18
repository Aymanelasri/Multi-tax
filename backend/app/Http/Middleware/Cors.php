<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Cors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $allowed_origins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:3001',
            'http://localhost:3002',
        ];

        $origin = $request->header('Origin');

        // Handle preflight OPTIONS request
        if ($request->isMethod('OPTIONS')) {
            return $this->handleCors($origin, $allowed_origins);
        }

        // Handle actual request
        $response = $next($request);

        if (in_array($origin, $allowed_origins)) {
            $response->header('Access-Control-Allow-Origin', $origin);
            $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
            $response->header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
            $response->header('Access-Control-Allow-Credentials', 'true');
            $response->header('Access-Control-Max-Age', '86400');
        }

        return $response;
    }

    /**
     * Handle CORS preflight request
     */
    private function handleCors($origin, $allowed_origins)
    {
        if (in_array($origin, $allowed_origins)) {
            return response()->json([], 200)
                ->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
                ->header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Max-Age', '86400');
        }

        return response()->json([], 200);
    }
}
