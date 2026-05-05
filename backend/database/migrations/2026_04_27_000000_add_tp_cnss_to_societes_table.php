<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('societes', function (Blueprint $table) {
            // Check if columns don't exist before adding them
            if (!Schema::hasColumn('societes', 'tp')) {
                $table->string('tp')->nullable()->after('ice');
            }
            if (!Schema::hasColumn('societes', 'cnss')) {
                $table->string('cnss')->nullable()->after('tp');
            }
            // Make tel and email nullable if they aren't already
            if (Schema::hasColumn('societes', 'tel')) {
                $table->string('tel')->nullable()->change();
            }
            if (Schema::hasColumn('societes', 'email')) {
                $table->string('email')->nullable()->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('societes', function (Blueprint $table) {
            if (Schema::hasColumn('societes', 'tp')) {
                $table->dropColumn('tp');
            }
            if (Schema::hasColumn('societes', 'cnss')) {
                $table->dropColumn('cnss');
            }
        });
    }
};
