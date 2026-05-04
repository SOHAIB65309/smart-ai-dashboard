<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Products extends Model
{
  protected $fillable = [
        'business_id', 
        'name', 
        'category', 
        'attributes', 
        'customer_rating'
    ];

    protected $casts = [
        'attributes' => 'json',
    ];

    /**
     * Get the business profile that owns this product.
     */
    public function business()
    {
        return $this->belongsTo(BusinessProfile::class, 'business_id');
    }

    /**
     * Get the specific recipe or production requirements for this product.
     */
    public function recipeRequirements()
    {
        return $this->hasMany(RecipeRequirement::class);
    }
    public function wasteLogs(){return $this->hasMany(ErrorWasteLog::class,'product_id');}
}
