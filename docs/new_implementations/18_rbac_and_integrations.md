# 18. Controle de Acesso e Integrações Externas

## 1. Integrações de Dados (BrasilAPI e ViaCEP)
Para agilizar o cadastro de parâmetros da empresa, integramos serviços externos.

### Busca de CEP
- **Serviço**: `cepService`
- **API**: ViaCEP
- **Funcionamento**: Ao digitar o CEP na tela de configurações, o sistema preenche automaticamente Rua, Bairro, Cidade e Estado.
- **UX**: Campos de endereço ficam bloqueados (`disabled`) durante a consulta para evitar conflitos.

### Busca de CNPJ
- **Serviço**: `cnpjService`
- **API**: BrasilAPI
- **Funcionamento**: Consulta dados da Receita Federal pelo CNPJ.
- **Dados recuperados**: Razão Social (como Nome do Sistema), Endereço completo.
- **UX**: Feedback visual (`LoadingSpinner`) e bloqueio de inputs.

## 2. Controle de Acesso (RBAC) aprimorado
O sistema agora possui níveis de permissão rígidos no Frontend e Backend.

### Pefis Definidos (Tabela `users.role`)
1.  **Admin** (`admin`): Acesso total.
2.  **Gerente** (`manager`):
    -   Acesso: Dashboard, Pedidos, Produtos, Usuários.
    -   **Restrições**: Sem acesso a Auditoria e Configurações (Parâmetros).
3.  **Cliente** (`customer`):
    -   **Backoffice Bloqueado**: Não tem permissão para logar no painel administrativo (`/dashboard`).
    -   Deve utilizar o aplicativo de pedidos (futuro app).

### Implementação Técnica
- **AuthContext**: Gerenciador global de estado.
    -   Verifica token e papel do usuário (`role`).
    -   Redireciona para login se não autenticado.
    -   Exibe `LoadingSpinner` durante a verificação inicial para evitar "flicks" na tela.
- **DashboardLayout**: Filtragem dinâmica do menu lateral baseada no array de permissões:
    ```typescript
    { label: 'sidebar.audit', roles: ['admin'] } // Apenas admin vê
    ```

## 3. Melhorias na Autenticação (Login)
- **Feedback Visual**: Implementação de `react-hot-toast` para erros de login (senha incorreta, usuário bloqueado).
- **Redirecionamento Inteligente**: Uso de `router.push('/dashboard')` apenas após confirmação de sucesso e gravação do token.
