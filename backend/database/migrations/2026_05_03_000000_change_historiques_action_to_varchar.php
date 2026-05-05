<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change action column from ENUM to VARCHAR to support more action types
        DB::statement("ALTER TABLE historiques MODIFY COLUMN action VARCHAR(50) NOT NULL");
    }

    public function down(): void
    {
        // Revert back to ENUM (only if needed)
        DB::statement("ALTER TABLE historiques MODIFY COLUMN action ENUM('creation', 'update', 'generation', 'export') NOT NULL");
    }
};
