# 01. Login Setup & Tech Stack

## Date: 2026-01-26
## Status: In Progress

## 1. Technlogy Stack
- **Frontend**: Next.js 14+ (App Router), Tailwind CSS
- **Backend**: Laravel 10+ (API)
- **Styling**: Tailwind CSS with Custom "Premium Patisserie" Theme
- **Design Pattern**: Glassmorphism

## 2. Theme Definition "Premium Patisserie"
The dashboard uses a sophisticated color palette evoking high-end confectionery.

### Color Palette (Tailwind Config)
| Name | Color | Hex | Usage |
|------|-------|-----|-------|
| `brand-pink` | Soft Pink | `#FFD1DC` | Backgrounds, Soft Highlights |
| `brand-choco` | Deep Chocolate | `#3E2723` | Text, Primary Buttons |
| `brand-cream` | Cream | `#FFFDD0` | Cards, Panels |
| `brand-gold` | Gold | `#D4AF37` | Accents, Borders |

## 3. Implementation Details
### Frontend
- **Login Page**: Located at `/app/login/page.tsx`
- **Components**:
    - `GlassCard`: A reusable card component with backdrop-blur and semi-transparent white background.
    - `Input`: Custom styled input fields with gold focus rings.

### Backend
- **Auth**: Standard Laravel Authentication (Sanctum/Passport).
- **Routes**: `/api/login` (POST).
