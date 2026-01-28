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
        Schema::table('company_settings', function (Blueprint $table) {
            // Stock & Operations
            $table->boolean('enable_stock_control')->default(true)->after('auth_token_expiration');
            $table->integer('global_min_stock')->default(5)->after('enable_stock_control');
            
            // Visual
            $table->string('logo_url')->nullable()->after('global_min_stock');
            $table->string('login_bg_url')->nullable()->after('logo_url');
            $table->string('welcome_message')->nullable()->after('login_bg_url');
            
            // Integrations
            $table->string('currency_symbol')->default('R$')->after('welcome_message');
            $table->string('whatsapp_number')->nullable()->after('currency_symbol');
            $table->text('delivery_message')->nullable()->after('whatsapp_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_settings', function (Blueprint $table) {
            $table->dropColumn([
                'enable_stock_control',
                'global_min_stock',
                'logo_url',
                'login_bg_url',
                'welcome_message',
                'currency_symbol',
                'whatsapp_number',
                'delivery_message'
            ]);
        });
    }
};
