<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => ['required', 'confirmed', Password::min(6)],
        ]);

        // Combine first and last name
        $fullName = trim($validated['firstname'] . ' ' . $validated['lastname']);

        $user = User::create([
            'name' => $fullName,
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'status' => 'pending', // Users need approval
            'role' => 'user',
        ]);

        // Send email verification
        event(new Registered($user));

        return response()->json([
            'status' => 'success',
            'code' => 201,
            'message' => 'User registered successfully. Please check your email to verify your account.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'role' => $user->role,
            ],
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'status' => 'error',
                'code' => 401,
                'message' => 'Invalid email or password'
            ], 401);
        }

        // DEV: Skip email verification check in development
        if (config('app.env') === 'production') {
            if (!$user->email_verified_at) {
                return response()->json([
                    'status' => 'error',
                    'code' => 403,
                    'message' => 'Email not verified. Please check your inbox.'
                ], 403);
            }
        }

        // Allow login regardless of approval status
        // Frontend will handle access restrictions based on user.status
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'code' => 200,
            'message' => 'Login successful',
            'token' => $token,
            'user' => $user,
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

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
}
