<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Societe;
use App\Models\Declaration;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function stats(Request $request)
    {
        $this->authorize('admin');

        $stats = [
            'total_users' => User::count(),
            'pending_users' => User::where('status', 'pending')->count(),
            'approved_users' => User::where('status', 'approved')->count(),
            'rejected_users' => User::where('status', 'rejected')->count(),
            'total_companies' => Societe::count(),
            'total_declarations' => Declaration::count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get all users
     */
    public function users(Request $request)
    {
        $this->authorize('admin');

        $users = User::orderBy('created_at', 'desc')->get();

        return response()->json(['data' => $users]);
    }

    /**
     * Get pending users (awaiting approval)
     */
    public function pendingUsers(Request $request)
    {
        $this->authorize('admin');

        $pending = User::where('status', 'pending')->orderBy('created_at', 'desc')->get();

        return response()->json(['data' => $pending]);
    }

    /**
     * Approve a user
     */
    public function approve(Request $request, User $user)
    {
        $this->authorize('admin');

        $user->update(['status' => 'approved']);

        // TODO: Send "account activated" email to user

        return response()->json([
            'message' => 'User approved successfully',
            'user' => $user,
        ]);
    }

    /**
     * Reject a user
     */
    public function reject(Request $request, User $user)
    {
        $this->authorize('admin');

        $user->update(['status' => 'rejected']);

        // TODO: Send "account rejected" email to user

        return response()->json([
            'message' => 'User rejected',
            'user' => $user,
        ]);
    }

    /**
     * Delete a user
     */
    public function deleteUser(Request $request, User $user)
    {
        $this->authorize('admin');

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ], 200);
    }

    /**
     * Get all companies (societes)
     */
    public function companies(Request $request)
    {
        $this->authorize('admin');

        $companies = Societe::orderBy('created_at', 'desc')->get();

        return response()->json(['data' => $companies]);
    }

    /**
     * Get all declarations
     */
    public function declarations(Request $request)
    {
        $this->authorize('admin');

        $declarations = Declaration::orderBy('created_at', 'desc')->get();

        return response()->json(['data' => $declarations]);
    }
}
