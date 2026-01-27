# Implementação 03: Autenticação JWT e Proteção de Rotas

## Visão Geral
Esta implementação substituiu o mecanismo de autenticação padrão (Sanctum) pelo padrão **JWT (JSON Web Token)** utilizando a biblioteca `php-open-source-saver/jwt-auth`. No frontend, foi implementado um **Middleware** no Next.js para proteger as rotas do painel (`/dashboard`), redirecionando usuários não autenticados para o login.

---

## 1. Backend (Laravel)

### Biblioteca Instalada
- **Pacote**: `php-open-source-saver/jwt-auth` (Versão compatível com PHP 8.1).
- **Finalidade**: Gerar e validar tokens JWT stateless.

### Configurações Realizadas
1.  **`config/auth.php`**:
    - Guard `api` alterado para usar o driver `jwt`.
    ```php
    'guards' => [
        'api' => [
            'driver' => 'jwt',
            'provider' => 'users',
        ],
    ],
    ```
2.  **`app/Models/User.php`**:
    - Implementa a interface `JWTSubject`.
    - Adicionados métodos obrigatórios: `getJWTIdentifier()` e `getJWTCustomClaims()`.

### AuthController (`app/Http/Controllers/AuthController.php`)
O controller foi reescrito para utilizar o guard `auth('api')`.

- **POST `/api/auth/login`**: Recebe credenciais, retorna JSON com `access_token` e `user`.
- **POST `/api/auth/me`**: Retorna dados do usuário logado (requer token).
- **POST `/api/auth/logout`**: Invalida o token atual.
- **POST `/api/auth/refresh`**: Renova o token.

---

## 2. Frontend (Next.js)

### Gerenciamento de Estado
- **Biblioteca**: `js-cookie` para manipulação de Cookies no lado do cliente.
- **Fluxo de Login** (`app/login/page.tsx`):
    1.  Envia credenciais para o backend.
    2.  Ao receber sucesso, salva o token no Cookie `auth_token` (validade de 1 dia).
    3.  Redireciona para `/dashboard`.

### Middleware de Proteção (`middleware.ts`)
Arquivo criado na raiz do `frontend` para interceptar requisições.

- **Regras**:
    1.  **Acesso a `/dashboard` sem token**: Redireciona para `/login`.
    2.  **Acesso à raiz `/`**: Redireciona para `/dashboard` (que por sua vez verifica o token).
    3.  **Acesso a `/login` já tendo token**: Redireciona para `/dashboard`.
- **Matcher**: Aplica-se a `/`, `/login` e `/dashboard/:path*`.

---

## Como Testar

1.  **Iniciar Backend**:
    ```bash
    cd backend
    php artisan serve
    ```

2.  **Iniciar Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```

3.  **Fluxo de Teste**:
    - Tente acessar `http://localhost:3000/dashboard` -> Deve ser redirecionado para `/login`.
    - Faça login com `admin@sweetstore.com` / `password`.
    - Deve ser redirecionado para `/dashboard`.
    - O cookie `auth_token` deve estar visível no Inspecionar -> Aplicação -> Cookies.
