<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecipeRequirement extends Model
{
    protected $fillable = ['product_id', 'ingredient_id', 'required_qty'];

    /**
     * The product (Dish or Clothing Item) this requirement belongs to.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Products::class);
    }

    /**
     * The specific ingredient required for this recipe.
     */
    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }
}