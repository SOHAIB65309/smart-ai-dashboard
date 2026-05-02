<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = [
        'business_id',
        'product_id',
        'staff_id',
        'status',
        'total_price',
        'customer_feedback'
    ];

    /**
     * Link the order to the specific business (Multi-tenant isolation).
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(BusinessProfile::class, 'business_id');
    }

    /**
     * Identify which product was purchased (Restaurant dish or E-commerce item).
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Products::class);
    }

    /**
     * Trace which staff member processed this specific order (MRI Traceability).
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(StaffMri::class, 'staff_id');
    }
}