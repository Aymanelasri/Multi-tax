<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    // ✅ STRICT DATA ISOLATION: Always filter by auth()->id()
    public function index(Request $request)
    {
        $modules = Module::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $modules]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'data' => 'nullable|array',
        ]);

        $module = Module::create([
            ...$validated,
            'user_id' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Module created successfully',
            'data' => $module,
        ], 201);
    }

    public function show(Request $request, Module $module)
    {
        // ✅ Enforce ownership check
        if ($module->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['data' => $module]);
    }

    public function update(Request $request, Module $module)
    {
        // ✅ Enforce ownership check
        if ($module->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'type' => 'string|max:100',
            'data' => 'nullable|array',
        ]);

        $module->update($validated);

        return response()->json([
            'message' => 'Module updated successfully',
            'data' => $module,
        ]);
    }

    public function destroy(Request $request, Module $module)
    {
        // ✅ Enforce ownership check
        if ($module->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $module->delete();

        return response()->json(['message' => 'Module deleted successfully']);
    }
}
