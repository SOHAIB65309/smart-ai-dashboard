<?php

namespace App\Http\Controllers;

use App\Models\BusinessProfile;
use App\Models\DailyPerformanceLog;
use App\Models\ErrorWasteLog;
use App\Models\Ingredient;
use App\Models\Order;
use App\Models\Products;
use App\Models\StaffMri;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class BusinessDataController extends Controller
{
    /**
     * Show the business data management page.
     */
    public function edit(BusinessProfile $business)
    {
        Gate::authorize('update', $business);

        $business->load([
            'staff.performanceLogs',
            'staff.wasteLogs',
            'ingredients',
            'products'
        ]);

        return Inertia::render('Business/DataEdit', [
            'business' => $business,
            'staff' => $business->staff,
            'ingredients' => $business->ingredients,
            'products' => $business->products,
        ]);
    }

    /**
     * Update Staff MRI.
     */
    public function updateStaff(Request $request, BusinessProfile $business, StaffMri $staff)
    {
        Gate::authorize('update', $business);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'base_quality_rating' => 'required|numeric|min:0|max:5',
        ]);

        $staff->update($validated);
        return back()->with('message', 'Staff member updated.');
    }

    /**
     * Delete Staff MRI and related logs.
     */
    public function destroyStaff(BusinessProfile $business, StaffMri $staff)
    {
        Gate::authorize('update', $business);
        
        $staff->delete();
        return back()->with('message', 'Staff member and related data removed.');
    }

    /**
     * Update Ingredient.
     */
    public function updateIngredient(Request $request, BusinessProfile $business, Ingredient $ingredient)
    {
        Gate::authorize('update', $business);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit_cost' => 'required|numeric|min:0',
            'unit_type' => 'required|string|max:50',
            'min_stock_threshold' => 'required|integer|min:0',
        ]);

        $ingredient->update($validated);
        return back()->with('message', 'Ingredient updated.');
    }

    /**
     * Delete Ingredient.
     */
    public function destroyIngredient(BusinessProfile $business, Ingredient $ingredient)
    {
        Gate::authorize('update', $business);
        $ingredient->delete();
        return back()->with('message', 'Ingredient removed.');
    }

    /**
     * Update Product.
     */
    public function updateProduct(Request $request, BusinessProfile $business, Products $product)
    {
        Gate::authorize('update', $business);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'customer_rating' => 'required|numeric|min:0|max:5',
        ]);

        $product->update($validated);
        return back()->with('message', 'Product updated.');
    }

    /**
     * Delete Product.
     */
    public function destroyProduct(BusinessProfile $business, Products $product)
    {
        Gate::authorize('update', $business);
        $product->delete();
        return back()->with('message', 'Product removed.');
    }
}
