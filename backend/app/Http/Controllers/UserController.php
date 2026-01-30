<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponse;

    /**
     * List all users with their roles.
     */
    public function index()
    {
        $limit = \App\Models\CompanySetting::first()->pagination_limit ?? 10;
        $users = User::with('roles')->paginate($limit);
        return $this->success($users);
    }

    /**
     * List all available roles.
     */
    public function roles()
    {
        return $this->success(Role::all());
    }

    /**
     * Update roles for a specific user.
     */
    public function updateRoles(Request $request, User $user)
    {
        $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,slug' // Use slug validation
        ]);

        // Find role IDs based on slugs
        $roleIds = Role::whereIn('slug', $request->roles)->pluck('id');
        
        $user->roles()->sync($roleIds);

        return $this->success($user->load('roles'), 'Roles updated successfully');
    }
}
