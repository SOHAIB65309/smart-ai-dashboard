<?php

namespace App\Policies;

use App\Models\BusinessProfile;
use App\Models\User;

class BusinessProfilePolicy
{
    /**
     * Determine whether the user can view any models (List view).
     */
    public function viewAny(User $user): bool
    {
        // Allow authenticated users to hit the list index
        return true; 
    }

    /**
     * Determine whether the user can view the specific business dashboard.
     */
    public function view(User $user, BusinessProfile $businessProfile): bool
    {
        // Only allow if the business belongs to the logged-in user
        return $user->id === $businessProfile->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Any logged-in user can create a business profile
        return true; 
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, BusinessProfile $businessProfile): bool
    {
        return $user->id === $businessProfile->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, BusinessProfile $businessProfile): bool
    {
        return $user->id === $businessProfile->user_id;
    }
}