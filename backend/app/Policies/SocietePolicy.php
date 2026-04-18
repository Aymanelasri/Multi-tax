<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Societe;

class SocietePolicy
{
    public function view(User $user, Societe $societe): bool
    {
        return $user->id === $societe->user_id;
    }

    public function update(User $user, Societe $societe): bool
    {
        return $user->id === $societe->user_id;
    }

    public function delete(User $user, Societe $societe): bool
    {
        return $user->id === $societe->user_id;
    }
}
