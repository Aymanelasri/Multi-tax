<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Societe;
use App\Models\Historique;
use Illuminate\Http\Request;

class SocieteController extends Controller
{
    // ✅ STRICT DATA ISOLATION: Always filter by auth()->id()
    public function index(Request $request)
    {
        $societes = Societe::where('user_id', auth()->id())
            ->orderBy('last_used', 'desc')
            ->get();

        return response()->json(['data' => $societes]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'if' => 'required|string|unique:societes,if,NULL,id,user_id,' . auth()->id(),
            'rc' => 'required|string|max:255',
            'ice' => 'required|string|max:255',
            'adresse' => 'required|string|max:255',
            'ville' => 'required|string|max:100',
            'tel' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'notes' => 'nullable|string',
        ]);

        $societe = Societe::create([
            ...$validated,
            'user_id' => auth()->id(),
        ]);

        // Log action in Historiques
        $this->logHistorique('creation', "Création de la Société: {$societe->nom}", $societe);

        return response()->json([
            'message' => 'Societe created successfully',
            'data' => $societe,
        ], 201);
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

        $validated = $request->validate([
            'nom' => 'string|max:255',
            'if' => 'string|unique:societes,if,' . $societe->id . ',id,user_id,' . auth()->id(),
            'rc' => 'string|max:255',
            'ice' => 'string|max:255',
            'adresse' => 'string|max:255',
            'ville' => 'string|max:100',
            'tel' => 'string|max:20',
            'email' => 'email|max:255',
            'notes' => 'nullable|string',
        ]);

        $oldData = $societe->toArray();
        $societe->update($validated);

        // Log action in Historiques
        $this->logHistorique('update', "Mise à jour de la Société: {$societe->nom}", $societe, ['before' => $oldData, 'after' => $validated]);

        return response()->json([
            'message' => 'Societe updated successfully',
            'data' => $societe,
        ]);
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
