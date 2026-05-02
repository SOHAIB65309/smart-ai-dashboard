<?php

use App\Http\Controllers\BusinessController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
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

        // PUT: Update the specific business data/metrics
        Route::put('/', [BusinessController::class, 'update'])->name('business.update');
        
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
