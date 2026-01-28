# 20. Expiração de Token Dinâmica

## Objetivo
Permitir que o administrador do sistema configure o tempo de expiração do token de autenticação (JWT) via interface, sem necessidade de alterar variáveis de ambiente ou reiniciar o servidor.

## Mudanças Propostas

### 1. Banco de Dados
- **Tabela**: `company_settings`
- **Nova Coluna**: `auth_token_expiration` (integer, nullable, default: 60)
    - Representa o tempo em **minutos**.

### 2. Backend (Laravel)
- **Model**: `CompanySetting`
    - Adicionar `auth_token_expiration` ao `$fillable`.
- **Controller**: `AuthController`
    - No método `login` e `refresh`, buscar o valor no banco de dados.
    - Usar `auth('api')->factory()->setTTL($minutes)` antes de gerar o token.

### 3. Frontend (Next.js)
- **Tela**: `SettingsPage` (Aba Sistema)
    - Adicionar input para "Tempo de Expiração do Token (minutos)".
- **Traduções**:
    - Adicionar chaves em `translations.ts` para o novo campo.

## Plano de Execução

1. [ ] Criar migration para adicionar coluna `auth_token_expiration`.
2. [ ] Atualizar Model `CompanySetting`.
3. [ ] Atualizar `AuthController` para usar TTL dinâmico.
4. [ ] Atualizar `translations.ts` com novos textos.
5. [ ] Atualizar `SettingsPage.tsx` com o novo campo.
6. [ ] Validar fluxo de login e verificação do `exp` no token.
