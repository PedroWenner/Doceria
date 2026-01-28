# 21. Timer de Sessão no Sidebar

## Objetivo
Exibir um contador regressivo no Sidebar (Sidebar) mostrando quanto tempo resta para o token de autenticação expirar. Isso dá visibilidade ao parâmetro `auth_token_expiration` configurado anteriormente.

## Estratégia Técnica
Para garantir que o timer sobreviva a recarregamentos de página (F5) sem depender de estado volátil, vamos extrair a data de expiração diretamente do **Token JWT** armazenado nos cookies.

### 1. Utilitário JWT (`app/utils/jwt.ts`)
- Criar função `getPayload(token)` para decodificar o base64 do JWT (sem precisar de bibliotecas pesadas).
- Criar função `getTokenExpiration(token)` que retorna o timestamp d expiração (`exp`).

### 2. Componente `SessionTimer` (`app/components/SessionTimer.tsx`)
- **Visual**: Reutilizar o design circular do `OrdersPage` (SVG), mas adaptado para o Sidebar (menor, cores invertidas ou neutras).
- **Lógica**:
    - Ler o token do cookie.
    - Calcular `timeLeft = exp - now`.
    - Atualizar a cada segundo.
    - Se acabar, chamar `logout()`.
- **Traduções**: `sidebar.session_expires` ("Sessão expira em").

### 3. Integração (`DashboardLayout.tsx`)
- Adicionar o componente `SessionTimer` no rodapé da Sidebar, acima do botão de Logout ou junto com as informações do usuário.

## Passos
1. [ ] Criar `frontend/app/utils/jwt.ts`.
2. [ ] Atualizar `translations.ts`.
3. [ ] Criar componente `SessionTimer.tsx`.
4. [ ] Adicionar `SessionTimer` em `DashboardLayout.tsx`.
