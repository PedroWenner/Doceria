# Implementação 15: Gestão de Pedidos (Kanban)

## Visão Geral
Implementamos um sistema visual de gestão de pedidos (Kanban Board) para facilitar o fluxo de produção na cozinha/delivery.

## Backend
### Estrutura de Dados
- **Tabela `orders`**: `user_id`, `status` (enum), `total_amount`, `payment_method`.
- **Tabela `order_items`**: `order_id`, `product_id`, `quantity`, `unit_price`.
- **Seeders**: Criados 15 pedidos aleatórios com produtos reais do banco para testes.

### API
- `GET /api/orders`: Retorna todos os pedidos com seus itens.
- `PATCH /api/orders/{id}/status`: Atualiza o status do pedido (pending -> preparing -> ready -> delivered).

## Frontend
### Página: `/dashboard/orders`
- **Biblioteca**: `@dnd-kit` para Drag & Drop acessível e leve.
- **Colunas**:
    1.  **Pendente** (Amarelo): Novos pedidos.
    2.  **Em Preparo** (Azul): Sendo feitos na cozinha.
    3.  **Pronto** (Verde): Aguardando retirada/entrega.
    4.  **Entregue** (Cinza): Finalizados.

### Componentes
- `KanbanColumn`: Container vertical de cada status.
- `OrderCard`: Card arrastável com ID, Cliente, Itens e Total.

**Funcionalidades:**
- Arrastar e soltar cards entre colunas atualiza o status na API.
- Update otimista (interface atualiza antes da resposta da API).
- Rollback automático em caso de erro na API.
