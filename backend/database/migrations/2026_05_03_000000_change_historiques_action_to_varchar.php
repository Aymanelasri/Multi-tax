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
        Schema::table('historiques', function (Blueprint $table) {
            $table->string('action', 50)->change();
        });
    }

    public function down(): void
    {
        // Revert back to ENUM (only if needed)
        Schema::table('historiques', function (Blueprint $table) {
            $table->string('action', 50)->change();
        });
    }
};
