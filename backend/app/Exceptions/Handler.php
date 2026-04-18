<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $e
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     *
     * @throws \Throwable
     */
    public function render($request, Throwable $e)
    {
        // Check if this is an API request
        if ($request->expectsJson() || $request->is('api/*')) {
            return $this->renderJsonResponse($request, $e);
        }

        return parent::render($request, $e);
    }

    /**
     * Render a JSON response for API errors.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $e
     * @return \Illuminate\Http\JsonResponse
     */
    private function renderJsonResponse($request, Throwable $e)
    {
        // Authentication Exception (401)
        if ($e instanceof AuthenticationException) {
            return response()->json([
                'status' => 'error',
                'code' => 401,
                'message' => 'Unauthenticated. Please log in.'
            ], 401);
        }

        // Validation Exception (422)
        if ($e instanceof ValidationException) {
            return response()->json([
                'status' => 'error',
                'code' => 422,
                'message' => 'Validation failed.',
                'errors' => $e->errors()
            ], 422);
        }

        // Model Not Found Exception (404)
        if ($e instanceof ModelNotFoundException) {
            return response()->json([
                'status' => 'error',
                'code' => 404,
                'message' => 'Resource not found.'
            ], 404);
        }

        // Not Found Exception (404)
        if ($e instanceof NotFoundHttpException) {
            return response()->json([
                'status' => 'error',
                'code' => 404,
                'message' => 'Resource not found.'
            ], 404);
        }

        // Method Not Allowed Exception (405)
        if ($e instanceof MethodNotAllowedHttpException) {
            return response()->json([
                'status' => 'error',
                'code' => 405,
                'message' => 'Method not allowed.'
            ], 405);
        }

        // Custom Email Not Verified Response (403)
        if ($e instanceof \Exception && str_contains($e->getMessage(), 'Email not verified')) {
            return response()->json([
                'status' => 'error',
                'code' => 403,
                'message' => 'Email not verified. Please check your inbox.'
            ], 403);
        }

        // Server Error (500)
        $statusCode = $this->getStatusCode($e);

        if ($statusCode >= 500) {
            return response()->json([
                'status' => 'error',
                'code' => 500,
                'message' => 'Server error. Please try again later.'
            ], 500);
        }

        // Default error response
        return response()->json([
            'status' => 'error',
            'code' => $statusCode,
            'message' => $e->getMessage() ?: 'An error occurred.'
        ], $statusCode);
    }

    /**
     * Get the status code from the exception.
     *
     * @param  \Throwable  $e
     * @return int
     */
    private function getStatusCode(Throwable $e): int
    {
        if (method_exists($e, 'getStatusCode')) {
            return $e->getStatusCode();
        }

        return 500;
    }
}
