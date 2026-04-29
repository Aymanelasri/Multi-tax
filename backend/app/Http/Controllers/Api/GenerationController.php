<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Generation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GenerationController extends Controller
{
    /**
     * Get the last 50 generations for the authenticated user
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $userId = auth()->id();

            // Get last 50 generations for this user, ordered by most recent
            $generations = Generation::where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get()
                ->map(function ($generation) {
                    return [
                        'id' => $generation->id,
                        'reference' => $generation->reference,
                        'date' => $generation->date->format('Y-m-d H:i'),
                        'factures' => $generation->factures,
                        'montant_ttc' => (float) $generation->montant_ttc,
                        'statut' => $generation->statut,
                        'file_type' => $generation->file_type,
                        'file_name' => $generation->file_name,
                        'file_size' => $generation->file_size,
                        'created_at' => $generation->created_at->format('Y-m-d H:i:s'),
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data' => $generations
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch generations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new generation record
     * This is called automatically when a file is downloaded
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'factures' => 'required|integer|min:0',
                'montant_ttc' => 'required|numeric|min:0',
                'file_type' => 'required|string|in:XML,ZIP,CSV',
                'file_name' => 'required|string',
                'file_content' => 'required|string', // Base64 encoded file content
            ]);

            // Decode and save file
            $fileContent = base64_decode($validated['file_content']);
            $fileName = $validated['file_name'];
            $filePath = 'generations/' . auth()->id() . '/' . $fileName;
            
            // Store file
            Storage::disk('local')->put($filePath, $fileContent);
            $fileSize = strlen($fileContent);

            $generation = Generation::create([
                'user_id' => auth()->id() ?? null,
                'reference' => Generation::generateReference(),
                'date' => now(),
                'factures' => $validated['factures'],
                'montant_ttc' => $validated['montant_ttc'],
                'statut' => 'success',
                'file_type' => $validated['file_type'],
                'file_name' => $validated['file_name'],
                'file_path' => $filePath,
                'file_size' => $fileSize,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Generation saved successfully',
                'data' => [
                    'reference' => $generation->reference,
                    'id' => $generation->id,
                ]
            ], 201);
        } catch (\Exception $e) {
            // Don't block the download if saving fails
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to save generation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download a generation file
     * Security: Only the owner can download their files
     * 
     * @param int $id
     * @return \Illuminate\Http\Response
     */
    public function download($id)
    {
        try {
            $generation = Generation::findOrFail($id);

            // Security check: Ensure the file belongs to the authenticated user
            if ($generation->user_id !== auth()->id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Forbidden: You do not have permission to download this file'
                ], 403);
            }

            // Check if file exists
            if (!$generation->file_path || !Storage::disk('local')->exists($generation->file_path)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'File not found on server'
                ], 404);
            }

            // Get file content
            $fileContent = Storage::disk('local')->get($generation->file_path);

            // Determine MIME type
            $mimeType = match($generation->file_type) {
                'XML' => 'application/xml',
                'ZIP' => 'application/zip',
                'CSV' => 'text/csv',
                default => 'application/octet-stream',
            };

            // Return file as download
            return response($fileContent, 200)
                ->header('Content-Type', $mimeType)
                ->header('Content-Disposition', 'attachment; filename="' . $generation->file_name . '"')
                ->header('Content-Length', strlen($fileContent));

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Generation not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to download file',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
