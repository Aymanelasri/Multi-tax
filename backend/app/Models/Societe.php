<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Societe extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nom',
        'if',
        'rc',
        'ice',
        'adresse',
        'ville',
        'tel',
        'email',
        'notes',
        'usage_count',
        'last_used',
    ];

    protected $casts = [
        'last_used' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function historiques()
    {
        return $this->hasMany(Historique::class);
    }
}
