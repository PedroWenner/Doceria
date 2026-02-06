# Implementação: Módulo Financeiro (Saídas)

## Visão Geral
Este documento detalha a implementação do módulo de **Saídas Financeiras** (Despesas), que permite o rastreamento de custos operacionais da loja, categorização de gastos e controle de pagamentos (pago/pendente).

---

## 1. Banco de Dados

Foram criadas duas novas tabelas para suportar o módulo:

### Tabela: `expense_categories`
| Colunay | Tipo | Detalhes |
|---|---|---|
| `id` | BIGINT | PK, Auto Increment |
| `name` | STRING | Nome da categoria (ex: Fornecedores, Aluguel) |
| `description` | TEXT | Opcional |
| `color` | STRING | Hex Color (ex: #FF0000) |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft Deletes |

### Tabela: `expenses`
| Coluna | Tipo | Detalhes |
|---|---|---|
| `id` | BIGINT | PK, Auto Increment |
| `description` | STRING | Descrição da despesa (ex: Conta de Luz) |
| `amount` | DECIMAL(10,2) | Valor monetário |
| `date` | DATE | Data de competência |
| `category_id` | BIGINT | FK -> expense_categories(id) |
| `user_id` | BIGINT | FK -> users(id), Nullable |
| `payment_method` | STRING | enum: money, pix, card, transfer, boleto |
| `status` | STRING | enum: paid, pending |
| `due_date` | DATE | Data de Vencimento (Opcional) |
| `paid_at` | DATETIME | Data do Pagamento (Opcional) |
| `notes` | TEXT | Observações |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP | Soft Deletes |

---

## 2. Backend (Laravel)

### Models
- **`ExpenseCategory`**: Com relacionamento `hasMany(Expense::class)`.
- **`Expense`**: Com relacionamentos `belongsTo(ExpenseCategory::class)` e `belongsTo(User::class)`. Implementa `SoftDeletes`.

### Controllers
- **`ExpenseCategoryController`**: CRUD completo.
    - `index`: Lista todas.
    - `store`: Cria nova.
    - `update`: Atualiza existente.
    - `destroy`: Soft delete (valida se não há despesas vinculadas antes de excluir, opcionalmente).
- **`ExpenseController`**: CRUD com filtros.
    - `index`: Suporta filtros por `search`, `category_id`, `status` e `date_range`.
    - `store/update`: Validação rigorosa de tipos e FKs.
    - `destroy`: Soft delete.

### Rotas API
Grupo `admin` middleware:
```php
Route::apiResource('expense-categories', ExpenseCategoryController::class);
Route::apiResource('expenses', ExpenseController::class);
```

---

## 3. Frontend (Next.js)

### Novas Páginas
- **`dashboard/financial/categories/page.tsx`**: Gerenciamento de categorias.
- **`dashboard/financial/expenses/page.tsx`**: Listagem e gestão de despesas.

### Componentes
- **`CategoryModal`**: Modal para criar/editar categorias com picker de cor.
- **`ExpenseTable`**: Tabela com filtros, ordenação e ações rápidas.
- **`ExpenseModal`**: Modal para lançar despesas, com seleção dinâmica de categorias.

### Internacionalização (i18n)
Adicionado suporte completo PT/EN em `translations.ts`:
- Chave: `financial.*` contendo labels, status, placeholders e mensagens de erro.
- Atualização do `Sidebar.tsx` para incluir os novos itens de menu.

---

## 4. Próximos Passos
- Integração de Dashboard Financeiro (Gráficos).
- Relatórios de DRE (Demonstrativo do Resultado do Exercício).
- Exportação PDF/Excel.
