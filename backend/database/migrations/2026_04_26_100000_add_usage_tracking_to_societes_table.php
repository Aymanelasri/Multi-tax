<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('societes', function (Blueprint $table) {
            // Check if columns don't exist before adding them
            if (!Schema::hasColumn('societes', 'usage_count')) {
                $table->integer('usage_count')->default(0)->after('notes');
            }
            
            if (!Schema::hasColumn('societes', 'last_used')) {
                $table->timestamp('last_used')->nullable()->after('usage_count');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('societes', function (Blueprint $table) {
            if (Schema::hasColumn('societes', 'usage_count')) {
                $table->dropColumn('usage_count');
            }
            
            if (Schema::hasColumn('societes', 'last_used')) {
                $table->dropColumn('last_used');
            }
        });
    }
};
