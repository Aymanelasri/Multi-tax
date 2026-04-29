<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Simple health check route for API-only backend.
| Frontend is served separately as a React SPA.
|
*/

Route::get('/', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'SIMPL-TVA API is running',
        'version' => '1.0.0'
    ]);
});
