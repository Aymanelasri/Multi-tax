<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Historique;
use App\Models\Societe;
use Illuminate\Http\Request;

class HistoriqueController extends Controller
{
    // ✅ STRICT DATA ISOLATION: Always filter by auth()->id()
    public function index(Request $request)
    {
        $historiques = Historique::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->with('societe')
            ->get();

        return response()->json(['data' => $historiques]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'societe_id' => 'nullable|exists:societes,id',
            'action' => 'required|in:creation,update,generation,export',
            'description' => 'required|string',
            'data' => 'nullable|array',
        ]);

        // ✅ If societe_id provided, verify ownership
        if ($validated['societe_id']) {
            $societe = Societe::find($validated['societe_id']);
            if ($societe->user_id !== auth()->id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $historique = Historique::create([
            ...$validated,
            'user_id' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Historique created successfully',
            'data' => $historique,
        ], 201);
    }

    public function show(Request $request, Historique $historique)
    {
        // ✅ Enforce ownership check
        if ($historique->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['data' => $historique->load('societe')]);
    }

    public function update(Request $request, Historique $historique)
    {
        // ✅ Enforce ownership check
        if ($historique->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'action' => 'in:creation,update,generation,export',
            'description' => 'string',
            'data' => 'nullable|array',
        ]);

        $historique->update($validated);

        return response()->json([
            'message' => 'Historique updated successfully',
            'data' => $historique,
        ]);
    }

    public function destroy(Request $request, Historique $historique)
    {
        // ✅ Enforce ownership check
        if ($historique->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $historique->delete();

        return response()->json(['message' => 'Historique deleted successfully']);
    }
}
