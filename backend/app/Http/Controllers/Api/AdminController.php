<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Societe;
use App\Models\Declaration;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function stats(Request $request)
    {
        $totalUsers = User::count();
        $pendingUsers = User::where('status', 'pending')->count();
        $approvedCount = User::where('status', 'approved')->count();
        $rejectedCount = User::where('status', 'rejected')->count();
        $totalSocietes = Societe::count();
        $totalDeclarations = Declaration::count();

        // Get users created this month
        $newUsersThisMonth = User::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Get declarations created this month
        $declarationsThisMonth = Declaration::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Calculate averages
        $avgSocietesPerUser = $totalUsers > 0 ? $totalSocietes / $totalUsers : 0;
        $avgDeclarationsPerUser = $totalUsers > 0 ? $totalDeclarations / $totalUsers : 0;

        // Monthly user registration data (last 6 months)
        $monthlyUsers = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $count = User::where('role', '!=', 'admin')
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
            $monthlyUsers[] = [
                'month' => $month->format('M'),
                'name' => $month->format('F'),
                'value' => $count,
                'count' => $count,
            ];
        }

        // User status breakdown
        $userStatus = [
            'approved' => $approvedCount,
            'pending' => $pendingUsers,
            'rejected' => $rejectedCount,
        ];

        // Most active user (by declarations)
        $mostActiveUser = User::withCount('declarations')
            ->where('role', '!=', 'admin')
            ->orderBy('declarations_count', 'desc')
            ->first();
        $mostActiveUserData = [
            'name' => $mostActiveUser ? $mostActiveUser->name : 'N/A',
            'count' => $mostActiveUser ? $mostActiveUser->declarations_count : 0,
            'email' => $mostActiveUser ? $mostActiveUser->email : '',
        ];

        // Recent activity - combine multiple event types
        $recentActivity = [];

        // Recent user registrations
        $recentUsers = User::where('role', '!=', 'admin')
            ->latest('created_at')
            ->take(5)
            ->get();
        foreach ($recentUsers as $user) {
            $recentActivity[] = [
                'type' => 'new_user',
                'description' => "Nouvel utilisateur: {$user->name}",
                'email' => $user->email,
                'created_at' => $user->created_at,
            ];
        }

        // Recent declarations
        $recentDeclarations = Declaration::latest('created_at')
            ->take(5)
            ->with('user:id,name,email')
            ->get();
        foreach ($recentDeclarations as $decl) {
            $recentActivity[] = [
                'type' => 'declaration',
                'description' => "Déclaration: " . ($decl->reference ?? 'DECL-' . $decl->id),
                'email' => $decl->user ? $decl->user->email : 'unknown',
                'created_at' => $decl->created_at,
            ];
        }

        // Recent approvals
        $recentApprovals = User::where('status', 'approved')
            ->latest('updated_at')
            ->take(3)
            ->get();
        foreach ($recentApprovals as $user) {
            $recentActivity[] = [
                'type' => 'approved',
                'description' => "Utilisateur approuvé: {$user->name}",
                'email' => $user->email,
                'created_at' => $user->updated_at,
            ];
        }

        // Sort by most recent first and take top 10
        usort($recentActivity, function($a, $b) {
            return $b['created_at']->timestamp - $a['created_at']->timestamp;
        });
        $recentActivity = array_slice($recentActivity, 0, 10);

        // Unread messages count
        $unreadMessagesCount = 0;
        try {
            $unreadMessagesCount = Contact::where('status', 'unread')->count();
        } catch (\Exception $e) {
            // Table doesn't exist yet
        }

        return response()->json([
            'totalUsers' => $totalUsers,
            'pendingUsers' => $pendingUsers,
            'approvedCount' => $approvedCount,
            'rejectedCount' => $rejectedCount,
            'totalSocietes' => $totalSocietes,
            'totalDeclarations' => $totalDeclarations,
            'newUsersThisMonth' => $newUsersThisMonth,
            'declarationsThisMonth' => $declarationsThisMonth,
            'avgSocietesPerUser' => round($avgSocietesPerUser, 2),
            'avgDeclarationsPerUser' => round($avgDeclarationsPerUser, 2),
            'monthlyUsers' => $monthlyUsers,
            'userStatus' => $userStatus,
            'mostActiveUser' => $mostActiveUserData,
            'recentActivity' => $recentActivity,
            'unreadMessagesCount' => $unreadMessagesCount,
        ]);
    }

    /**
     * Get all users
     */
    public function users(Request $request)
    {
        $users = User::withCount(['societes', 'declarations'])
            ->where('email', '!=', 'admin@tax.ma')
            ->where('role', '!=', 'admin')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'firstname' => $user->firstname ?? explode(' ', $user->name)[0] ?? '',
                    'lastname' => $user->lastname ?? (explode(' ', $user->name)[1] ?? ''),
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'company' => $user->company ?? '',
                    'status' => $user->status,
                    'role' => $user->role,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                    'societes_count' => $user->societes_count,
                    'declarations_count' => $user->declarations_count,
                ];
            });

        return response()->json($users);
    }

    /**
     * Get pending users (awaiting approval)
     */
    public function pendingUsers(Request $request)
    {
        $pending = User::where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'firstname' => $user->firstname ?? explode(' ', $user->name)[0] ?? '',
                    'lastname' => $user->lastname ?? (explode(' ', $user->name)[1] ?? ''),
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'company' => $user->company ?? '',
                    'status' => $user->status,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                ];
            });

        return response()->json($pending);
    }

    /**
     * Approve a user
     */
    public function approve(Request $request, User $user)
    {
        $user->update(['status' => 'approved']);

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
        $user->update(['status' => 'rejected']);

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
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully',
        ], 200);
    }

    /**
     * Update a user's information
     */
    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'status' => 'sometimes|in:pending,approved,rejected',
            'role' => 'sometimes|in:user,admin'
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ], 200);
    }

    /**
     * Get users with societes (grouped by user)
     */
    public function usersWithSocietes(Request $request)
    {
        $users = User::withCount('societes')
            ->has('societes')
            ->where('role', '!=', 'admin')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'first_name' => $user->firstname ?? explode(' ', $user->name)[0] ?? '',
                    'last_name' => $user->lastname ?? (explode(' ', $user->name)[1] ?? ''),
                    'name' => $user->name,
                    'email' => $user->email,
                    'company' => $user->company ?? '',
                    'status' => $user->status,
                    'societes_count' => $user->societes_count,
                    'created_at' => $user->created_at,
                ];
            });

        return response()->json($users);
    }

    /**
     * Get societes for a specific user
     */
    public function userSocietes(Request $request, User $user)
    {
        $societes = Societe::where('user_id', $user->id)
            ->orderBy('nom', 'asc')
            ->get()
            ->map(function ($societe) {
                return [
                    'id' => $societe->id,
                    'nom' => $societe->nom,
                    'if' => $societe->if,
                    'ice' => $societe->ice,
                    'rc' => $societe->rc,
                    'adresse' => $societe->adresse,
                    'ville' => $societe->ville,
                    'tel' => $societe->tel,
                    'email' => $societe->email,
                    'created_at' => $societe->created_at,
                    'updated_at' => $societe->updated_at,
                ];
            });

        return response()->json($societes);
    }

    /**
     * Get all companies (societes)
     */
    public function companies(Request $request)
    {
        $companies = Societe::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($societe) {
                return [
                    'id' => $societe->id,
                    'nom' => $societe->nom,
                    'if_value' => $societe->if_value,
                    'ice_value' => $societe->ice_value,
                    'ville' => $societe->ville,
                    'owner_email' => $societe->user->email ?? '',
                    'usage_count' => 0, // You can implement usage tracking
                    'created_at' => $societe->created_at,
                ];
            });

        return response()->json($companies);
    }

    /**
     * Get all declarations
     */
    public function declarations(Request $request)
    {
        $declarations = Declaration::with('user:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($declaration) {
                return [
                    'id' => $declaration->id,
                    'reference' => $declaration->reference ?? 'DECL-' . $declaration->id,
                    'user_name' => $declaration->user->name ?? '',
                    'user_email' => $declaration->user->email ?? '',
                    'annee' => $declaration->annee,
                    'periode' => $declaration->periode,
                    'regime' => $declaration->regime,
                    'invoices_count' => 0, // You can implement invoice counting
                    'total_ttc' => $declaration->total_ttc ?? null,
                    'status' => $declaration->status ?? 'generated',
                    'created_at' => $declaration->created_at,
                ];
            });

        return response()->json($declarations);
    }

    /**
     * Update admin profile (name and email)
     */
    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $request->user()->id,
        ]);

        $user = $request->user();
        $user->update($validated);

        return response()->json($user);
    }

    /**
     * Update admin password
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8',
            'new_password_confirmation' => 'required|string|same:new_password',
        ]);

        $user = $request->user();

        // Check current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect',
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json([
            'message' => 'Password updated successfully',
        ]);
    }

    /**
     * Get all contact messages
     */
    public function messages(Request $request)
    {
        $messages = Contact::orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($messages);
    }

    /**
     * Mark message as read
     */
    public function markMessageAsRead(Request $request, Contact $contact)
    {
        $contact->update(['status' => 'read']);

        return response()->json([
            'message' => 'Message marked as read',
            'contact' => $contact,
        ]);
    }
}
