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
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            
            // General
            $table->string('system_name')->default('SweetStore');
            $table->text('description')->nullable();
            $table->string('brand_color')->default('#eeb7ce'); // Pink
            $table->string('logo_path')->nullable();
            
            // Legal
            $table->string('cnpj')->nullable();
            $table->string('state_registration')->nullable(); // IE
            $table->string('municipal_registration')->nullable(); // IM
            $table->string('fiscal_regime')->nullable();

            // Address
            $table->string('street')->nullable();
            $table->string('number')->nullable();
            $table->string('neighborhood')->nullable();
            $table->string('city')->nullable();
            $table->string('state', 2)->nullable();
            $table->string('zip_code')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};
