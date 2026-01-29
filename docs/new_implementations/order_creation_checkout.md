# Fluxo de Criação de Pedidos (Checkout)

Esta documentação detalha a implementação do fluxo de finalização de compra e criação de pedidos no sistema SweetStore.

## 1. Visão Geral

O recurso permite que usuários autenticados (clientes) transformem os itens de sua cesta (Cart) em um pedido persistido no banco de dados (`orders` e `order_items`).

## 2. Backend (API)

### Rota
`POST /api/orders`

### Autenticação
Requer token Bearer (Middleware `auth:api`). Acessível por clientes e administradores.

### Payload (Request Body)
A API espera um JSON com a seguinte estrutura:

```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 10.50
    }
  ],
  "total_amount": 21.00,
  "payment_method": "pix", // 'pix' ou 'money'
  "delivery_type": "pickup", // 'pickup' (fixo por enquanto)
  "delivery_address": null, // Futuramente para delivery
  "notes": "{\"change_for\":\"50.00\",\"pickup_info\":\"...\"}" // JSON string com metadados extras
}
```

### Lógica do Controller (`OrderController@store`)
1.  **Validação**: Confirma se itens existem, se produtos são válidos e se campos obrigatórios estão presentes.
2.  **Transação (Database Transaction)**:
    *   Cria o registro principal na tabela `orders`.
    *   Itera sobre `items` e cria registros na tabela `order_items`.
    *   Se qualquer etapa falhar, nada é salvo (rollback).
3.  **Resposta**: Retorna o objeto `Order` criado com status `201 Created` e carrega os relacionamentos (`items.product`).

## 3. Frontend (CheckoutPage)

O componente `CheckoutPage` (`app/(store)/checkout/page.tsx`) é responsável por:

1.  **Coleta de Dados**: Captura método de pagamento (Pix/Dinheiro) e informações de troco.
2.  **Cálculos de Preço**: Aplica regras de negócio no frontend (ex: Desconto de 5% no Pix) antes de enviar o `total_amount`.
    *   *Nota: Idealmente o backend deve recalcular isso para segurança, mas enviado pelo front por decisão de arquitetura atual.*
3.  **Montagem do Payload**: A função `handleFinishOrder` formata os dados da `CartContext` para a estrutura exigida pela API.
4.  **Feedback**:
    *   **Sucesso**: Limpa o carrinho (`clearCart()`) e redireciona para `/orders/my`.
    *   **Erro**: Exibe toast com mensagem de erro retornada pela API.

## 4. Estrutura de Banco de Dados

### Tabela `orders`
*   `id`: Primary Key
*   `user_id`: FK para usuário logado
*   `status`: 'pending', 'preparing', 'ready', 'delivered'
*   `payment_method`: enum/string
*   `notes`: JSON (metadados flexíveis)

### Tabela `order_items`
*   `id`: Primary Key
*   `order_id`: FK para orders
*   `product_id`: FK para products
*   `quantity`: int
*   `unit_price`: decimal

---

**Autor**: Equipe de Desenvolvimento (Antigravity)
**Data**: 29/01/2026
