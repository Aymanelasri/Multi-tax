<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add missing columns to declarations table to match generations data
     */
    public function up(): void
    {
        Schema::table('declarations', function (Blueprint $table) {
            // Add reference column if not exists
            if (!Schema::hasColumn('declarations', 'reference')) {
                $table->string('reference')->nullable()->after('user_id');
            }
            
            // Add nb_factures column if not exists
            if (!Schema::hasColumn('declarations', 'nb_factures')) {
                $table->integer('nb_factures')->default(0)->after('regime');
            }
            
            // Add total_ttc column if not exists
            if (!Schema::hasColumn('declarations', 'total_ttc')) {
                $table->decimal('total_ttc', 10, 2)->default(0)->after('nb_factures');
            }
            
            // Make if_fiscal nullable (might not have it from generations)
            if (Schema::hasColumn('declarations', 'if_fiscal')) {
                $table->string('if_fiscal')->nullable()->change();
            }
            
            // Update status enum to include 'generated'
            if (Schema::hasColumn('declarations', 'status')) {
                $table->string('status')->default('generated')->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('declarations', function (Blueprint $table) {
            if (Schema::hasColumn('declarations', 'reference')) {
                $table->dropColumn('reference');
            }
            if (Schema::hasColumn('declarations', 'nb_factures')) {
                $table->dropColumn('nb_factures');
            }
            if (Schema::hasColumn('declarations', 'total_ttc')) {
                $table->dropColumn('total_ttc');
            }
        });
    }
};
