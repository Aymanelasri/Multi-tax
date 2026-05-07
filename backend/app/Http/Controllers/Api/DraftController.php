<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Draft;
use Illuminate\Http\Request;

class DraftController extends Controller
{
    /**
     * Save or update draft for current user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function save(Request $request)
    {
        try {
            $validated = $request->validate([
                'step' => 'required|integer|min:1|max:3',
                'data' => 'required|array',
            ]);

            $userId = auth()->id();

            // Create or update draft (one per user)
            $draft = Draft::updateOrCreate(
                ['user_id' => $userId],
                [
                    'step' => $validated['step'],
                    'data' => $validated['data'],
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Draft saved successfully',
                'data' => [
                    'draftId' => $draft->id,
                    'updatedAt' => $draft->updated_at->toIso8601String(),
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save draft',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Load draft for current user
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function load()
    {
        try {
            $userId = auth()->id();

            $draft = Draft::where('user_id', $userId)->first();

            if (!$draft) {
                return response()->json([
                    'success' => true,
                    'data' => null
                ], 200);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $draft->id,
                    'step' => $draft->step,
                    'data' => $draft->data,
                    'updatedAt' => $draft->updated_at->toIso8601String(),
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load draft',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete draft for current user
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function clear()
    {
        try {
            $userId = auth()->id();

            $deleted = Draft::where('user_id', $userId)->delete();

            return response()->json([
                'success' => true,
                'message' => $deleted ? 'Draft deleted successfully' : 'No draft found',
                'deleted' => $deleted > 0
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete draft',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
