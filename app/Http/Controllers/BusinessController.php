<?php

namespace App\Http\Controllers;
use App\Models\Order;
use Illuminate\Support\Facades\Gate;
use App\Models\BusinessProfile;
use App\Models\DailyPerformanceLog;
use App\Models\ErrorWasteLog;
use App\Models\Ingredient;
use App\Models\Products;
use App\Models\StaffMri;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class BusinessController extends Controller
{
    // GET: /business/create
    public function create()
    {
        return Inertia::render('Business/Create');
    }

    // POST: /business
    public function store(Request $request)
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'industry_type' => 'required|in:Restaurant,E-commerce,Staffing',
            'seed_data' => 'boolean',
            'record_count' => 'nullable|integer|min:10|max:1000',
        ]);

        DB::transaction(function () use ($request, $validated) {
            // 1. Create the Business Profile
            $business = $request->user()->businessProfiles()->create([
                'business_name' => $validated['business_name'],
                'industry_type' => $validated['industry_type'],
            ]);

            // 2. Check if the user wants to seed random data
            if ($request->seed_data) {
                $this->seedBusinessData($business, $validated['record_count'] ?? 100);
            }
        });

        return redirect()->route('dashboard')->with('message', 'Business created and seeded!');
    }

    private function seedBusinessData($business, $count)
    {
        // Create Default MRI Staff Member
        $staff = StaffMri::create([
            'business_id' => $business->id,
            'name' => 'Lead Auditor',
            'role' => $this->getIndustryRole($business->industry_type),
            'base_quality_rating' => 4.0
        ]);

        // INDUSTRY: RESTAURANT
        if ($business->industry_type === 'Restaurant') {
            $item = Ingredient::create([
                'business_id' => $business->id,
                'name' => 'Premium Beef',
                'unit_cost' => 1200,
                'unit_type' => 'kg',
                'min_stock_threshold' => 15
            ]);

            for ($i = 0; $i < $count; $i++) {
                ErrorWasteLog::create([
                    'ingredient_id' => $item->id,
                    'staff_id' => $staff->id,
                    'error_type' => 'Overcooked',
                    'waste_qty' => rand(1, 3),
                    'financial_loss' => rand(500, 1500),
                    'system_reasoning' => 'Peak hour fatigue; prep time exceeded 25 mins.'
                ]);
            }
        }

        // INDUSTRY: E-COMMERCE
        if ($business->industry_type === 'E-commerce') {
            $product = Products::create([
                'business_id' => $business->id,
                'name' => 'Winter Parka',
                'category' => 'Apparel',
                'attributes' => json_encode(['material' => 'Polyester', 'size_guide' => 'Standard']),
                'customer_rating' => 3.5
            ]);

            // Assuming $count is the total number of operations/logs you want (e.g., 100)
            for ($i = 0; $i < $count; $i++) {

                // We will simulate that ~25% of orders are returned due to size mismatch
                $isReturn = (rand(1, 100) <= 25);
                $salePrice = rand(1500, 3500);

                // 1. Create the Order Record for every transaction
                $order = Order::create([
                    'business_id' => $business->id,
                    'product_id' => $product->id,
                    'staff_id' => $staff->id, // The staff member handling fulfillment
                    'status' => $isReturn ? 'Returned' : 'Completed',
                    'total_price' => $salePrice,
                    'customer_feedback' => $isReturn ? 'Jacket runs way too small.' : 'Good quality.'
                ]);

                // 2. Create the Waste Log ONLY if the order was returned
                if ($isReturn) {
                    ErrorWasteLog::create([
                        'staff_id' => $staff->id,
                        'error_type' => 'Size Mismatch',
                        'financial_loss' => $salePrice * 0.8, // Estimate 80% loss on returned apparel
                        'system_reasoning' => 'Customer return: Product attributes did not match physical size. Order ID: ' . $order->id
                    ]);
                }
            }
        }

        // INDUSTRY: STAFFING
        if ($business->industry_type === 'Staffing') {
            for ($i = 0; $i < $count; $i++) {
                DailyPerformanceLog::create([
                    'staff_id' => $staff->id,
                    'tasks_started' => 100,
                    'tasks_failed' => rand(10, 30),
                    'overtime_hours' => rand(12, 16), // Forced Invariant Violation
                    'created_at' => now()->subDays($i)
                ]);
            }
        }
    }

    private function getIndustryRole($type)
    {
        return [
            'Restaurant' => 'Head Chef',
            'E-commerce' => 'Quality Inspector',
            'Staffing' => 'Shift Supervisor'
        ][$type] ?? 'Manager';
    }

    // GET: /business/{business}/dashboard
    public function show(BusinessProfile $business)
    {
        Gate::authorize('view', $business);

        $business->load(['staff.performanceLogs', 'staff.wasteLogs', 'ingredients.wasteLogs']);

        $industryMetrics = [
            'totalLoss' => $business->staff->flatMap->wasteLogs->sum('financial_loss'),
            'averageFatigue' => $business->staff->flatMap->performanceLogs->avg('overtime_hours') ?? 0,
        ];

        return Inertia::render('Business/Dashboard', [
            'business' => $business,
            'industryMetrics' => $industryMetrics
        ]);
    }

    /**
     * Bridge to the Python Formal Verification Script
     */
    public function verify(Request $request, BusinessProfile $business)
    {
        Gate::authorize('view', $business);
        $business->load(['staff.performanceLogs', 'staff.wasteLogs', 'ingredients', 'products']);

        $isStaffing = $business->industry_type === 'Staffing';

        $packet = [
            'business_info' => [
                'name' => $business->business_name,
                'type' => $business->industry_type
            ],
            'metrics' => [
                'averageFatigue' => (float) ($business->staff->flatMap->performanceLogs->avg('overtime_hours') ?? 0),
                'totalLoss' => (float) $business->staff->flatMap->wasteLogs->sum('financial_loss'),
            ],
            'deep_trace' => [
                'performance_logs' => $isStaffing
                    ? $business->staff->flatMap->performanceLogs->map(fn($log) => [
                        'started' => (int) $log->tasks_started,
                        'failed' => (int) $log->tasks_failed,
                        'ot' => (float) $log->overtime_hours
                    ])
                    : [],
                'waste_logs' => !$isStaffing
                    ? $business->staff->flatMap->wasteLogs->map(fn($log) => [
                        'type' => $log->error_type,
                        'loss' => (float) $log->financial_loss,
                        'reason' => $log->system_reasoning
                    ])
                    : []
            ]
        ];

        $scriptPath = base_path('scripts' . DIRECTORY_SEPARATOR . 'verify_logic.py');
        $pythonPath = 'C:\\Python314\\python.exe';

        // Pass ONLY the executable and script path in the array
        $process = new \Symfony\Component\Process\Process([$pythonPath, $scriptPath]);

        // STREAM the JSON via Standard Input. This fixes all Windows string limit errors!
        $process->setInput(json_encode($packet));

        // Fortified Environment Variables for Windows DNS Resolution
        $process->setEnv([
            'PYTHONPATH' => 'C:\\Users\\Sohaib\\AppData\\Roaming\\Python\\Python314\\site-packages',

            // Critical Windows Networking Variables
            'SystemRoot' => 'C:\\Windows',
            'SystemDrive' => 'C:', // <-- YOU MISSED THIS

            // HARDCODE the PATH. Do NOT use getenv('PATH')
            'PATH' => 'C:\\Windows\\System32;C:\\Windows;C:\\Windows\\System32\\Wbem;C:\\Python314;C:\\Python314\\Scripts',

            // Your Secure API Key
            'GEMINI_API_KEY' => env('GEMINI_API_KEY')
        ]);

        $process->setTimeout(120);

        try {
            $process->mustRun();
            return response()->json(json_decode($process->getOutput()));
        } catch (\Exception $e) {
            return response()->json(['status' => 'ERROR', 'error' => $process->getErrorOutput() ?: $e->getMessage()], 500);
        }
    }
    // GET: /business/{business}/edit
    public function edit(BusinessProfile $business)
    {
        $this->authorize('update', $business);
        return Inertia::render('Business/Edit', ['business' => $business]);
    }

    // PUT: /business/{business}
    public function update(Request $request, BusinessProfile $business)
    {
        $this->authorize('update', $business);

        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'industry_type' => 'required|in:Restaurant,E-commerce,Staffing',
        ]);

        $business->update($validated);

        return redirect()->route('business.dashboard', $business->id);
    }
}