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
        // 1. Recipe Details -> Ingredient
        if (Schema::hasTable('recipe_details')) {
            Schema::table('recipe_details', function (Blueprint $table) {
                try { $table->dropForeign(['ingredient_id']); } catch (\Exception $e) {}
                $table->foreign('ingredient_id')->references('id')->on('ingredients')->onDelete('cascade');
                
                try { $table->dropForeign(['recipe_id']); } catch (\Exception $e) {}
                $table->foreign('recipe_id')->references('id')->on('recipes')->onDelete('cascade');
            });
        }

        // 2. Error Waste Logs -> Ingredient (Already has cascade but re-verifying)
        Schema::table('error_waste_logs', function (Blueprint $table) {
            try { $table->dropForeign(['ingredient_id']); } catch (\Exception $e) {}
            $table->foreign('ingredient_id')->references('id')->on('ingredients')->onDelete('cascade');
        });
        
        // 3. Orders -> Business / Staff (Already handled in previous migrations but re-asserting for completeness)
        Schema::table('orders', function (Blueprint $table) {
             try { $table->dropForeign(['business_id']); } catch (\Exception $e) {}
             $table->foreign('business_id')->references('id')->on('business_profiles')->onDelete('cascade');
             
             try { $table->dropForeign(['staff_id']); } catch (\Exception $e) {}
             $table->foreign('staff_id')->references('id')->on('staff_mris')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
