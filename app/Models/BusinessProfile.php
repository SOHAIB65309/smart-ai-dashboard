<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// BusinessProfile.php
class BusinessProfile extends Model {
    protected $fillable = ['user_id', 'business_name', 'industry_type'];
    
    public function ingredients() { return $this->hasMany(Ingredient::class,'business_id'); }
    public function staff() { return $this->hasMany(StaffMri::class,'business_id'); }
    public function products() { return $this->hasMany(Products::class,'business_id'); }
    public function performanceLogs() { return $this->hasMany(DailyPerformanceLog::class,'business_id'); }
    public function wasteLogs() { return $this->hasMany(IngredientWasteLog::class,'business_id'); }
    public function orders() { return $this->hasMany(Order::class,'business_id'); }
}
