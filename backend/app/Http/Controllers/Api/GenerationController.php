<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Generation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GenerationController extends Controller
{
    /**
     * Get recent generations for current user
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function recent(Request $request)
    {
        try {
            $userId = auth()->id();
            $limit = $request->input('limit', 5);
            $fileType = $request->input('file_type');

            $query = Generation::where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->limit($limit);

            if ($fileType) {
                $query->where('file_type', strtoupper($fileType));
            }

            $generations = $query->get()->map(function ($gen) {
                return [
                    'id' => $gen->id,
                    'reference' => $gen->reference,
                    'factures' => $gen->factures,
                    'montant_ttc' => number_format($gen->montant_ttc, 2, '.', ''),
                    'statut' => $gen->statut,
                    'file_type' => $gen->file_type,
                    'file_name' => $gen->file_name,
                    'file_path' => $gen->file_path,
                    'created_at' => $gen->created_at->toIso8601String(),
                    'formatted_date' => $gen->created_at->format('d/m/Y H:i'),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $generations,
                'count' => $generations->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recent generations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

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
                'file_type' => 'required|string|in:XML,ZIP,CSV,XLSX',
                'file_name' => 'nullable|string',
                'file_content' => 'nullable|string', // Base64 encoded file content
                'file' => 'nullable|file|max:10240', // File upload (max 10MB)
                'reference' => 'nullable|string',
            ]);

            $fileContent = null;
            $fileName = $validated['file_name'] ?? 'file_' . time();
            
            // Handle file upload (FormData)
            if ($request->hasFile('file')) {
                $uploadedFile = $request->file('file');
                $fileContent = file_get_contents($uploadedFile->getRealPath());
                $fileName = $uploadedFile->getClientOriginalName();
            }
            // Handle base64 content (legacy)
            elseif (!empty($validated['file_content'])) {
                $fileContent = base64_decode($validated['file_content']);
            }
            else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Either file or file_content is required'
                ], 422);
            }

            $filePath = 'generations/' . auth()->id() . '/' . $fileName;
            
            // Store file
            Storage::disk('local')->put($filePath, $fileContent);
            $fileSize = strlen($fileContent);

            $generation = Generation::create([
                'user_id' => auth()->id() ?? null,
                'reference' => $validated['reference'] ?? Generation::generateReference(),
                'date' => now(),
                'factures' => $validated['factures'],
                'montant_ttc' => $validated['montant_ttc'],
                'statut' => 'success',
                'file_type' => $validated['file_type'],
                'file_name' => $fileName,
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
                'XLSX' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
