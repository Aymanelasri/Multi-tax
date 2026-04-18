<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PasswordController extends Controller
{

    public function update(Request $request)
    {
        // ✅ Get authenticated user
        $user = auth()->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // ✅ Validate input
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ], [
            'current_password.required' => 'Le mot de passe actuel est requis.',
            'new_password.required' => 'Le nouveau mot de passe est requis.',
            'new_password.min' => 'Le nouveau mot de passe doit contenir au minimum 8 caractères.',
            'new_password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
        ]);

        // ✅ Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Le mot de passe actuel est incorrect.',
                'field' => 'current_password'
            ], 401);
        }

        // ✅ Prevent same password
        if (Hash::check($validated['new_password'], $user->password)) {
            return response()->json([
                'message' => 'Le nouveau mot de passe doit être différent de l\'ancien.',
                'field' => 'new_password'
            ], 422);
        }

        // ✅ Update password (Laravel's password cast automatically hashes)
        $user->update([
            'password' => Hash::make($validated['new_password'])
        ]);

        // ✅ Log the action
        \Log::info('Password updated', [
            'user_id' => $user->id,
            'email' => $user->email,
            'timestamp' => now()
        ]);

        // ✅ Return success (NO password in response)
        return response()->json([
            'message' => 'Mot de passe mis à jour avec succès.',
            'success' => true
        ], 200);
    }
}
