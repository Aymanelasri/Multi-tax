<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Module;

class ModulePolicy
{
    public function view(User $user, Module $module): bool
    {
        return $user->id === $module->user_id;
    }

    public function update(User $user, Module $module): bool
    {
        return $user->id === $module->user_id;
    }

    public function delete(User $user, Module $module): bool
    {
        return $user->id === $module->user_id;
    }
}
