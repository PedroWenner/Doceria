# 31. Melhorias na Gestão de Usuários (User Management Enhancements)

## 1. Visão Geral
Este documento detalha as melhorias implementadas no módulo de gestão de usuários (`/dashboard/users`), focando na administração completa do ciclo de vida dos usuários (criação, edição, troca de senha e exclusão lógica), além de melhorias de interface e segurança.

## 2. Funcionalidades Implementadas

### 2.1 Gestão de Status (Ativo/Inativo)
- **Objetivo**: Permitir que administradores desativem o acesso de um usuário sem excluí-lo do sistema.
- **Funcionamento**:
    - Adicionado campo `is_active` (boolean) na tabela `users`.
    - Interface visual na lista de usuários (badges verde/cinza).
    - Toggle switch nos modais de criação e edição.

### 2.2 Restrição de Login
- **Segurança**: Apenas usuários com `is_active = true` podem realizar login.
- **Feedback**: Tentativas de login por usuários inativos retornam a mensagem "Somente usuários ativos podem logar." e invalidam o token imediatamente.

### 2.3 Troca de Senha (Password Reset)
- **Decisão de UX**: Separar a troca de senha da edição de perfil para evitar edições acidentais e melhorar a segurança.
- **Implementação**:
    - Novo modal `PasswordModal` acionado pelo ícone de chave.
    - Nova rota de API `PUT /api/users/{id}/password`.
    - **Novidade**: Adicionado toggle ("olhinho") para visualizar a senha digitada antes de salvar, prevenindo erros de digitação.

### 2.4 Exclusão Lógica (Soft Deletes)
- **Decisão de Arquitetura**: Manter histórico de dados. Usuários não são removidos fisicamente do banco.
- **Técnica**: Uso do trait `SoftDeletes` do Laravel.
- **Segurança**: Modal de confirmação `DeleteConfirmationModal` exige ação explícita do administrador.

### 2.5 Edição de Usuário
- **Reutilização**: O mesmo `UserModal` usado na criação foi adaptado para edição.
- **Capacidades**: Atualização de Nome, E-mail, Cargo (Role) e Status.

## 3. Detalhes Técnicos

### Backend (Laravel)
- **Rotas (`api.php`)**:
    - `PUT /users/{id}`: Atualização de dados cadastrais.
    - `PUT /users/{id}/password`: Atualização exclusiva de senha.
    - `DELETE /users/{id}`: Soft delete.
- **Controller (`UserController`)**:
    - Importação do facade `Hash` corrigida.
    - Tratamento correto de respostas JSON padronizadas via trait `ApiResponse`.
- **Prevenção de Erros**:
    - Ajuste no `AppServiceProvider` desativando `Scramble` temporariamente para limpeza de logs.

### Frontend (Next.js)
- **Componentes Novos/Refatorados**:
    - `PasswordModal.tsx`: Gerenciamento de estado local para senhas e visibilidade.
    - `UserModal.tsx`: Adicionado suporte a edição e toggle de senha.
    - `DeleteConfirmationModal.tsx`: Componente genérico reutilizável.
- **Internacionalização (`translations.ts`)**:
    - Adicionadas chaves para mensagens de sucesso, erro e títulos de confirmação (`delete_confirm_title`, `delete_confirm_message`, etc).

## 4. Guia de Uso

1.  **Alterar Status**: Na listagem, clique no lápis (Editar) e use o switch "Ativo/Inativo".
2.  **Trocar Senha**: Clique no ícone de chave. Digite a nova senha e use o ícone de olho para conferir. Clique em Salvar.
3.  **Excluir Usuário**: Clique no ícone de lixeira. Confirme a ação no modal vermelho. O usuário sumirá da lista, mas permanecerá no banco com `deleted_at` preenchido.

---

**Autor**: Equipe de Desenvolvimento (Antigravity)
**Data**: 06/02/2026
