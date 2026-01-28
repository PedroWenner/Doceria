# 25. Storefront PWA Structure (iFood Style)

## Objetivo
Criar a interface da loja ("Storefront") na rota raiz (`/`), transformando a aplicação em um sistema híbrido: Admin (`/dashboard`) e Loja (`/`). O foco é UX Mobile-First (App-like).

## Estrutura de Rotas
```text
app/
├── (store)/                 # (Group) Layout específico da loja
│   ├── page.tsx             # Home: Categorias + Produtos
│   └── layout.tsx           # Layout da Loja (Navbar top, Tabbar bottom)
```

## Plano de Execução
1. [ ] Renomear `app/page.tsx` atual para backup ou deletar.
2. [ ] Criar `app/(store)/layout.tsx`: Definir estrutura mobile (TopBar + BottomBar).
3. [ ] Criar `app/(store)/page.tsx`: Página inicial listando produtos.
4. [ ] Integrar com API pública (ou ajustar API para não exigir token de admin para listar produtos, ou criar token de convidado).
   *   *Nota*: API atual exige token? `routes/api.php` tem `products` dentro do grupo `auth:api`?
   *   Verificando `api.php`: `Route::apiResource('products', ...)` está dentro do grupo `auth:api`, `role:admin`.
   *   **Crucial**: Precisamos liberar `GET /products` e `GET /categories` para público (app da loja).

## Tarefas Backend Adicionais
- Mover rotas de leitura (`index`, `show`) de Produtos e Categorias para fora do middleware `role:admin`.
- Manter rotas de escrita (`store`, `update`, `delete`) protegidas.
