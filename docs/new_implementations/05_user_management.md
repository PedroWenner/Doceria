# Implementação 05: Gestão de Usuários e Permissões (UI)

## Visão Geral
Esta implementação introduz uma interface administrativa completa para gerenciamento de usuários e seus papéis (roles). Isso permite que administradores promovam usuários (ex: de Cliente para Gerente/Admin) diretamente pelo painel, sem necessidade de acesso direto ao banco de dados.

---

## 1. Backend (Laravel)

### Controlador (`UserController`)
Localizado em `app/Http/Controllers/UserController.php`.
- **`index()`**: Retorna uma lista paginada de usuários, incluindo seus relacionamentos com `roles`.
- **`roles()`**: Retorna a lista de todos os papéis disponíveis no sistema (para preencher o select/modal).
- **`updateRoles(Request $request, User $user)`**:
    - Recebe um array de `slugs` de papéis.
    - Sincroniza (`sync`) os papéis do usuário especificado.
    - Valida se os papéis existem antes de aplicar.

### Rotas da API (`routes/api.php`)
Adicionado um grupo de rotas protegido pelos middlewares `api`, `auth:api` e **`role:admin`**. Apenas administradores podem acessar.

- `GET /api/users`: Lista usuários.
- `GET /api/roles`: Lista papéis disponíveis.
- `PUT /api/users/{id}/roles`: Atualiza os papéis de um usuário.

---

## 2. Frontend (Next.js)

### Página de Usuários (`app/dashboard/users/page.tsx`)
Uma nova rota `/dashboard/users` foi criada contendo:

1.  **Listagem**: Tabela exibindo Nome, Email e Badges com os papéis atuais do usuário.
2.  **Edição Interativa**:
    - Botão "Edit Roles" abre um Modal.
    - O Modal lista todos os papéis disponíveis como Checkboxes.
    - Ao salvar, envia uma requisição `PUT` para a API.
    - A lista é atualizada automaticamente após o sucesso.

### Integração
- Utiliza o token JWT armazenado nos cookies para autenticar as requisições.
- Exibe estados de carregamento (`Loading...`) e salvamento (`Saving...`) para melhor UX.

---

## Como Testar

1.  **Acesso**:
    - Logue com um usuário **Admin** (ex: `admin@sweetstore.com`).
    - Navegue até `/dashboard/users` pela Sidebar.

2.  **Fluxo de Edição**:
    - Escolha um usuário da lista (ex: um Cliente comum).
    - Clique em **Edit Roles**.
    - Marque a opção **Manager** e desmarque **Customer**.
    - Clique em **Save Changes**.

3.  **Verificação**:
    - O usuário deve aparecer na tabela agora com a badge `Manager`.
    - (Opcional) Faça logout e logue com esse usuário modificado para confirmar que ele tem as permissões de Gerente.
