# Backend Implementation - Data Isolation

## File: app/Http/Controllers/Api/SocieteController.php

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Societe;
use App\Models\Historique;
use Illuminate\Http\Request;

class SocieteController extends Controller
{
    /**
     * ✅ CRITICAL: List only current user's societes
     * Filter by auth()->id() to ensure data isolation
     */
    public function index(Request $request)
    {
        $societes = Societe::where('user_id', auth()->id())
            ->orderBy('last_used', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $societes]);
    }

    /**
     * ✅ CRITICAL: Create societe for current user only
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'if' => 'required|string|unique:societes,if,NULL,id,user_id,' . auth()->id(),
            'rc' => 'required|string|max:255',
            'ice' => 'required|string|max:255',
            'adresse' => 'required|string|max:255',
            'ville' => 'required|string|max:100',
            'tel' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'notes' => 'nullable|string',
        ]);

        $societe = Societe::create([
            ...$validated,
            'user_id' => auth()->id(), // ✅ CRITICAL: Set current user
        ]);

        $this->logHistorique('creation', "Création de la Société: {$societe->nom}", $societe);

        return response()->json([
            'message' => 'Societe created successfully',
            'data' => $societe,
        ], 201);
    }

    /**
     * ✅ CRITICAL: Show only if user owns it
     */
    public function show(Request $request, Societe $societe)
    {
        // ✅ CRITICAL: Verify ownership
        if ($societe->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['data' => $societe]);
    }

    /**
     * ✅ CRITICAL: Update only if user owns it
     */
    public function update(Request $request, Societe $societe)
    {
        // ✅ CRITICAL: Verify ownership
        if ($societe->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'nom' => 'string|max:255',
            'if' => 'string|unique:societes,if,' . $societe->id . ',id,user_id,' . auth()->id(),
            'rc' => 'string|max:255',
            'ice' => 'string|max:255',
            'adresse' => 'string|max:255',
            'ville' => 'string|max:100',
            'tel' => 'string|max:20',
            'email' => 'email|max:255',
            'notes' => 'nullable|string',
        ]);

        $oldData = $societe->toArray();
        $societe->update($validated);

        $this->logHistorique('update', "Mise à jour de la Société: {$societe->nom}", $societe, ['before' => $oldData, 'after' => $validated]);

        return response()->json([
            'message' => 'Societe updated successfully',
            'data' => $societe,
        ]);
    }

    /**
     * ✅ CRITICAL: Delete only if user owns it
     */
    public function destroy(Request $request, Societe $societe)
    {
        // ✅ CRITICAL: Verify ownership
        if ($societe->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $nom = $societe->nom;
        $societe->delete();

        $this->logHistorique('deletion', "Suppression de la Société: {$nom}", null);

        return response()->json(['message' => 'Societe deleted successfully']);
    }

    /**
     * Helper: Log action in Historiques
     */
    private function logHistorique($action, $description, $societe = null, $data = null)
    {
        Historique::create([
            'user_id' => auth()->id(),
            'societe_id' => $societe?->id,
            'action' => $action,
            'description' => $description,
            'data' => $data,
        ]);
    }
}
```

---

## File: app/Http/Controllers/Api/DeclarationController.php

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Declaration;
use Illuminate\Http\Request;

class DeclarationController extends Controller
{
    /**
     * ✅ CRITICAL: List only current user's declarations
     */
    public function index(Request $request)
    {
        $declarations = Declaration::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $declarations]);
    }

    /**
     * ✅ CRITICAL: Create declaration for current user only
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'if_fiscal' => 'required|string',
            'annee' => 'required|integer|min:2000|max:2100',
            'periode' => 'required|string',
            'regime' => 'required|string',
            'invoices' => 'nullable|array',
        ]);

        $declaration = Declaration::create([
            ...$validated,
            'user_id' => auth()->id(), // ✅ CRITICAL: Set current user
            'status' => 'draft',
        ]);

        return response()->json([
            'message' => 'Declaration created successfully',
            'data' => $declaration,
        ], 201);
    }

    /**
     * ✅ CRITICAL: Show only if user owns it
     */
    public function show(Request $request, Declaration $declaration)
    {
        // ✅ CRITICAL: Verify ownership
        if ($declaration->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['data' => $declaration]);
    }

    /**
     * ✅ CRITICAL: Update only if user owns it
     */
    public function update(Request $request, Declaration $declaration)
    {
        // ✅ CRITICAL: Verify ownership
        if ($declaration->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'if_fiscal' => 'string',
            'annee' => 'integer|min:2000|max:2100',
            'periode' => 'string',
            'regime' => 'string',
            'invoices' => 'nullable|array',
            'status' => 'in:draft,submitted,approved',
        ]);

        $declaration->update($validated);

        return response()->json([
            'message' => 'Declaration updated successfully',
            'data' => $declaration,
        ]);
    }

    /**
     * ✅ CRITICAL: Delete only if user owns it
     */
    public function destroy(Request $request, Declaration $declaration)
    {
        // ✅ CRITICAL: Verify ownership
        if ($declaration->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $declaration->delete();

        return response()->json(['message' => 'Declaration deleted successfully']);
    }
}
```

---

