<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historiques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('numero')->unique(); // EDI file number
            $table->date('date');
            $table->decimal('montant', 15, 2); // Total amount
            $table->integer('nombre_factures');
            $table->enum('statut', ['generee', 'soumise', 'validee', 'rejetee'])->default('generee');
            $table->json('details')->nullable(); // Store metadata like year, period, regime
            $table->timestamps();

            $table->index('user_id');
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historiques');
    }
};
