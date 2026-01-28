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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // Registered user or guest
            $table->string('customer_name')->nullable(); // For guests or quick identification
            $table->enum('status', ['pending', 'preparing', 'ready', 'delivered', 'canceled'])->default('pending');
            $table->decimal('total_amount', 10, 2);
            $table->string('payment_method')->default('cash');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
