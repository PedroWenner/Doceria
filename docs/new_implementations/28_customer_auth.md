# 28. Customer Auth & Refactor

## Objetivo
Separar o login de Clientes (Store) do login de Admin (Dashboard) e corrigir os redirects.

## Arquivos Envolvidos
1.  [MODIFY] `frontend/app/context/AuthContext.tsx`
    *   Adicionar parâmetro `redirectPath?: string` na função `login`.
    *   Lógica inteligente de redirect baseada em Role.
2.  [NEW] `frontend/app/(store)/signin/page.tsx`
    *   Login estilo "Amazon/Loja".
    *   Link para Register.
3.  [NEW] `frontend/app/(store)/signup/page.tsx`
    *   Registro de novos clientes.

## Lógica AuthContext
```typescript
const login = (token: string, userData: User, redirectPath?: string) => {
    Cookies.set('auth_token', token, { expires: 7 });
    setUser(userData);
    
    if (redirectPath) {
        router.push(redirectPath);
    } else if (userData.role === 'customer') {
        router.push('/');
    } else {
        router.push('/dashboard');
    }
};
```
