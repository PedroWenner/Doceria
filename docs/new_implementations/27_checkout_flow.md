# 27. Checkout Flow Implementation

## Objetivo
Criar o fluxo de finalização de compra, exigindo autenticação do usuário.

## Etapas
1.  **Cart Page**:
    *   Ao clicar em "Ir para pagamento", verificar `useAuth`.
    *   Se !user -> `router.push('/login?returnUrl=/checkout')`.
    *   Se user -> `router.push('/checkout')`.

2.  **Checkout Page**:
    *   Exibir Itens.
    *   Exibir "Retirada na Loja".
    *   Seleção de Pagamento (Pix/Dinheiro).
    *   Botão "Confirmar Pedido".
