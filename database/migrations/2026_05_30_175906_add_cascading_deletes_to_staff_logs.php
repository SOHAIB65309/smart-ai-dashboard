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
        // 1. Daily Performance Logs
        Schema::table('daily_performance_logs', function (Blueprint $table) {
            $table->dropForeign(['staff_id']);
            $table->foreign('staff_id')
                ->references('id')
                ->on('staff_mris')
                ->onDelete('cascade');
        });

        // 2. Error Waste Logs
        Schema::table('error_waste_logs', function (Blueprint $table) {
            $table->dropForeign(['staff_id']);
            $table->foreign('staff_id')
                ->references('id')
                ->on('staff_mris')
                ->onDelete('cascade');
        });

        // 3. Orders
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['staff_id']);
            $table->foreign('staff_id')
                ->references('id')
                ->on('staff_mris')
                ->onDelete('cascade');
        });
        
        // 4. Staff MRI -> Business Profile
        Schema::table('staff_mris', function (Blueprint $table) {
            $table->dropForeign(['business_id']);
            $table->foreign('business_id')
                ->references('id')
                ->on('business_profiles')
                ->onDelete('cascade');
        });
        
        // 5. Ingredients -> Business Profile
        Schema::table('ingredients', function (Blueprint $table) {
            $table->dropForeign(['business_id']);
            $table->foreign('business_id')
                ->references('id')
                ->on('business_profiles')
                ->onDelete('cascade');
        });
        
        // 6. Products -> Business Profile
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['business_id']);
            $table->foreign('business_id')
                ->references('id')
                ->on('business_profiles')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to non-cascading
        Schema::table('daily_performance_logs', function (Blueprint $table) {
            $table->dropForeign(['staff_id']);
            $table->foreign('staff_id')->references('id')->on('staff_mris');
        });
    }
};
