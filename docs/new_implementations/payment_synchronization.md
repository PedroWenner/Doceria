# Sincronização de Pagamentos (Mercado Pago)

**Data:** 03/02/2026
**feature:** Payment Sync

## Visão Geral
Este documento descreve a implementação do fluxo de sincronização de status de pagamentos utilizando o Mercado Pago. O sistema utiliza uma abordagem híbrida de **Webhooks** (para robustez e atualizações assíncronas) e **Redirect com Verificação** (para feedback imediato ao usuário).

---

## Fluxo de Dados

1.  **Checkout:** O usuário finaliza o pedido e é redirecionado para o Mercado Pago.
2.  **Pagamento:** O usuário realiza o pagamento (Cartão, Pix, Boleto).
3.  **Retorno (Redirect):** O Mercado Pago redireciona o usuário de volta para:
    *   `https://nosso-app.com/checkout/status?payment_id=...&external_reference=ORDER_ID`
4.  **Verificação Frontend:** A página de status chama `POST /api/orders/{id}/verify-payment` para forçar uma consulta ao status real.
5.  **Webhook (Async):** Paralelamente, o Mercado Pago envia um POST para:
    *   `https://nosso-app.com/api/webhooks/mercadopago`
    *   O Backend recebe, valida e atualiza o status do pedido no banco de dados.

---

## Estrutura Técnica

### Backend (Laravel)

#### 1. Rota de Webhook
*   **Arquivo:** `routes/api.php`
*   **Endpoint:** `POST /webhooks/mercadopago` (Público)
*   **Controller:** `WebhookController@handleMercadoPago`
*   **Lógica:**
    *   Recebe notificação `payment.updated`.
    *   Busca credenciais do Mercado Pago (via `PaymentGatewaySetting` Global).
    *   Consulta API do Mercado Pago (`GET /v1/payments/{id}`).
    *   Atualiza `order.status` (`paid`, `failed`, `pending`).

#### 2. Serviço de Pagamento
*   **Arquivo:** `App\Services\Payments\MercadoPagoService`
*   **Método Novo:** `getPaymentStatus($paymentId, $settings)`
*   **Função:** Abstrai a chamada HTTP para a API do Mercado Pago.

### Frontend (Next.js)

#### 1. Página de Status
*   **Arquivo:** `app/(store)/checkout/status/page.tsx`
*   **Função:** Tela de pouso após o pagamento.
*   **Lógica:**
    *   Captura `payment_id` e `external_reference` da URL.
    *   Exibe Loader enquanto verifica.
    *   Chama endpoint de verificação.
    *   Exibe sucesso (Verde/Confetti) ou erro (Vermelho/Tentar Novamente).

---

## Como Configurar (Ambiente de Desenvolvimento)

Como o Mercado Pago não acessa `localhost`, é necessário usar um túnel.

1.  Instale o Ngrok (ou similar).
2.  Inicie o túnel:
    ```bash
    ngrok http 8000
    ```
3.  Copie a URL HTTPS gerada (ex: `https://abcd-123.ngrok-free.app`).
4.  No Painel do Mercado Pago (Seu App > Webhooks):
    *   **URL de Produção:** `https://abcd-123.ngrok-free.app/api/webhooks/mercadopago`
    *   **Eventos:** Marque `Pagamentos`.

---

## Estados de Pedido Mapeados

| Status Mercado Pago | Status Sistema (`orders.status`) |
| :--- | :--- |
| `approved` | `paid` |
| `authorized` | `paid` |
| `pending` | `pending` |
| `in_process` | `pending` |
| `rejected` | `failed` |
| `cancelled` | `failed` |
| `refunded` | `canceled` |
