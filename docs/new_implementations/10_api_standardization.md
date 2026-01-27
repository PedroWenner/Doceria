# Implementação 10: Padronização da API

## Visão Geral
Para garantir consistência e facilitar o consumo pelo Frontend, implementamos um padrão de resposta unificado (Envelope) para todos os endpoints da API.

---

## 1. Estrutura da Resposta
Todas as respostas (sucesso ou erro) seguem este formato JSON:

```json
{
  "status": "success", // ou "error"
  "message": "Operação realizada com sucesso", // Mensagem amigável (pode ser null)
  "data": { ... } // Objeto, Array ou null
}
```

### Exemplo de Sucesso (Lista)
```json
{
  "status": "success",
  "message": null,
  "data": [
    { "id": 1, "name": "Bolo de Chocolate", ... },
    { "id": 2, "name": "Torta de Limão", ... }
  ]
}
```

### Exemplo de Sucesso (Paginação)
Quando usando `paginate()`, o `data` conterá os metadados do Laravel, e os itens estarão em `data.data`.
```json
{
  "status": "success",
  "message": null,
  "data": {
    "current_page": 1,
    "data": [ ... itens ... ],
    "total": 50,
    ...
  }
}
```

### Exemplo de Erro
```json
{
  "status": "error",
  "message": "Produto não encontrado",
  "data": null // ou detalhes do erro
}
```

---

## 2. Backend (Trait)
Criamos a Trait `App\Traits\ApiResponse` para padronizar o retorno nos Controllers.

### Uso
```php
use App\Traits\ApiResponse;

class ProductController extends Controller {
    use ApiResponse;

    public function index() {
        $products = Product::all();
        return $this->success($products);
    }

    public function destroy($id) {
        // ... delete logic
        return $this->success(null, 'Produto deletado com sucesso');
    }

    public function errorExample() {
        return $this->error('Acesso negado', 403);
    }
}
```

## 3. Frontend
O Frontend foi adaptado para ler essa estrutura.
**Nota Importante:** Ao consumir endpoints paginados, o acesso aos itens mudou de `res.data` para `res.data.data`.

```typescript
// Exemplo de consumo no React
const fetchData = async () => {
    const res = await fetch('/api/products');
    const response = await res.json();

    if (response.status === 'success') {
        setProducts(response.data.data); // Para paginados
        // ou
        setCategories(response.data); // Para listas simples
    } else {
        alert(response.message);
    }
}
```
