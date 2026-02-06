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
     * Create a new user.
     */
    public function store(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make(request()->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'nullable|exists:roles,slug'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
            'role' => $request->role ?? 'customer',
        ]);

        // Attach Role
        $roleSlug = $request->role ?? 'customer';
        $role = Role::where('slug', $roleSlug)->first();
        
        if ($role) {
            $user->roles()->attach($role);
        }

        return $this->success($user->load('roles'), 'User created successfully', 201);
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
