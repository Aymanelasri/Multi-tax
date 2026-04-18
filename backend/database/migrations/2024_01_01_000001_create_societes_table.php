<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('societes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('nom');
            $table->string('if');
            $table->string('rc');
            $table->string('ice');
            $table->string('adresse');
            $table->string('ville');
            $table->string('tel');
            $table->string('email');
            $table->text('notes')->nullable();
            $table->integer('usage_count')->default(0);
            $table->timestamp('last_used')->nullable();
            $table->timestamps();

            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('societes');
    }
};