## File: app/Http/Controllers/Api/ModuleController.php

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    /**
     * ✅ CRITICAL: List only current user's modules
     */
    public function index(Request $request)
    {
        $modules = Module::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $modules]);
    }

    /**
     * ✅ CRITICAL: Create module for current user only
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'data' => 'nullable|array',
        ]);

        $module = Module::create([
            ...$validated,
            'user_id' => auth()->id(), // ✅ CRITICAL: Set current user
        ]);

        return response()->json([
            'message' => 'Module created successfully',
            'data' => $module,
        ], 201);
    }

    /**
     * ✅ CRITICAL: Show only if user owns it
     */
    public function show(Request $request, Module $module)
    {
        // ✅ CRITICAL: Verify ownership
        if ($module->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['data' => $module]);
    }

    /**
     * ✅ CRITICAL: Update only if user owns it
     */
    public function update(Request $request, Module $module)
    {
        // ✅ CRITICAL: Verify ownership
        if ($module->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'type' => 'string|max:100',
            'data' => 'nullable|array',
        ]);

        $module->update($validated);

        return response()->json([
            'message' => 'Module updated successfully',
            'data' => $module,
        ]);
    }

    /**
     * ✅ CRITICAL: Delete only if user owns it
     */
    public function destroy(Request $request, Module $module)
    {
        // ✅ CRITICAL: Verify ownership
        if ($module->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $module->delete();

        return response()->json(['message' => 'Module deleted successfully']);
    }
}
```

---

## File: app/Http/Controllers/Api/HistoriqueController.php

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Historique;
use App\Models\Societe;
use Illuminate\Http\Request;

class HistoriqueController extends Controller
{
    /**
     * ✅ CRITICAL: List only current user's historique
     */
    public function index(Request $request)
    {
        $historiques = Historique::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->with('societe')
            ->get();

        return response()->json(['data' => $historiques]);
    }

    /**
     * ✅ CRITICAL: Create historique for current user only
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'societe_id' => 'nullable|exists:societes,id',
            'action' => 'required|in:creation,update,generation,export,deletion',
            'description' => 'required|string',
            'data' => 'nullable|array',
        ]);

        // ✅ CRITICAL: If societe_id provided, verify ownership
        if ($validated['societe_id']) {
            $societe = Societe::find($validated['societe_id']);
            if ($societe->user_id !== auth()->id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $historique = Historique::create([
            ...$validated,
            'user_id' => auth()->id(), // ✅ CRITICAL: Set current user
        ]);

        return response()->json([
            'message' => 'Historique created successfully',
            'data' => $historique,
        ], 201);
    }

    /**
     * ✅ CRITICAL: Show only if user owns it
     */
    public function show(Request $request, Historique $historique)
    {
        // ✅ CRITICAL: Verify ownership
        if ($historique->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['data' => $historique->load('societe')]);
    }

    /**
     * ✅ CRITICAL: Update only if user owns it
     */
    public function update(Request $request, Historique $historique)
    {
        // ✅ CRITICAL: Verify ownership
        if ($historique->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'action' => 'in:creation,update,generation,export,deletion',
            'description' => 'string',
            'data' => 'nullable|array',
        ]);

        $historique->update($validated);

        return response()->json([
            'message' => 'Historique updated successfully',
            'data' => $historique,
        ]);
    }

    /**
     * ✅ CRITICAL: Delete only if user owns it
     */
    public function destroy(Request $request, Historique $historique)
    {
        // ✅ CRITICAL: Verify ownership
        if ($historique->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $historique->delete();

        return response()->json(['message' => 'Historique deleted successfully']);
    }
}
```

---

## File: app/Models/Societe.php (Updated with Scope)

```php
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

    /**
     * ✅ Scope: Filter by current user
     * Usage: Societe::forCurrentUser()->get()
     */
    public function scopeForCurrentUser($query)
    {
        return $query->where('user_id', auth()->id());
    }
}
```

---

## File: app/Models/Declaration.php (Updated with Scope)

```php
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

    /**
     * ✅ Scope: Filter by current user
     */
    public function scopeForCurrentUser($query)
    {
        return $query->where('user_id', auth()->id());
    }
}
```

---

## File: app/Models/Module.php (Updated with Scope)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * ✅ Scope: Filter by current user
     */
    public function scopeForCurrentUser($query)
    {
        return $query->where('user_id', auth()->id());
    }
}
```

---

## File: app/Models/Historique.php (Updated with Scope)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Historique extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'societe_id',
        'action',
        'description',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function societe()
    {
        return $this->belongsTo(Societe::class);
    }

    /**
     * ✅ Scope: Filter by current user
     */
    public function scopeForCurrentUser($query)
    {
        return $query->where('user_id', auth()->id());
    }
}
```

---

## Summary of Changes

### Controllers Updated
- ✅ SocieteController: All methods filter by `auth()->id()`
- ✅ DeclarationController: All methods filter by `auth()->id()`
- ✅ ModuleController: All methods filter by `auth()->id()`
- ✅ HistoriqueController: All methods filter by `auth()->id()`

### Models Updated
- ✅ Societe: Added `forCurrentUser()` scope
- ✅ Declaration: Added `forCurrentUser()` scope
- ✅ Module: Added `forCurrentUser()` scope
- ✅ Historique: Added `forCurrentUser()` scope

### Security Features
- ✅ All `index()` methods filter by `auth()->id()`
- ✅ All `show()` methods verify ownership (403 if not owner)
- ✅ All `update()` methods verify ownership (403 if not owner)
- ✅ All `destroy()` methods verify ownership (403 if not owner)
- ✅ All `store()` methods set `user_id` to `auth()->id()`

### Data Isolation Guarantees
- ✅ User A cannot see User B's societes
- ✅ User A cannot see User B's declarations
- ✅ User A cannot see User B's modules
- ✅ User A cannot see User B's historique
- ✅ User A cannot update User B's data
- ✅ User A cannot delete User B's data
- ✅ API returns 403 Unauthorized for cross-user access

---

**Status:** Ready for Deployment ✅  
**Security Level:** Enterprise Grade 🔒
