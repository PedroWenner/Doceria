# Separação de Status de Pedido e Pagamento

**Data:** 04/02/2026
**feature:** Status Decoupling

## Visão Geral
Este documento descreve a refatoração arquitetural para desacoplar o status logístico (Cozinha/Entrega) do status financeiro. Anteriormente, um único campo `status` gerenciava ambos, causando conflitos (ex: "Em Preparo" vs "Pago"). Agora, existem dois campos distintos.

---

## Mudanças no Banco de Dados

### Tabela `orders`
Foi adicionada uma nova coluna para controlar exclusivamente o financeiro:

*   **Coluna:** `payment_status`
*   **Tipo:** `ENUM`
*   **Valores Aceitos:** `'pending'`, `'paid'`, `'failed'`, `'canceled'`, `'refunded'`
*   **Default:** `'pending'`

---

## Fluxo de Dados Atualizado

1.  **Criação do Pedido:**
    *   `status` = `pending` (Aguardando ação da loja)
    *   `payment_status` = `pending` (Aguardando pagamento)

2.  **Pagamento Aprovado (Webhooks/Checkout):**
    *   Atualiza APENAS `payment_status` para `paid`.
    *   O `status` logístico permanece inalterado (ou pode avançar se houver automação, mas são independentes).

3.  **Processo na Cozinha:**
    *   Loja altera `status` para `preparing` -> `ready` -> `delivered`.
    *   `payment_status` permanece `paid`.

---

## Estrutura Técnica

### Backend (Laravel)

#### 1. Migração
*   **Arquivo:** `database/migrations/2026_02_04_190754_add_payment_status_to_orders_table.php`

#### 2. Models & Controllers
*   **Model `Order`:** Adicionado `payment_status` ao `$fillable`.
*   **`OrderController`:**
    *   `verifyPayment`: Agora atualiza `$order->payment_status`.
    *   `updateStatus`: Foca apenas no `$order->status` (logístico).

### Frontend (Next.js)

#### 1. Tipagem
*   **Interface `Order`:** Adicionado campo `payment_status`.

#### 2. Componentes Visuais
*   **Adiministração (`OrderCard`):** Exibe etiqueta de pagamento separada.
*   **Cliente (`MyOrdersPage`):** Mostra dois badges distintos (ex: "👨‍🍳 Em Preparo" e "💰 Pago").
*   **Traduções (`translations.ts`):** Adicionadas chaves em `orders.payment_status` para PT/EN.

---

## Estados Mapeados

### Logístico (`status`)
| Servidor | Visual (PT) | Visual (EN) |
| :--- | :--- | :--- |
| `pending` | 🕒 Pendente | 🕒 Pending |
| `preparing` | 👨‍🍳 Em Preparo | 👨‍🍳 Preparing |
| `ready` | ✨ Pronto | ✨ Ready |
| `delivered` | 🏁 Entregue | 🏁 Delivered |
| `canceled` | ❌ Cancelado | ❌ Canceled |

### Financeiro (`payment_status`)
| Servidor | Visual (PT) | Visual (EN) |
| :--- | :--- | :--- |
| `pending` | 🕒 Pendente | 🕒 Pending |
| `paid` | 💰 Pago | 💰 Paid |
| `failed` | ⚠️ Falhou | ⚠️ Failed |
| `refunded` | ↩️ Estornado | ↩️ Refunded |
