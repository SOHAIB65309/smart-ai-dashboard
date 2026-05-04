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
       Schema::create('products', function (Blueprint $table) {
        $table->id();
        $table->foreignId('business_id')->constrained('business_profiles');
        $table->string('name');
        $table->string('category'); // e.g., Apparel, Main Course
        $table->json('attributes'); // e.g., {"size": "XL", "material": "Wool"}
        $table->decimal('customer_rating', 3, 2)->default(5.00);
        $table->timestamps();
    });

    // 5. Orders Table (Connecting Staff and Products)
    Schema::create('orders', function (Blueprint $table) {
        $table->id();
        $table->foreignId('business_id')->constrained('business_profiles');
        $table->foreignId('product_id')->constrained();
        $table->foreignId('staff_id')->constrained('staff_mris');
        $table->enum('status', ['Completed', 'Returned', 'Cancelled']);
        $table->decimal('total_price', 10, 2);
        $table->text('customer_feedback')->nullable(); // Reasoning for fluctuations
        $table->timestamps();
    });

    // 6. Error Waste Logs Table
    Schema::table('error_waste_logs', function (Blueprint $table) {
    // Making it nullable so Restaurant logs (which use ingredient_id) don't break
    $table->foreignId('product_id')->nullable()->constrained()->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('error_waste_logs');
    }
};
