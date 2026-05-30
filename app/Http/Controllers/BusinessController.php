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

use App\Http\Requests\BusinessSeedRequest;

class BusinessController extends Controller
{
    // GET: /business/create
    public function create()
    {
        return Inertia::render('Business/Create');
    }

    // POST: /business
    public function store(BusinessSeedRequest $request)
    {
        $validated = $request->validated();

        $business = \Illuminate\Support\Facades\DB::transaction(function () use ($request, $validated) {
            // 1. Create the Business Profile
            $business = $request->user()->businessProfiles()->create([
                'business_name' => $validated['business_name'],
                'industry_type' => $validated['industry_type'],
            ]);

            // 2. Advanced Seeding
            if ($validated['seed_data']) {
                $this->advancedSeed($business, $validated['seeding_params']);
            }
            
            return $business;
        });

        return redirect()->route('business.dashboard', $business->id)->with('message', 'Business created and seeded with precision!');
    }

    private function advancedSeed($business, $params)
    {
        $staffCount = $params['staff_count'] ?? 3;
        $perfRange = $params['performance_range'] ?? [70, 95];
        $fatigueRange = $params['fatigue_range'] ?? [0, 4];
        $intensity = ($params['waste_intensity'] ?? 50) / 100;

        $roles = [
            'Restaurant' => ['Head Chef', 'Sous Chef', 'Line Cook', 'Server'],
            'E-commerce' => ['Inventory Manager', 'Quality Lead', 'Fulfillment', 'Shipper'],
            'Staffing' => ['Shift Supervisor', 'Safety Officer', 'Area Lead', 'Coordinator']
        ];

        $staffMembers = [];
        $currentRoles = $roles[$business->industry_type] ?? ['Manager'];

        for ($i = 0; $i < $staffCount; $i++) {
            $staffMembers[] = StaffMri::create([
                'business_id' => $business->id,
                'name' => fake()->name(),
                'role' => $currentRoles[$i % count($currentRoles)],
                'base_quality_rating' => rand($perfRange[0], $perfRange[1]) / 20 // Scale to 0-5
            ]);
        }

        foreach ($staffMembers as $staff) {
            for ($d = 0; $d < 7; $d++) {
                $started = rand(50, 100);
                // Failure rate inversely proportional to performance rating, scaled by intensity
                $failRate = (1 - ($staff->base_quality_rating / 5)) * $intensity * 0.2; 
                
                DailyPerformanceLog::create([
                    'staff_id' => $staff->id,
                    'tasks_started' => $started,
                    'tasks_failed' => rand(0, (int)($started * $failRate)),
                    'overtime_hours' => rand($fatigueRange[0] * 10, $fatigueRange[1] * 10) / 10,
                    'created_at' => now()->subDays($d)
                ]);
            }
        }

        // Seeding Industry Specific Items
        if ($business->industry_type === 'Restaurant') {
            $items = ['Premium Beef', 'Organic Salmon', 'Dairy Cream', 'Truffle Oil'];
            foreach (array_slice($items, 0, rand(2, 4)) as $name) {
                $ingredient = Ingredient::create([
                    'business_id' => $business->id,
                    'name' => $name,
                    'unit_cost' => rand(500, 2000),
                    'unit_type' => 'kg',
                    'min_stock_threshold' => rand(5, 20)
                ]);

                $incidentCount = (int)(10 * $intensity);
                for ($k = 0; $k < $incidentCount; $k++) {
                    ErrorWasteLog::create([
                        'ingredient_id' => $ingredient->id,
                        'staff_id' => $staffMembers[array_rand($staffMembers)]->id,
                        'error_type' => fake()->randomElement(['Overcooked', 'Expired', 'Prep Error']),
                        'waste_qty' => rand(1, 5),
                        'financial_loss' => rand(400, 1500),
                        'system_reasoning' => 'Variation seeding: fatigue correlation detected.'
                    ]);
                }
            }
        }

        if ($business->industry_type === 'E-commerce') {
            $items = ['Winter Parka', 'Leather Boots', 'Tech Backpack', 'Smart Watch'];
            foreach (array_slice($items, 0, rand(2, 4)) as $name) {
                $product = Products::create([
                    'business_id' => $business->id,
                    'name' => $name,
                    'category' => 'Retail',
                    'attributes' => ['material' => 'Synthetic', 'verified' => true],
                    'customer_rating' => rand(30, 50) / 10
                ]);

                $incidentCount = (int)(8 * $intensity);
                for ($k = 0; $k < $incidentCount; $k++) {
                    $isReturn = (rand(1, 100) <= (30 * $intensity));
                    $salePrice = rand(2000, 8000);

                    $order = Order::create([
                        'business_id' => $business->id,
                        'product_id' => $product->id,
                        'staff_id' => $staffMembers[array_rand($staffMembers)]->id,
                        'status' => $isReturn ? 'Returned' : 'Completed',
                        'total_price' => $salePrice,
                        'customer_feedback' => $isReturn ? 'Defective' : 'Satisfactory'
                    ]);

                    if ($isReturn) {
                        ErrorWasteLog::create([
                            'product_id' => $product->id,
                            'staff_id' => $order->staff_id,
                            'error_type' => 'Defective',
                            'waste_qty' => 1,
                            'financial_loss' => $salePrice * 0.6,
                            'system_reasoning' => 'Return rate fluctuation in seeding.'
                        ]);
                    }
                }
            }
        }
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
            'modifiers' => [
                'anomaly_delta' => (float) $request->input('modifiers.anomaly_delta', 0),
                'fatigue_delta' => (float) $request->input('modifiers.fatigue_delta', 0),
                'loss_mitigation' => (float) $request->input('modifiers.loss_mitigation', 0),
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