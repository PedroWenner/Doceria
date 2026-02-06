<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['login', 'register']]);
    }

    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login()
    {
        $credentials = request(['email', 'password']);

        // Set dynamic TTL
        $settings = \App\Models\CompanySetting::first();
        if ($settings && $settings->auth_token_expiration) {
            auth('api')->factory()->setTTL($settings->auth_token_expiration);
        }

        if (! $token = auth('api')->attempt($credentials)) {
            return $this->error('Unauthorized', 401);
        }

        // Check if user is active
        $user = auth('api')->user();
        if (! $user->is_active) {
            auth('api')->logout();
            return $this->error('Somente usuários ativos podem logar.', 403);
        }

        return $this->respondWithToken($token);
    }

    /**
     * Register a new user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function register()
    {
        $validator = \Illuminate\Support\Facades\Validator::make(request()->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'nullable|in:customer,admin,manager'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Create User
        // Note: We include 'role' column if it exists, as suggested by User model fillable
        $user = \App\Models\User::create([
            'name' => request('name'),
            'email' => request('email'),
            'password' => \Illuminate\Support\Facades\Hash::make(request('password')),
            'role' => request('role', 'customer'),
        ]);

        // Attach Role Relation (Critical for hasRole check)
        $roleSlug = request('role', 'customer');
        $role = \App\Models\Role::where('slug', $roleSlug)->first();
        
        if ($role) {
            $user->roles()->attach($role);
        } else {
            // Fallback: Create customer role if missing (prevent broken auth)
            if ($roleSlug === 'customer') {
                $newRole = \App\Models\Role::create([
                    'name' => 'Customer',
                    'slug' => 'customer',
                    'description' => 'Cliente da loja'
                ]);
                $user->roles()->attach($newRole);
            }
        }

        // Auto login
        $token = auth('api')->login($user);

        return $this->respondWithToken($token);
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        return $this->success(auth('api')->user());
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        auth('api')->logout();

        return $this->success(null, 'Successfully logged out');
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        // Set dynamic TTL
        $settings = \App\Models\CompanySetting::first();
        if ($settings && $settings->auth_token_expiration) {
            auth('api')->factory()->setTTL($settings->auth_token_expiration);
        }
        
        return $this->respondWithToken(auth('api')->refresh());
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token)
    {
        return $this->success([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => auth('api')->user()
        ]);
    }
}
