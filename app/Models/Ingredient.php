<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ingredient extends Model
{
    protected $fillable = [
        'business_id', 
        'name', 
        'stock_qty', 
        'unit_cost', 
        'unit_type', // Ensure this matches your migration
        'expiry_date',
        'min_stock_threshold'
    ];

    /**
     * Link to the business owner for multi-tenant isolation.
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(BusinessProfile::class, 'business_id');
    }

    /**
     * Trace waste logs specifically for this ingredient.
     */
    public function wasteLogs(): HasMany
    {
        return $this->hasMany(ErrorWasteLog::class);
    }

    /**
     * See which recipes rely on this ingredient.
     */
    public function recipeRequirements(): HasMany
    {
        return $this->hasMany(RecipeRequirement::class);
    }
}