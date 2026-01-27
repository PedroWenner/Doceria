# Implementação 09: Gestão de Produtos (Avançado)

## Visão Geral
Implementamos um sistema completo de gestão de produtos (CRUD) com suporte a controle de estoque, categorias e upload de imagens.

---

## 1. Banco de Dados
Novas tabelas foram criadas:
- **categories**: Armazena as categorias dos doces (Ex: Cakes, Pies).
- **products**: Armazena os produtos com campos detalhados:
    - `sku` (Único)
    - `stock_quantity` e `min_stock_level` (Controle de Estoque)
    - `image_path` (Caminho da imagem no storage)
    - `price` (Decimal)

## 2. Backend (API)
- **ProductController**:
    - `store`: Valida dados e faz upload de arquivo para `storage/app/public/products`.
    - `update`: Permite substituir a imagem (deleta a antiga automaticamente).
    - `index`: Retorna produtos com paginação e relacionamento com categorias.
- **CategoryController**:
    - `index`: Lista categorias para o dropdown.

## 3. Frontend (Dashboard)
A página `/dashboard/products` agora contém:
- **Listagem Rica**: Tabela com miniaturas de imagem, emblemas de estoque (Verde/Amarelo/Vermelho) e status.
- **Modal de Cadastro/Edição**:
    - Formulário integrado na mesma página (UX fluida).
    - Upload de imagem visual.
    - Seleção de categoria dinâmica.

---

## Como Testar

1.  **Criar Produto**:
    - Clique em "+ New Product".
    - Preencha Nome, SKU, Preço, Categoria.
    - Faça upload de uma foto de doce.
    - Salve. Verifique se aparece na lista com a foto.
2.  **Estoque**:
    - Crie um produto com Estoque 2 e Nível Mínimo 5.
    - Veja se o badge aparece amarelo ("Low Stock").
3.  **Edição**:
    - Clique no lápis em um produto.
    - Troque o nome e a foto.
    - Salve. A lista deve atualizar instantaneamente.
