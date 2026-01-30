'use client';

// DEPRECATED: This context is no longer used. 
// See AdminAuthContext.tsx and StoreAuthContext.tsx for specific implementations.

import React, { createContext, useContext } from 'react';

const AuthContext = createContext<any>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export const useAuth = () => {
    throw new Error('useAuth is deprecated. Use useAdminAuth or useStoreAuth instead.');
};
