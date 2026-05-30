<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BusinessSeedRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'business_name' => 'required|string|max:255',
            'industry_type' => 'required|in:Restaurant,E-commerce,Staffing',
            'seed_data' => 'required|boolean',
            'seeding_params' => 'required_if:seed_data,true|array',
            'seeding_params.staff_count' => 'integer|min:1|max:20',
            'seeding_params.performance_range' => 'array|size:2',
            'seeding_params.performance_range.0' => 'integer|min:0|max:100', // Min percentage for performance
            'seeding_params.performance_range.1' => 'integer|min:0|max:100', // Max percentage for performance
            'seeding_params.fatigue_range' => 'array|size:2',
            'seeding_params.fatigue_range.0' => 'numeric|min:0|max:24', // Min OT hours
            'seeding_params.fatigue_range.1' => 'numeric|min:0|max:24', // Max OT hours
            'seeding_params.waste_intensity' => 'integer|min:0|max:100', // Scale for how many waste incidents
        ];
    }
}
