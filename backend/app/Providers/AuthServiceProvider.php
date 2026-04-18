<?php

namespace App\Providers;

// use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\Societe;
use App\Models\Declaration;
use App\Models\Module;
use App\Models\Historique;
use App\Policies\SocietePolicy;
use App\Policies\DeclarationPolicy;
use App\Policies\ModulePolicy;
use App\Policies\HistoriquePolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Societe::class => SocietePolicy::class,
        Declaration::class => DeclarationPolicy::class,
        Module::class => ModulePolicy::class,
        Historique::class => HistoriquePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}
