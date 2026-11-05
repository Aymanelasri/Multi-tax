<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\SendVerificationEmail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'nullable|string|max:255',
                'firstname' => 'nullable|string|max:255',
                'lastname' => 'nullable|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone' => 'nullable|string|max:20',
                'password' => ['required', 'confirmed', Password::min(6)],
            ]);

            $fullName = trim((string) ($validated['name'] ?? ''));
            if ($fullName === '') {
                $firstName = trim((string) ($validated['firstname'] ?? ''));
                $lastName = trim((string) ($validated['lastname'] ?? ''));
                $fullName = trim($firstName . ' ' . $lastName);
            }

            if ($fullName === '') {
                throw ValidationException::withMessages([
                    'name' => ['The name field is required.'],
                ]);
            }

            // Generate a unique verification token
            $verificationToken = Str::random(64);

            // Persist a pending user immediately so the account exists before email verification.
            $user = User::create([
                'name' => $fullName,
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => Hash::make($validated['password']),
                'status' => 'pending',
                'role' => 'user',
                'email_verified_at' => null,
            ]);

            // Store registration data in cache for 24 hours
            // Cache key format: registration_pending:{token}
            $cacheKey = 'registration_pending:' . $verificationToken;
            $emailCacheKey = 'registration_email:' . $validated['email'];

            $registrationData = [
                'name' => $fullName,
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => $user->password,
                'verification_token' => $verificationToken,
            ];

            Cache::put($cacheKey, $registrationData, now()->addDay());
            // Also cache the token by email for resend functionality
            Cache::put($emailCacheKey, $verificationToken, now()->addDay());

            // Send verification email with the token
            // Create a temporary notification object to send the email
            $tempUser = new \stdClass();
            $tempUser->email = $validated['email'];
            $tempUser->name = $fullName;
            $tempUser->verification_token = $verificationToken;

            // Send the verification email (non-blocking)
            try {
                (new SendVerificationEmail())->send($tempUser);
            } catch (\Throwable $mailException) {
                Log::error('Verification email failed: ' . $mailException->getMessage(), [
                    'email' => $validated['email'],
                ]);
                // Continue registration even if email fails
            }

            return response()->json([
                'status' => 'success',
                'code' => 201,
                'message' => 'Registration successful! Please check your email to verify your account. The link will expire in 24 hours.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'status' => $user->status,
                    'role' => $user->role,
                ],
            ], 201);
        } catch (ValidationException $e) {
            // Handle validation errors (e.g., duplicate email, invalid format)
            return response()->json([
                'status' => 'error',
                'code' => 422,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Registration error: ' . $e->getMessage(), [
                'exception' => $e,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => 'error',
                'code' => 500,
                'message' => 'Registration failed',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'debug' => config('app.debug') ? $e->getTraceAsString() : null,
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            $user = User::where('email', $validated['email'])->first();

            // SECURITY: Check credentials
            if (!$user || !Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'code' => 401,
                    'message' => 'Invalid email or password'
                ], 401);
            }

            // SECURITY: Check if user is pending before allowing login
            if ($user->status === 'pending') {
                return response()->json([
                    'status' => 'error',
                    'code' => 403,
                    'message' => 'Your account is pending approval. An administrator will review your request.'
                ], 403);
            }

            // SECURITY: Check if user is rejected
            if ($user->status === 'rejected') {
                return response()->json([
                    'status' => 'error',
                    'code' => 403,
                    'message' => 'Your account has been rejected. Please contact support.'
                ], 403);
            }

            // SECURITY: Check email verification (production only)
            if (config('app.env') === 'production') {
                if (!$user->email_verified_at) {
                    return response()->json([
                        'status' => 'error',
                        'code' => 403,
                        'message' => 'Email not verified. Please check your inbox.'
                    ], 403);
                }
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'code' => 200,
                'message' => 'Login successful',
                'token' => $token,
                'user' => $user,
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'code' => 422,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Login error: ' . $e->getMessage(), [
                'exception' => $e,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => 'error',
                'code' => 500,
                'message' => 'Login failed due to a server error.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Resend verification email for pending registration
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resendVerificationEmail(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
            ]);

            $email = $validated['email'];
            $emailCacheKey = 'registration_email:' . $email;

            // First check if user already exists in database
            if (User::where('email', $email)->exists()) {
                return response()->json([
                    'status' => 'error',
                    'code' => 409,
                    'message' => 'This email is already registered. Please log in instead.'
                ], 409);
            }

            // Look for pending registration token using email cache key
            $verificationToken = Cache::get($emailCacheKey);

            if (!$verificationToken) {
                return response()->json([
                    'status' => 'error',
                    'code' => 404,
                    'message' => 'No pending registration found for this email. Please register or check your email.'
                ], 404);
            }

            // Retrieve the full registration data
            $cacheKey = 'registration_pending:' . $verificationToken;
            $registrationData = Cache::get($cacheKey);

            if (!$registrationData) {
                return response()->json([
                    'status' => 'error',
                    'code' => 400,
                    'message' => 'Verification data expired. Please register again.'
                ], 400);
            }

            // Resend the verification email
            $tempUser = new \stdClass();
            $tempUser->email = $email;
            $tempUser->name = $registrationData['name'];
            $tempUser->verification_token = $verificationToken;

            try {
                (new SendVerificationEmail())->send($tempUser);
            } catch (\Throwable $mailException) {
                Log::error('Resend email failed: ' . $mailException->getMessage());
            }

            // Refresh the cache expiry
            Cache::put($cacheKey, $registrationData, now()->addDay());
            Cache::put($emailCacheKey, $verificationToken, now()->addDay());

            return response()->json([
                'status' => 'success',
                'code' => 200,
                'message' => 'Verification email resent successfully. Please check your inbox.',
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Resend verification error: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'status' => 'error',
                'code' => 500,
                'message' => 'Failed to resend verification email',
                'error' => $e->getMessage(),
                'debug' => config('app.debug') ? $e->getTraceAsString() : null,
            ], 500);
        }
    }

    /**
     * Verify email token and create user in database
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyEmail(Request $request)
    {
        try {
            $validated = $request->validate([
                'token' => 'required|string',
            ]);

            $token = $validated['token'];
            $cacheKey = 'registration_pending:' . $token;

            // Retrieve registration data from cache
            $registrationData = Cache::get($cacheKey);

            if (!$registrationData) {
                return response()->json([
                    'status' => 'error',
                    'code' => 400,
                    'message' => 'Invalid or expired verification link. Please register again.'
                ], 400);
            }

            // If the user already exists, simply mark the email as verified and continue.
            $user = User::where('email', $registrationData['email'])->first();

            if (!$user) {
                $user = User::create([
                    'name' => $registrationData['name'],
                    'email' => $registrationData['email'],
                    'phone' => $registrationData['phone'],
                    'password' => $registrationData['password'],
                    'status' => 'pending',
                    'role' => 'user',
                    'email_verified_at' => now(),
                ]);
            } else {
                if (empty($user->email_verified_at)) {
                    $user->update(['email_verified_at' => now()]);
                }
            }

            // Clear the cache key
            Cache::forget($cacheKey);

            // Fire the Registered event
            event(new Registered($user));

            return response()->json([
                'status' => 'success',
                'code' => 200,
                'message' => 'Email verified successfully! Your account is now active. You can now log in.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'status' => $user->status,
                    'role' => $user->role,
                    'email_verified_at' => $user->email_verified_at,
                ],
            ], 200);
        } catch (\Throwable $e) {
            Log::error('Email verification error: ' . $e->getMessage(), [
                'exception' => $e,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => 'error',
                'code' => 500,
                'message' => 'Email verification failed',
                'error' => $e->getMessage(),
                'debug' => config('app.debug') ? $e->getTraceAsString() : null,
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        // Delete all tokens for the user
        $request->user()->tokens()->delete();

        // SECURITY: Only invalidate session if it exists
        if ($request->hasSession()) {
            // Invalidate the session
            $request->session()->invalidate();

            // Regenerate CSRF token
            $request->session()->regenerateToken();
        }

        return response()->json([
            'status' => 'success',
            'code' => 200,
            'message' => 'Logged out successfully'
        ], 200);
    }

    public function user(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'code' => 200,
            'data' => $request->user()
        ], 200);
    }

    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();

            $validated = $request->validate([
                'firstname' => 'required|string|max:255',
                'lastname' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
            ]);

            // Combine first and last name
            $fullName = trim($validated['firstname'] . ' ' . $validated['lastname']);

            // Update user
            $user->update([
                'name' => $fullName,
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
            ]);

            return response()->json([
                'status' => 'success',
                'code' => 200,
                'message' => 'Profile updated successfully',
                'data' => $user->fresh()
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'code' => 422,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Profile update error: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'status' => 'error',
                'code' => 500,
                'message' => 'Profile update failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
