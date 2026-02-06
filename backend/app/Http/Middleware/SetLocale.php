<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->header('Accept-Language');

        if ($locale && in_array(substr($locale, 0, 2), ['en', 'pt'])) {
            app()->setLocale(substr($locale, 0, 2));
        } else {
             app()->setLocale('pt'); // Default fallback to PT if not specified or invalid for this app logic
        }

        return $next($request);
    }
}
