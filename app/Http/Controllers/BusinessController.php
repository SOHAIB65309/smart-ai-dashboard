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

    // private function seedBusinessData($business, $count)
    // {
    //     $staff = StaffMri::create([
    //         'business_id' => $business->id,
    //         'name' => 'Lead Auditor',
    //         'role' => $this->getIndustryRole($business->industry_type),
    //         'base_quality_rating' => 4.0
    //     ]);

    //     for ($i = 0; $i < 5; $i++) {
    //         DailyPerformanceLog::create([
    //             'staff_id' => $staff->id,
    //             'tasks_started' => rand(50, 100),
    //             'tasks_failed' => rand(0, 5),
    //             'overtime_hours' => ($business->industry_type === 'Staffing') ? rand(12, 16) : rand(0, 4),
    //             'created_at' => now()->subDays($i)
    //         ]);
    //     }

    //     $incidentCount = rand(1, max(1, $count));

    //     if ($business->industry_type === 'Restaurant') {
    //         $item = Ingredient::create([
    //             'business_id' => $business->id,
    //             'name' => 'Premium Beef',
    //             'unit_cost' => 1200,
    //             'unit_type' => 'kg',
    //             'min_stock_threshold' => 15
    //         ]);

    //         for ($i = 0; $i < $incidentCount; $i++) {
    //             ErrorWasteLog::create([
    //                 'ingredient_id' => $item->id,
    //                 'staff_id' => $staff->id,
    //                 'error_type' => 'Overcooked',
    //                 'waste_qty' => rand(1, 3),
    //                 'financial_loss' => rand(500, 1500),
    //                 'system_reasoning' => 'Peak hour fatigue; prep time exceeded 25 mins.'
    //             ]);
    //         }
    //     }

    //     if ($business->industry_type === 'E-commerce') {
    //         // Correcting class name to Products as per Source 7
    //         $product = Products::create([
    //             'business_id' => $business->id,
    //             'name' => 'Winter Parka',
    //             'category' => 'Apparel',
    //             'attributes' => ['material' => 'Polyester', 'size_guide' => 'Standard'],
    //             'customer_rating' => 3.5
    //         ]);

    //         for ($i = 0; $i < $incidentCount; $i++) {
    //             $isReturn = (rand(1, 100) <= 25);
    //             $salePrice = rand(1500, 3500);

    //             $order = Order::create([
    //                 'business_id' => $business->id,
    //                 'product_id' => $product->id,
    //                 'staff_id' => $staff->id,
    //                 'status' => $isReturn ? 'Returned' : 'Completed',
    //                 'total_price' => $salePrice,
    //                 'customer_feedback' => $isReturn ? 'Jacket runs way too small.' : 'Good quality.'
    //             ]);

    //             if ($isReturn) {
    //                 // Link e-commerce waste to the product via IngredientWasteLog 
    //                 // to match the Products model relationship in Source 7
    //                 IngredientWasteLog::create([
    //                     'product_id' => $product->id, // Add this if you modify migration, or use ingredient_id as a proxy
    //                     'staff_id' => $staff->id,
    //                     'waste_qty' => 1,
    //                     'reason' => 'Size Mismatch. Order ID: ' . $order->id,
    //                     'financial_loss' => $salePrice * 0.8 // Ensure your IngredientWasteLog has this field
    //                 ]);
    //             }
    //         }
    //     }
    // }

    private function getIndustryRole($type)
    {
        return [
            'Restaurant' => 'Head Chef',
            'E-commerce' => 'Quality Inspector',
            'Staffing' => 'Shift Supervisor'
        ][$type] ?? 'Manager';
    }
    public function show(BusinessProfile $business)
    {
        Gate::authorize('view', $business);

        $business->load([
            'staff.performanceLogs',
            'staff.wasteLogs',
            'ingredients.wasteLogs',
            'products.wasteLogs',
            'orders'
        ]);

        $allPerformance = $business->staff->flatMap->performanceLogs;
        $allWaste = $business->staff->flatMap->wasteLogs;

        $industryMetrics = [
            'totalLoss' => $allWaste->sum('financial_loss'),
            'averageFatigue' => round($allPerformance->avg('overtime_hours') ?? 0, 1),
            'anomalyCount' => $allWaste->count(),
        ];

        return Inertia::render('Business/Dashboard', [
            'business' => $business,
            'industryMetrics' => $industryMetrics
        ]);
    }
    private function seedBusinessData($business, $count)
    {
        // 1. Create Multiple Staff Profiles for weighted Reliability Scores
        $roles = [
            'Restaurant' => ['Head Chef', 'Sous Chef', 'Line Cook'],
            'E-commerce' => ['Inventory Manager', 'Quality Lead', 'Fulfillment'],
            'Staffing' => ['Shift Supervisor', 'Safety Officer', 'Area Lead']
        ];

        $staffMembers = [];
        $currentRoles = $roles[$business->industry_type] ?? ['Manager'];

        foreach ($currentRoles as $roleName) {
            $staffMembers[] = StaffMri::create([
                'business_id' => $business->id,
                'name' => fake()->name(),
                'role' => $roleName,
                'base_quality_rating' => rand(3, 5)
            ]);
        }

        // 2. Generate Performance Logs (Fatigue Index) for all staff
        foreach ($staffMembers as $staff) {
            for ($i = 0; $i < 7; $i++) {
                DailyPerformanceLog::create([
                    'staff_id' => $staff->id,
                    'tasks_started' => rand(50, 100),
                    'tasks_failed' => rand(0, 8),
                    'overtime_hours' => ($business->industry_type === 'Staffing') ? rand(10, 15) : rand(0, 4),
                    'created_at' => now()->subDays($i)
                ]);
            }
        }

        $incidentCount = rand(5, max(10, $count));

        // 3. INDUSTRY: RESTAURANT
        if ($business->industry_type === 'Restaurant') {
            $ingredients = ['Premium Beef', 'Organic Salmon', 'Dairy Cream'];
            foreach ($ingredients as $name) {
                $item = Ingredient::create([
                    'business_id' => $business->id,
                    'name' => $name,
                    'unit_cost' => rand(500, 1500),
                    'unit_type' => 'kg',
                    'min_stock_threshold' => 15
                ]);

                for ($i = 0; $i < rand(2, 5); $i++) {
                    ErrorWasteLog::create([
                        'ingredient_id' => $item->id,
                        'staff_id' => $staffMembers[array_rand($staffMembers)]->id,
                        'error_type' => fake()->randomElement(['Overcooked', 'Expired', 'Prep Error']),
                        'waste_qty' => rand(1, 3),
                        'financial_loss' => rand(400, 1200),
                        'system_reasoning' => 'Peak hour fatigue; prep time exceeded 25 mins.'
                    ]);
                }
            }
        }

        // 4. INDUSTRY: E-COMMERCE
        if ($business->industry_type === 'E-commerce') {
            $products = ['Winter Parka', 'Leather Boots', 'Tech Backpack'];
            foreach ($products as $name) {
                $product = Products::create([
                    'business_id' => $business->id,
                    'name' => $name,
                    'category' => 'Retail',
                    'attributes' => ['material' => 'Synthetic', 'verified' => true],
                    'customer_rating' => rand(3, 5)
                ]);

                for ($i = 0; $i < rand(3, 7); $i++) {
                    $isReturn = (rand(1, 100) <= 30);
                    $salePrice = rand(2000, 6000);

                    $order = Order::create([
                        'business_id' => $business->id,
                        'product_id' => $product->id,
                        'staff_id' => $staffMembers[array_rand($staffMembers)]->id,
                        'status' => $isReturn ? 'Returned' : 'Completed',
                        'total_price' => $salePrice,
                        'customer_feedback' => $isReturn ? 'Size mismatch' : 'Good quality'
                    ]);

                    if ($isReturn) {
                        ErrorWasteLog::create([
                            'product_id' => $product->id,
                            'staff_id' => $order->staff_id,
                            'error_type' => 'Size Mismatch',
                            'waste_qty' => 1,
                            'financial_loss' => $salePrice * 0.7,
                            'system_reasoning' => 'Customer return on Order #' . $order->id . ': Physical size invariant failed.'
                        ]);
                    }
                }
            }
        }
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
            // Inside the verify method, update the 'deep_trace'
            'deep_trace' => [
                'performance_logs' => $isStaffing
                    ? $business->staff->flatMap->performanceLogs->map(fn($log) => [
                        'staff_name' => $log->staff->name, // Add Name
                        'started' => (int) $log->tasks_started,
                        'failed' => (int) $log->tasks_failed,
                        'ot' => (float) $log->overtime_hours
                    ])
                    : [],
                'waste_logs' => !$isStaffing
                    ? $business->staff->flatMap->wasteLogs->map(fn($log) => [
                        'item_name' => $log->ingredient->name ?? $log->product->name ?? 'Unknown', // Add Item Name
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