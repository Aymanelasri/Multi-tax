<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Societe;
use App\Models\Declaration;
use App\Models\Contact;
use App\Models\Generation;
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

        // Monthly user registration data (all 12 months of current year)
        $monthlyUsers = [];
        $currentYear = now()->year;
        $monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        
        for ($i = 1; $i <= 12; $i++) {
            $count = User::where('role', '!=', 'admin')
                ->whereYear('created_at', $currentYear)
                ->whereMonth('created_at', $i)
                ->count();
            $monthlyUsers[] = [
                'month' => $monthNames[$i - 1],
                'name' => Carbon::create($currentYear, $i, 1)->format('F'),
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

    /**     * Create a new user (admin only)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:6',
            'status' => 'sometimes|in:pending,approved,rejected',
            'role' => 'sometimes|in:user,admin'
        ]);

        try {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'status' => $validated['status'] ?? 'pending',
                'role' => $validated['role'] ?? 'user',
                'email_verified_at' => now(), // Admin-created users are pre-verified
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'User created successfully',
                'data' => $user
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**     * Delete a user and ALL related data (cascade delete)
     */
    public function deleteUser(Request $request, User $user)
    {
        try {
            DB::beginTransaction();

            // Delete all related data in order
            // 1. Delete generations (file downloads history)
            $user->generations()->delete();

            // 2. Delete historiques (activity history)
            $user->historiques()->delete();

            // 3. Delete declarations
            $user->declarations()->delete();

            // 4. Delete societes (companies)
            $user->societes()->delete();

            // 5. Delete modules (if any)
            $user->modules()->delete();

            // 6. Finally delete the user
            $user->delete();

            DB::commit();

            return response()->json([
                'message' => 'User and all related data deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
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
        $users = User::with('societes')
            ->has('societes')
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
                    'company' => $user->company ?? '',
                    'status' => $user->status,
                    'role' => $user->role,
                    'societes' => $user->societes->map(function ($societe) {
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
                            'user_id' => $societe->user_id,
                            'created_at' => $societe->created_at,
                            'updated_at' => $societe->updated_at,
                            'usage_count' => $societe->usage_count ?? 0,
                        ];
                    })->values(),
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

    /**
     * Get all factures from all generations with pagination and grouping by user
     */
    public function factures(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');
        $year = $request->input('year', 'all');
        $month = $request->input('month', 'all');
        $regime = $request->input('regime', 'all');

        $query = Generation::with(['user:id,name,email'])
            ->where('factures', '>', 0);

        // Apply filters
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if ($year !== 'all') {
            $query->whereYear('created_at', $year);
        }

        if ($month !== 'all') {
            $query->whereMonth('created_at', $month);
        }

        // Filter by regime - IMPROVED: Check actual database values first
        if ($regime !== 'all') {
            if ($regime === 'null') {
                // Filter for null/empty regime
                $query->where(function($q) {
                    $q->whereNull('regime')
                      ->orWhere('regime', '')
                      ->orWhere('regime', '—');
                });
            } else if ($regime === 'mensuel') {
                // Match: mensuel, Mensuel, M, m, 1, or extract from filename
                $query->where(function($q) {
                    $q->whereRaw('LOWER(regime) = ?', ['mensuel'])
                      ->orWhere('regime', 'Mensuel')
                      ->orWhere('regime', 'M')
                      ->orWhere('regime', 'm')
                      ->orWhere('regime', '1')
                      // Also match if regime is null but filename suggests mensuel (P5-P12)
                      ->orWhere(function($subQ) {
                          $subQ->whereNull('regime')
                               ->where(function($fileQ) {
                                   for ($i = 5; $i <= 12; $i++) {
                                       $fileQ->orWhere('file_name', 'like', "%_P{$i}%")
                                             ->orWhere('file_name', 'like', "%_P{$i}.%")
                                             ->orWhere('periode', 'P' . $i)
                                             ->orWhere('periode', (string)$i);
                                   }
                               });
                      });
                });
            } else if ($regime === 'trimestriel') {
                // Match: trimestriel, Trimestriel, T, t, 2, or extract from filename
                $query->where(function($q) {
                    $q->whereRaw('LOWER(regime) = ?', ['trimestriel'])
                      ->orWhere('regime', 'Trimestriel')
                      ->orWhere('regime', 'T')
                      ->orWhere('regime', 't')
                      ->orWhere('regime', '2')
                      // Also match if regime is null but filename suggests trimestriel (P1-P4)
                      ->orWhere(function($subQ) {
                          $subQ->whereNull('regime')
                               ->where(function($fileQ) {
                                   for ($i = 1; $i <= 4; $i++) {
                                       $fileQ->orWhere('file_name', 'like', "%_P{$i}%")
                                             ->orWhere('file_name', 'like', "%_P{$i}.%")
                                             ->orWhere('periode', 'P' . $i)
                                             ->orWhere('periode', (string)$i);
                                   }
                               });
                      });
                });
            }
        }

        $generations = $query->orderBy('created_at', 'desc')->get();

        // Group by user
        $groupedByUser = [];
        foreach ($generations as $generation) {
            $userId = $generation->user_id;
            $userName = $generation->user->name ?? 'N/A';
            $userEmail = $generation->user->email ?? '';

            // Get regime from database column (fallback to extraction from filename)
            $regimeValue = $generation->regime;
            
            // Normalize regime value
            if (!$regimeValue || $regimeValue === '' || $regimeValue === '—' || $regimeValue === 'Non défini') {
                // Fallback: Extract from file_name if regime column is null
                $fileName = $generation->file_name ?? '';
                if (preg_match('/[_\s]P(\d+)/i', $fileName, $matches)) {
                    $periodNum = intval($matches[1]);
                    if ($periodNum >= 1 && $periodNum <= 4) {
                        $regimeValue = 'Trimestriel';
                    } else if ($periodNum >= 5 && $periodNum <= 12) {
                        $regimeValue = 'Mensuel';
                    } else {
                        $regimeValue = 'Non défini';
                    }
                } else {
                    $regimeValue = 'Non défini';
                }
            } else {
                // Normalize existing regime values
                $regimeLower = strtolower($regimeValue);
                if (in_array($regimeLower, ['mensuel', 'm', '1'])) {
                    $regimeValue = 'Mensuel';
                } else if (in_array($regimeLower, ['trimestriel', 't', '2'])) {
                    $regimeValue = 'Trimestriel';
                } else {
                    $regimeValue = ucfirst($regimeValue);
                }
            }

            $regimeDisplay = $regimeValue;

            // Format période for display based on régime
            $periodeDisplay = $generation->periode ?? 'P1';
            $periodNum = intval(preg_replace('/[^0-9]/', '', $periodeDisplay));
            
            if ($regimeValue === 'Trimestriel' && $periodNum >= 1 && $periodNum <= 4) {
                $periodeDisplay = 'T' . $periodNum;
            } else {
                $periodeDisplay = 'P' . $periodNum;
            }

            $declaration = [
                'id' => $generation->id,
                'numero_declaration' => $generation->reference,
                'regime' => $regimeDisplay,
                'periode' => $periodeDisplay,
                'nb_factures' => $generation->factures,
                'created_at' => $generation->created_at,
            ];

            if (!isset($groupedByUser[$userId])) {
                $groupedByUser[$userId] = [
                    'user_id' => $userId,
                    'user_name' => $userName,
                    'user_email' => $userEmail,
                    'total_factures' => 0,
                    'last_date' => $generation->created_at,
                    'declarations' => []
                ];
            }

            $groupedByUser[$userId]['total_factures'] += $generation->factures;
            $groupedByUser[$userId]['declarations'][] = $declaration;

            // Update last_date if this is more recent
            if ($generation->created_at > $groupedByUser[$userId]['last_date']) {
                $groupedByUser[$userId]['last_date'] = $generation->created_at;
            }
        }

        // Convert to array and paginate manually
        $groupedData = array_values($groupedByUser);
        $total = count($groupedData);
        $currentPage = $request->input('page', 1);
        $offset = ($currentPage - 1) * $perPage;
        $paginatedData = array_slice($groupedData, $offset, $perPage);

        return response()->json([
            'data' => $paginatedData,
            'current_page' => (int)$currentPage,
            'last_page' => (int)ceil($total / $perPage),
            'per_page' => (int)$perPage,
            'total' => $total,
            'from' => $offset + 1,
            'to' => min($offset + $perPage, $total),
        ]);
    }

    /**
     * Get monthly comparison data (factures vs generations)
     */
    public function monthlyComparison(Request $request)
    {
        $year = $request->input('year', date('Y'));

        // Get monthly factures count from generations table
        $monthlyFactures = Generation::selectRaw('MONTH(created_at) as month, SUM(factures) as factures')
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        // Get monthly generations count from generations table
        $monthlyGenerations = Generation::selectRaw('MONTH(created_at) as month, COUNT(*) as declarations')
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        // Combine data for all 12 months
        $data = [];
        for ($month = 1; $month <= 12; $month++) {
            $data[] = [
                'month' => $month,
                'factures' => $monthlyFactures->get($month)->factures ?? 0,
                'declarations' => $monthlyGenerations->get($month)->declarations ?? 0,
            ];
        }

        return response()->json($data);
    }

    /**
     * Get available years from generations and declarations
     */
    public function availableYears(Request $request)
    {
        $generationYears = Generation::selectRaw('DISTINCT YEAR(created_at) as year')
            ->orderBy('year', 'desc')
            ->pluck('year');

        $declarationYears = Declaration::selectRaw('DISTINCT YEAR(created_at) as year')
            ->orderBy('year', 'desc')
            ->pluck('year');

        $years = $generationYears->merge($declarationYears)->unique()->sort()->values();

        // If no years found, return current year
        if ($years->isEmpty()) {
            $years = collect([date('Y')]);
        }

        return response()->json([
            'years' => $years->toArray()
        ]);
    }
}
