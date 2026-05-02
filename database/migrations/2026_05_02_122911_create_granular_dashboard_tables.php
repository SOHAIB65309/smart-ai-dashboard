<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create the Business Profiles First (The Owner)
        Schema::create('business_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('business_name');
            $table->enum('industry_type', ['Restaurant', 'E-commerce', 'Staffing']);
            $table->timestamps();
        });

        // 2. Create Staff MRI (linked to Business)
        Schema::create('staff_mris', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('business_profiles'); // Multi-tenant link
            $table->string('name');
            $table->string('role');
            $table->decimal('base_quality_rating', 3, 2);
            $table->timestamps();
        });

        // 3. Create Ingredients (linked to Business)
        Schema::create('ingredients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained('business_profiles'); // Multi-tenant link[cite: 3]
            $table->string('name');
            $table->decimal('unit_cost', 10, 2);
            $table->string('unit_type');
            $table->integer('min_stock_threshold'); // Invariant: stock >= min_stock[cite: 3]
            $table->timestamps();
        });

        // 4. Create Supporting Tables
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->string('product_name');
            $table->json('attributes');
            $table->decimal('sale_price', 10, 2);
            $table->timestamps();
        });

        Schema::create('recipe_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipe_id')->constrained();
            $table->foreignId('ingredient_id')->constrained();
            $table->decimal('required_qty', 10, 2);
        });

        Schema::create('daily_performance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('staff_mris');
            $table->integer('tasks_started');
            $table->integer('tasks_failed');
            $table->decimal('overtime_hours', 5, 2); // Reasoning for quality drops[cite: 3]
            $table->timestamps();
        });

        Schema::create('error_waste_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ingredient_id')->nullable()->constrained();
            $table->foreignId('staff_id')->constrained('staff_mris');
            $table->enum('error_type', ['Expired', 'Overcooked', 'Size Mismatch', 'Defective']);
            $table->decimal('waste_qty', 10, 2)->default(0);
            $table->decimal('financial_loss', 10, 2);
            $table->text('system_reasoning'); // Logic Gate Input[cite: 3]
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('error_waste_logs');
        Schema::dropIfExists('daily_performance_logs');
        Schema::dropIfExists('recipe_details');
        Schema::dropIfExists('recipes');
        Schema::dropIfExists('ingredients');
        Schema::dropIfExists('staff_mris');
        Schema::dropIfExists('business_profiles');
    }
};
