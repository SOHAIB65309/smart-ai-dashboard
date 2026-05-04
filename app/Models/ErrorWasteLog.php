<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ErrorWasteLog extends Model
{
    protected $fillable = [
        'ingredient_id', 
        'product_id',
        'staff_id',
        'product_id',
        'error_type', 
        'financial_loss', 
        'waste_qty', 
        'system_reasoning'
    ];

    /**
     * Get the ingredient associated with the waste log.
     */
    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }

    /**
     * Get the staff member who recorded or caused the error.
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(StaffMri::class, 'staff_id');
    }
}