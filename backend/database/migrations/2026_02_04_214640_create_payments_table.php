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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null'); // Allows payments without order
            $table->string('external_id')->nullable()->index(); // ID from Gateway (e.g. Mercado Pago ID)
            $table->string('method'); // pix, credit_card, etc
            $table->string('status')->default('pending'); // pending, paid, failed, refunded
            $table->decimal('amount', 10, 2);
            $table->json('metadata')->nullable(); // Store raw gateway response
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
