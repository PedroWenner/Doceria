# Implementação 16: Logística de Entrega e Endereços

## Visão Geral
Adicionamos suporte a fluxo de entrega e retirada, com captura de endereços e interceptação de ações no Kanban.

## Backend
### Novos Models
- **`CustomerAddress`**: Tabela para salvar múltiplos endereços do usuário (Casa, Trabalho, etc).
- **Updates em `Order`**:
    - `delivery_type`: `pickup` ou `delivery`.
    - `delivery_address`: Snapshot JSON do endereço no momento do pedido.
    - `customer_phone`: Telefone salvo no pedido.
    - `courier_name`: Nome do entregador responsável.

### API
- `PUT /api/orders/{id}/status`: Agora aceita `courier_name` opcionalmente.

## Frontend
### Modal de Despacho (`OrderDispatchModal`)
Intercepta a ação de "Arrastar e Soltar" no Kanban em casos específicos:

1.  **Retirada (Pickup) -> Pronto**:
    - Exibe modal com detalhes do cliente.
    - Botão "Enviar WhatsApp" gera link direto com mensagem: "Seu pedido está pronto!".

2.  **Entrega (Delivery) -> Entregue (Delivered)**:
    - Exibe modal com endereço de entrega.
    - Exige o preenchimento do **Nome do Entregador** para finalizar.

**Fluxo:**
- O Kanban só atualiza visualmente e chama a API **após** a confirmação no Modal.
- Se o usuário cancelar o Modal, o card volta para a coluna original.
