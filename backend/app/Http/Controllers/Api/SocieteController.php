<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Societe;
use App\Models\Historique;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SocieteController extends Controller
{
    // ✅ STRICT DATA ISOLATION: Always filter by auth()->id()
    public function index(Request $request)
    {
        $authId = auth()->id();
        $user = auth()->user();

        Log::info('SocieteController@index - Authentication Debug', [
            'auth_id' => $authId,
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'token_user' => $request->user()?->id,
        ]);

        $societes = Societe::where('user_id', $authId)
            ->orderBy('last_used', 'desc')
            ->get();

        Log::info('Societes Query Result', [
            'user_id' => $authId,
            'count' => $societes->count(),
            'societes' => $societes->pluck('id', 'user_id'),
        ]);

        return response()->json(['data' => $societes]);
    }

    // ✅ NEW: Explicit endpoint for modal - guaranteed to return only current user's societes
    public function myCompanies(Request $request)
    {
        $authId = auth()->id();

        Log::info('SocieteController@myCompanies - Fetching user societes', [
            'auth_id' => $authId,
        ]);

        $societes = Societe::where('user_id', $authId)
            ->select('id', 'user_id', 'nom', 'if', 'ice', 'rc', 'adresse', 'ville')
            ->orderBy('nom', 'asc')
            ->get();

        Log::info('myCompanies Result', [
            'auth_id' => $authId,
            'count' => $societes->count(),
        ]);

        return response()->json([
            'data' => $societes,
            'user_id' => $authId,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nom' => 'required|string|max:255',
                'if' => 'required|string|max:255',
                'rc' => 'required|string|max:255',
                'ice' => 'required|string|min:15|max:15|regex:/^[0-9]+$/',
                'tp' => 'required|string|max:255',
                'cnss' => 'required|string|max:255',
                'adresse' => 'required|string|max:255',
                'ville' => 'required|string|max:100',
                'tel' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'notes' => 'nullable|string',
            ]);

            $userId = auth()->id();

            // Uniqueness validation for ICE, IF, CNSS
            $fields = [
                'ice' => 'ICE déjà utilisé',
                'if' => 'Identifiant Fiscal déjà utilisé',
                'cnss' => 'Numéro CNSS déjà utilisé',
            ];

            foreach ($fields as $field => $message) {
                if (!empty($request->$field)) {
                    $exists = Societe::where('user_id', $userId)
                        ->where($field, $request->$field)
                        ->exists();
                    if ($exists) {
                        return response()->json([
                            'errors' => [$field => [$message]]
                        ], 422);
                    }
                }
            }

            // RC uniqueness per city
            if (!empty($request->rc) && !empty($request->ville)) {
                $exists = Societe::where('user_id', $userId)
                    ->where('rc', $request->rc)
                    ->where('ville', $request->ville)
                    ->exists();
                if ($exists) {
                    return response()->json([
                        'errors' => ['rc' => ['RC déjà utilisé dans cette ville']]
                    ], 422);
                }
            }

            $societe = Societe::create([
                ...$validated,
                'user_id' => $userId,
            ]);

            // Log action in Historiques
            $this->logHistorique('creation', "Création de la Société: {$societe->nom}", $societe);

            return response()->json([
                'message' => 'Societe created successfully',
                'data' => $societe,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating societe', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return response()->json([
                'message' => 'Error creating societe: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, Societe $societe)
    {
        // ✅ Enforce ownership check
        if ($societe->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['data' => $societe]);
    }

    public function update(Request $request, Societe $societe)
    {
        // ✅ Enforce ownership check
        if ($societe->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $validated = $request->validate([
                'nom' => 'string|max:255',
                'if' => 'string|max:255',
                'rc' => 'string|max:255',
                'ice' => 'string|min:15|max:15|regex:/^[0-9]+$/',
                'tp' => 'required|string|max:255',
                'cnss' => 'required|string|max:255',
                'adresse' => 'string|max:255',
                'ville' => 'string|max:100',
                'tel' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'notes' => 'nullable|string',
            ]);

            $userId = auth()->id();
            $id = $societe->id;

            // Uniqueness validation for ICE, IF, CNSS (excluding current record)
            $fields = [
                'ice' => 'ICE déjà utilisé',
                'if' => 'Identifiant Fiscal déjà utilisé',
                'cnss' => 'Numéro CNSS déjà utilisé',
            ];

            foreach ($fields as $field => $message) {
                if (!empty($request->$field)) {
                    $exists = Societe::where('user_id', $userId)
                        ->where($field, $request->$field)
                        ->where('id', '!=', $id)
                        ->exists();
                    if ($exists) {
                        return response()->json([
                            'errors' => [$field => [$message]]
                        ], 422);
                    }
                }
            }

            // RC uniqueness per city (excluding current record)
            if (!empty($request->rc) && !empty($request->ville)) {
                $exists = Societe::where('user_id', $userId)
                    ->where('rc', $request->rc)
                    ->where('ville', $request->ville)
                    ->where('id', '!=', $id)
                    ->exists();
                if ($exists) {
                    return response()->json([
                        'errors' => ['rc' => ['RC déjà utilisé dans cette ville']]
                    ], 422);
                }
            }

            $oldData = $societe->toArray();
            $societe->update($validated);

            // Log action in Historiques
            $this->logHistorique('update', "Mise à jour de la Société: {$societe->nom}", $societe, ['before' => $oldData, 'after' => $validated]);

            return response()->json([
                'message' => 'Societe updated successfully',
                'data' => $societe,
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating societe', [
                'error' => $e->getMessage(),
                'societe_id' => $societe->id
            ]);
            return response()->json([
                'message' => 'Error updating societe: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request, Societe $societe)
    {
        // ✅ Enforce ownership check
        if ($societe->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $nom = $societe->nom;
        $societe->delete();

        // Log action in Historiques
        $this->logHistorique('update', "Suppression de la Société: {$nom}", null);

        return response()->json(['message' => 'Societe deleted successfully']);
    }

    /**
     * Increment usage count for a societe
     * Called when a user uses a company in the generator
     */
    public function incrementUsage(Request $request, Societe $societe)
    {
        // ✅ Enforce ownership check
        if ($societe->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Increment usage count and update last_used timestamp
        $societe->increment('usage_count');
        $societe->update(['last_used' => now()]);

        // Log action in Historiques
        $this->logHistorique('usage', "Utilisation de la Société: {$societe->nom} dans une déclaration", $societe);

        return response()->json([
            'message' => 'Usage count incremented successfully',
            'data' => $societe->fresh(),
        ]);
    }

    // ✅ Helper method to log actions in Historiques
    private function logHistorique($action, $description, $societe = null, $data = null)
    {
        Historique::create([
            'user_id' => auth()->id(),
            'societe_id' => $societe?->id,
            'action' => $action,
            'description' => $description,
            'data' => $data,
        ]);
    }
}
