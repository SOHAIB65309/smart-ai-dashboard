<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class StaffMri extends Model
{
    protected $fillable = ['business_id', 'name', 'role', 'base_quality_rating'];
    public function performanceLogs()
    {
        return $this->hasMany(DailyPerformanceLog::class, 'staff_id');
    }

    public function wasteLogs()
    {
        return $this->hasMany(ErrorWasteLog::class, 'staff_id'); // Trace waste to specific staff
    }
}