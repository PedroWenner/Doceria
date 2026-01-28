# Implementação 13: Auditoria e Exclusão Lógica

## Visão Geral
Implementamos dois mecanismos de segurança e rastreabilidade:
1.  **Exclusão Lógica (Soft Deletes)**: Dados nunca são apagados permanentemente do banco, apenas marcados como invisíveis (`deleted_at`).
2.  **Auditoria (Audit Logs)**: Registro detalhado de quem criou, editou ou excluiu registros (`audits` table).

## Soft Deletes
Aplicado nas tabelas:
- [x] `users`
- [x] `products`
- [x] `categories`

**Como funciona:**
- Ao deletar (ex: `$product->delete()`), o Laravel preenche a coluna `deleted_at` com a data atual.
- Consultas padrão (`Product::all()`) ignoram esses registros automaticamente.
- Para ver deletados: `Product::withTrashed()->get()`.
- Para restaurar: `$product->restore()`.

## Auditoria (Logs)
Pacote: `owen-it/laravel-auditing`
Aplicado nos Models: `User`, `Product`, `Category`.

**O que é gravado (Tabela `audits`):**
- `user_type` / `user_id`: Quem fez a ação.
- `event`: `created`, `updated`, `deleted`, `restored`.
- `old_values`: JSON com os dados ANTES da mudança.
- `new_values`: JSON com os dados DEPOIS da mudança.
- `url`, `ip_address`, `user_agent`: Metadados da requisição.

**Exemplo de Uso no Backend:**
```php
$history = $product->audits; // Retorna todo histórico de mudanças
$lastChange = $product->audits()->latest()->first();
```

## Próximos Passos (Sugestão)
- Criar uma página `/dashboard/audit` para visualizar esses logs no frontend.
- Implementar "Lixeira" para visualizar e restaurar itens excluídos.

## Backend API
**Endpoint:** `GET /api/audits`
**Controller:** `AuditController`
**Filtros Suportados:**
- `user_id`: ID do usuário.
- `event`: `created`, `updated`, `deleted`, `restored`.
- `date_from` / `date_to`: Intervalo de datas.

## Frontend: Visualizador de Logs
**Rota:** `/dashboard/audit`
**Componente:** `AuditPage`

**Funcionalidades:**
- **Filtros Avançados**: Dropdowns para Usuário e Evento, Inputs de Data.
- **Tabela Interativa**:
    - Badges coloridos para tipos de evento.
    - Expansão de linha para ver detalhes (Diff JSON).
- **UX**:
    - Spinner de carregamento centralizado.
    - Paginação e Empty States.

