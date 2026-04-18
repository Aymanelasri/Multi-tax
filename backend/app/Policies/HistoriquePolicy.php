<?php

namespace App\Policies;

use App\Models\Historique;
use App\Models\User;

class HistoriquePolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Historique $historique): bool
    {
        return $user->id === $historique->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Historique $historique): bool
    {
        return $user->id === $historique->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Historique $historique): bool
    {
        return $user->id === $historique->user_id;
    }
}
