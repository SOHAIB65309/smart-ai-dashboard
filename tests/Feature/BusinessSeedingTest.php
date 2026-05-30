<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\BusinessProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BusinessSeedingTest extends TestCase
{
    use RefreshDatabase;

    public function test_business_can_be_created_with_advanced_seeding()
    {
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('business.store'), [
            'business_name' => 'Test Restaurant',
            'industry_type' => 'Restaurant',
            'seed_data' => true,
            'seeding_params' => [
                'staff_count' => 3,
                'performance_range' => [80, 100],
                'fatigue_range' => [0, 2],
                'waste_intensity' => 20,
            ]
        ]);

        $response->assertStatus(302);
        $response->assertSessionHasNoErrors();
        $business = BusinessProfile::first();
        $this->assertNotNull($business);
        $this->assertEquals('Test Restaurant', $business->business_name);
        
        $response->assertRedirect(route('business.dashboard', $business->id));
        
        // Verify seeding
        $this->assertCount(3, $business->staff);
        $this->assertGreaterThan(0, $business->ingredients()->count());
        
        // Check for potential NaN or 0 in metrics that should be set
        $staff = $business->staff()->first();
        $this->assertGreaterThan(0, $staff->base_quality_rating);
    }

    public function test_business_dashboard_handles_no_data_gracefully()
    {
        $user = User::factory()->create();
        $business = BusinessProfile::create([
            'user_id' => $user->id,
            'business_name' => 'Empty Business',
            'industry_type' => 'Staffing',
        ]);

        $response = $this->actingAs($user)->get(route('business.dashboard', $business->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Business/Dashboard')
            ->where('industryMetrics.averageFatigue', 0)
            ->where('industryMetrics.totalLoss', 0)
        );
    }

    public function test_global_dashboard_handles_empty_businesses()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('stats.totalBusinesses', 0)
            ->where('stats.totalLoss', 0)
            ->where('stats.reliabilityScore', 100)
        );
    }
}
