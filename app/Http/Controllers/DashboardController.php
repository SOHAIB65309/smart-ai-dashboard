<?php

namespace App\Http\Controllers;

use App\Models\BusinessProfile;
use App\Models\ErrorWasteLog;
use App\Models\DailyPerformanceLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $businesses = $user->businessProfiles()->with(['staff.performanceLogs', 'staff.wasteLogs'])->get();

        // Aggregate Metrics
        $totalBusinesses = $businesses->count();
        
        $allWasteLogs = $businesses->flatMap(fn($b) => $b->staff->flatMap->wasteLogs);
        $totalGlobalLoss = $allWasteLogs->sum('financial_loss');
        
        $allPerformanceLogs = $businesses->flatMap(fn($b) => $b->staff->flatMap->performanceLogs);
        $avgGlobalFatigue = round($allPerformanceLogs->count() > 0 ? $allPerformanceLogs->avg('overtime_hours') : 0, 1);
        
        // Calculate Global Reliability (simplified)
        $totalLogs = $allWasteLogs->count();
        $reliabilityScore = max(0, 100 - ($totalLogs * 0.5) - ($avgGlobalFatigue * 2));

        // Recent Projects/Businesses for the table
        $recentBusinesses = $businesses->take(5)->map(function ($b) {
            $staffTrace = $b->staff->flatMap->wasteLogs;
            $loss = $staffTrace->count() > 0 ? $staffTrace->sum('financial_loss') : 0;
            return [
                'id' => $b->id,
                'name' => $b->business_name,
                'type' => $b->industry_type,
                'loss' => $loss,
                'status' => $loss > 10000 ? 'High Risk' : 'Stable',
            ];
        });

        return Inertia::render('dashboard', [
            'stats' => [
                'totalBusinesses' => $totalBusinesses,
                'totalLoss' => $totalGlobalLoss,
                'avgFatigue' => $avgGlobalFatigue,
                'reliabilityScore' => round($reliabilityScore, 1),
            ],
            'recentBusinesses' => $recentBusinesses,
            'industryDistribution' => [
                'Restaurant' => $businesses->where('industry_type', 'Restaurant')->count(),
                'E-commerce' => $businesses->where('industry_type', 'E-commerce')->count(),
                'Staffing' => $businesses->where('industry_type', 'Staffing')->count(),
            ]
        ]);
    }
}
