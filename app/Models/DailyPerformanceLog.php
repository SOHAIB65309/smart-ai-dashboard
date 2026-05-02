<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyPerformanceLog extends Model
{
    protected $fillable = [
        'staff_id', 
        'tasks_started',
        'tasks_failed',
        'overtime_hours'
    ];

    /**
     * Link the log back to the specific staff member's profile.
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(StaffMri::class, 'staff_id');
    }
}