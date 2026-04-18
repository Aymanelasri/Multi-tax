<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Declaration extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'if_fiscal',
        'annee',
        'periode',
        'regime',
        'invoices',
        'status',
    ];

    protected $casts = [
        'invoices' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
