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
        // 1. Orders -> Products
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->foreign('product_id')
                ->references('id')
                ->on('products')
                ->onDelete('cascade');
        });

        // 2. Error Waste Logs -> Products (Re-asserting cascade)
        Schema::table('error_waste_logs', function (Blueprint $table) {
            // Check if foreign key exists before dropping to avoid errors
            // But since we are in a migration, we usually just drop and recreate
            try {
                $table->dropForeign(['product_id']);
            } catch (\Exception $e) {
                // Ignore if not found
            }
            
            $table->foreign('product_id')
                ->references('id')
                ->on('products')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->foreign('product_id')->references('id')->on('products');
        });
    }
};
