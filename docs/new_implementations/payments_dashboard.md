# Dashboard de Pagamentos (Pro Max)

**Data:** 04/02/2026
**Feature:** Payments Dashboard & Architecture

## Visão Geral
Implementação completa da nova arquitetura de pagamentos (desacoplada de pedidos) e do dashboard administrativo financeiro. A feature permite gestão centralizada de receitas, lançamentos manuais (caixa físico) e filtros avançados.

---

## Mudanças no Banco de Dados

### 1. Nova Tabela `payments`
Criada para armazenar transações financeiras independentes.
*   `id`: PK
*   `order_id`: FK (Nullable) - Permite pagamentos avulsos.
*   `external_id`: String (Nullable) - ID do Gateway (Mercado Pago).
*   `method`: String (pix, credit_card, cash).
*   `status`: String (paid, pending, failed).
*   `amount`: Decimal (10,2).
*   `metadata`: JSON - Detalhes técnicos do gateway.
*   **Migração:** `2026_02_04_214640_create_payments_table.php`

### 2. Atualização Models
*   **Order:** Adicionado relacionamento `hasMany` com `Payment`.
*   **Payment:** Novo Model com casts para `amount` (decimal) e `metadata` (array).

---

## Backend (Laravel)

### `PaymentController`
*   **`index` (Dashboard):** Endpoint para listar pagamentos com paginação e filtros dinâmicos (`search`, `status`, `method`, `date`).
*   **`store` (Manual):** Endpoint para criar pagamentos manuais (Ex: Dinheiro em caixa). Atualiza ou cria a entrada na tabela `payments` e, se vinculado a um pedido, baixa o pedido.
*   **`payOrder` (Checkout):** Endpoint legado (renomeado de `store`) para processar pagamentos de checkout do cliente via Mercado Pago.

### `WebhookController`
*   Refatorado para salvar/atualizar sempre na tabela `payments` primeiro.
*   Atualiza o status do pedido (`orders.payment_status` e `orders.status`) apenas como consequência da atualização do pagamento.

---

## Frontend (Next.js)

### Nova Rota: `/dashboard/payments`
Dashboard financeiro "Pro Max" com as seguintes funcionalidades:

#### 1. Componentes
*   `PaymentTable`: Tabela responsiva com badges de status coloridas e formatação de moeda.
*   `PaymentFilterBar`: Barra de ferramentas com busca (debounce), filtros de dropdown e botão de ação.
*   `NewPaymentModal`: Modal para lançamentos manuais com validação.

#### 2. Funcionalidades de UX
*   **Filtro Inteligente:** Busca por ID do pedido, ID externo ou ID do pagamento.
*   **Quick Actions:** Modal permite registrar pagamentos em dinheiro ou maquininha externa e já vincular e baixar um pedido existente automaticamente.
*   **Feedback:** Toasts de sucesso/erro e estados de loading (skeleton) na tabela.

---

## APIs Criadas/Alteradas

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/payments` | Lista pagamentos (Admin apenas) |
| `POST` | `/api/payments` | Cria pagamento manual (Admin apenas) |
| `POST` | `/api/orders/{id}/pay` | Processa checkout do cliente (Mercado Pago) |
| `POST` | `/api/webhooks/mercadopago` | Webhook para atualização automática |

---

## Fluxo de Uso (Pagamento Manual)
1.  Admin acessa `/dashboard/payments`.
2.  Clica em **"Novo Pagamento"**.
3.  Preenche: `Valor R$ 50,00`, `Método: Dinheiro`, `Status: Pago`, `Pedido ID: 105`.
4.  Sistema cria registro em `payments`.
5.  Sistema detecta vínculo com Order #105 e atualiza status do pedido para `Pago`.
