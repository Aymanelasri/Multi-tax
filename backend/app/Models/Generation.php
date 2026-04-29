<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Generation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'reference',
        'date',
        'factures',
        'montant_ttc',
        'statut',
        'file_type',
        'file_name',
        'file_path',
        'file_size',
    ];

    protected $casts = [
        'date' => 'datetime',
        'montant_ttc' => 'decimal:2',
    ];

    /**
     * Relationship: Generation belongs to User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Auto-generate unique reference in format: GEN-YYYY-NNNN
     * Example: GEN-2025-0001, GEN-2025-0002
     */
    public static function generateReference()
    {
        $year = date('Y');
        $prefix = "GEN-{$year}-";

        // Get the last generation for this year
        $lastGeneration = self::where('reference', 'like', $prefix . '%')
            ->orderBy('id', 'desc')
            ->first();

        if ($lastGeneration) {
            // Extract the number part and increment
            $lastNumber = (int) substr($lastGeneration->reference, -4);
            $newNumber = $lastNumber + 1;
        } else {
            // First generation of the year
            $newNumber = 1;
        }

        // Pad with zeros to 4 digits
        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }
}
