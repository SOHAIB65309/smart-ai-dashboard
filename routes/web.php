<?php

use App\Http\Controllers\BusinessController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BusinessDataController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/business/create', [BusinessController::class, 'create'])->name('business.create');
    
    // POST: Store the new business in the database
    Route::post('/business', [BusinessController::class, 'store'])->name('business.store');

    // --- Specific Business Dashboard & Data MRI ---
    Route::prefix('business/{business}')->group(function () {
         Route::post('/verify', [BusinessController::class, 'verify'])->name('business.verify');
        // GET: View the specific dashboard (Restaurant or E-commerce)
        Route::get('/dashboard', [BusinessController::class, 'show'])->name('business.dashboard');

        // GET: Show form to edit existing business/domain data
        Route::get('/edit', [BusinessController::class, 'edit'])->name('business.edit');
        
        // --- Data Management Routes ---
        Route::get('/manage', [BusinessDataController::class, 'edit'])->name('business.manage');
        
        Route::put('/staff/{staff}', [BusinessDataController::class, 'updateStaff'])->name('business.staff.update');
        Route::delete('/staff/{staff}', [BusinessDataController::class, 'destroyStaff'])->name('business.staff.destroy');
        
        Route::put('/ingredients/{ingredient}', [BusinessDataController::class, 'updateIngredient'])->name('business.ingredients.update');
        Route::delete('/ingredients/{ingredient}', [BusinessDataController::class, 'destroyIngredient'])->name('business.ingredients.destroy');
        
        Route::put('/products/{product}', [BusinessDataController::class, 'updateProduct'])->name('business.products.update');
        Route::delete('/products/{product}', [BusinessDataController::class, 'destroyProduct'])->name('business.products.destroy');

        // PUT: Update the specific business data/metrics
        Route::put('/', [BusinessController::class, 'update'])->name('business.update');
        
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
