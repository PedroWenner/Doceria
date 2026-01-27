<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * List all users with their roles.
     */
    public function index()
    {
        $users = User::with('roles')->paginate(10);
        return response()->json($users);
    }

    /**
     * List all available roles.
     */
    public function roles()
    {
        return response()->json(Role::all());
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

        return response()->json([
            'message' => 'Roles updated successfully',
            'user' => $user->load('roles')
        ]);
    }
}
