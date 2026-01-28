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
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('delivery_type', ['pickup', 'delivery'])->default('pickup')->after('payment_method');
            $table->text('delivery_address')->nullable()->after('delivery_type'); // Stores JSON snapshot
            $table->string('customer_phone')->nullable()->after('customer_name');
            $table->string('courier_name')->nullable()->after('delivery_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['delivery_type', 'delivery_address', 'customer_phone', 'courier_name']);
        });
    }
};
