<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // If user is authenticated (legacy route)
        if ($request->user()) {
            if ($request->user()->hasVerifiedEmail()) {
                return response()->json([
                    'status' => 'success',
                    'code' => 200,
                    'message' => 'Email already verified'
                ], 200);
            }

            $request->user()->sendEmailVerificationNotification();

            return response()->json([
                'status' => 'success',
                'code' => 200,
                'message' => 'Verification link sent to your email'
            ], 200);
        }

        // If no authenticated user, expect email in request (public route)
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email address not found.',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'status' => 'success',
                'code' => 200,
                'message' => 'Email already verified'
            ], 200);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'status' => 'success',
            'code' => 200,
            'message' => 'Verification link sent to your email'
        ], 200);
    }
}
