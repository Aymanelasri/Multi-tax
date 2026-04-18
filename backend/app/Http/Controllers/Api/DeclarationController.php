<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Declaration;
use Illuminate\Http\Request;

class DeclarationController extends Controller
{
    // ✅ STRICT DATA ISOLATION: Always filter by auth()->id()
    public function index(Request $request)
    {
        $declarations = Declaration::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $declarations]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'if_fiscal' => 'required|string',
            'annee' => 'required|integer|min:2000|max:2100',
            'periode' => 'required|string',
            'regime' => 'required|string',
            'invoices' => 'nullable|array',
        ]);

        $declaration = Declaration::create([
            ...$validated,
            'user_id' => auth()->id(),
            'status' => 'draft',
        ]);

        return response()->json([
            'message' => 'Declaration created successfully',
            'data' => $declaration,
        ], 201);
    }

    public function show(Request $request, Declaration $declaration)
    {
        // ✅ Enforce ownership check
        if ($declaration->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['data' => $declaration]);
    }

    public function update(Request $request, Declaration $declaration)
    {
        // ✅ Enforce ownership check
        if ($declaration->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'if_fiscal' => 'string',
            'annee' => 'integer|min:2000|max:2100',
            'periode' => 'string',
            'regime' => 'string',
            'invoices' => 'nullable|array',
            'status' => 'in:draft,submitted,approved',
        ]);

        $declaration->update($validated);

        return response()->json([
            'message' => 'Declaration updated successfully',
            'data' => $declaration,
        ]);
    }

    public function destroy(Request $request, Declaration $declaration)
    {
        // ✅ Enforce ownership check
        if ($declaration->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $declaration->delete();

        return response()->json(['message' => 'Declaration deleted successfully']);
    }
}
