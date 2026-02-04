# Walkthrough: Transparent Checkout (Mercado Pago Bricks)

This document details the complete implementation of the **Transparent Checkout** using Mercado Pago's **Payment Brick**. The goal was to allow users to pay via Credit Card and Pix directly on the checkout page without being redirected to an external site.

## 1. Architecture Overview

The solution consists of a frontend integration using `@mercadopago/sdk-react` and a backend integration for processing payments and syncing statuses.

### **Frontend (`checkout/page.tsx`)**
- **Library**: `@mercadopago/sdk-react`
- **Responsibility**: Render the secure card/pix form, collect sensitive data, and tokenize it before sending to the backend.
- **Key Component**: `<Payment />` (The "Brick").

### **Backend (Laravel API)**
- **Endpoints**:
  - `POST /orders`: Creates the initial order in "pending" state.
  - `POST /orders/{id}/pay`: Receives the payment data (token, issuer, installments) from the Brick and processes it via Mercado Pago API.
- **Service**: `MercadoPagoService` handles the communication with MP.

## 2. Implementation Details

### **A. Initialization & Configuration**
To ensure performance and avoid UI glitches, the initialization logic was strictly controlled:

```typescript
// 1. Guard against premature rendering
const [isMercadoPagoInitialized, setIsMercadoPagoInitialized] = useState(false);

// 2. Initialize only once when Public Key is available
useEffect(() => {
    if (mpMethod && mpMethod.public_key) {
        initMercadoPago(mpMethod.public_key, { locale: 'pt-BR' });
        setIsMercadoPagoInitialized(true);
    }
}, [mpMethod]);
```

### **B. Preventing Re-renders (The "Duplication" Fix)**
One of the main challenges was the Payment Brick duplicating or flickering when other state variables (like `cartTotal`) changed. We solved this using `useMemo`:

```typescript
// Memoize initialization data to prevent Brick reload on re-renders
const paymentInitialization = useMemo(() => ({
    amount: finalTotal, // Updates only when total changes
    preferenceId: '<generated-id>',
}), [finalTotal]);

// Memoize customization/styling
const paymentCustomization = useMemo(() => ({
    paymentMethods: {
        ticket: [],
        bankTransfer: isPix ? ['all'] : [],
        creditCard: isCard ? ['all'] : [],
        debitCard: isCard ? ['all'] : [],
        mercadoPago: []
    },
    visual: {
        style: {
            customVariables: {
                baseColor: '#ec4899', // Brand Identity
            }
        }
    }
}), [isPix, isCard]); // Only updates if payment method type changes
```

### **C. Payment Flow**

1.  **User Selects Method**:
    *   If **Money**: Standard checkout flow (Order created with `change_for`).
    *   If **Card/Pix**: The `<Payment>` Brick is rendered.
2.  **User Submits Data (Brick)**:
    *   The Brick handles validation internally.
    *   On success, it calls the `onSubmit` callback with `formData`.
3.  **Backend Processing**:
    *   We first create the **Order** in our database.
    *   We then call the **Payment Endpoint** with the `formData` from the Brick.
    *   If successful, the cart is cleared and the user is redirected to `/checkout/success`.

## 3. Challenges & Solutions

| Challenge | Root Cause | Solution |
| :--- | :--- | :--- |
| **Brick Duplication** | React state updates causing the component to unmount/remount unnecessarily. | Wrapped configuration objects in `useMemo` to maintain referential identity. |
| **Initialization Race** | Trying to render `<Payment>` before `initMercadoPago` ran. | Added `isMercadoPagoInitialized` state flag to conditionally render the component. |
| **Styling Consistency** | The iframe-based Brick didn't match the store theme. | Injected `customVariables` into the Brick configuration to set `baseColor`, backgrounds, and borders. |
| **"Invalid Hooks" Error** | Conditional hooks inside loops/logic. | Refactored all Hooks (`useEffect`, `useMemo`) to the top level, ensuring they always run in the same order. |

## 4. Final Result

The Checkout page now features a **hybrid** system:
- **Money/Cash**: Simple, instant confirmation.
- **Online (Pix/Card)**: A fully integrated, secure, and branded payment form that feels native to the application.

> [!NOTE]
> The backend handles the actual transaction safety, while the frontend ensures a smooth UX.
