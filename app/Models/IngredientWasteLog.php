<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class IngredientWasteLog extends Model {
    protected $fillable = ['ingredient_id', 'staff_id', 'waste_qty', 'reason'];
    public function ingredient() {
        return $this->belongsTo(Ingredient::class, 'ingredient_id');
    } 
}