# 02. Infrastructure, RBAC & Dashboard

## Date: 2026-01-26
## Status: Implementation Complete (Docker Pending Start)

## 1. Infrastructure (Docker & Postgres)
We moved from a local setup to a containerized environment.
- **Docker Compose**: `docker-compose.yml` defines `sweetstore-app` (Laravel) and `sweetstore-db` (PostgreSQL 16).
- **Database**: Configured Laravel to use `pgsql` driver.
- **Status**: Configuration files created. *Docker start command encountered network issues - requires manual start.*

## 2. Role-Based Access Control (RBAC)
A scalable permission system was implemented.

### Database Schema
- `roles`: `admin`, `manager`, `customer`.
- `permissions`: Granular capabilities (e.g., `view_dashboard`).
- `role_user` & `permission_role`: Pivot tables for Many-to-Many relationships.

### Implementation Details
- **Traits**: `User` model now has `hasRole()` and `hasPermission()` methods.
- **Middleware**: `CheckRole` middleware created and registered as `role`.
    - Usage: `Route::middleware('role:admin')`
- **Gates**: `AuthServiceProvider` grants `admin` role all capabilities implicitly.

## 3. Dashboard Implementation
The Dashboard UI follows the "Premium Patisserie" theme.

- **Layout**: `/dashboard/layout.tsx` featuring a glassmorphism sidebar.
- **Stats**: `/dashboard/page.tsx` showing revenue, orders, and recent activity.
- **Route**: Access at `http://localhost:3000/dashboard`.
