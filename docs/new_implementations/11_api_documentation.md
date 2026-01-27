# Implementação 11: Documentação Automática da API (Scramble)

## Visão Geral
Implementamos o pacote `dedoc/scramble` para gerar automaticamente a documentação OpenAPI (Swagger UI) da nossa API. Isso permite que desenvolvedores (Frontend, Mobile) visualizem e testem os endpoints sem a necessidade de manter arquivos JSON ou YML manualmente.

---

## 1. Acesso
A documentação está disponível na rota:
- **URL**: `/docs/api` (ex: `http://localhost:8000/docs/api`)
- **Formato JSON**: `/docs/api.json`

## 2. Configuração
A configuração foi feita no `App\Providers\AppServiceProvider.php` para controlar o acesso.

```php
use Illuminate\Support\Facades\Gate;
use App\Models\User;

public function boot(): void
{
    // ...
    Gate::define('viewScramble', function (User $user) {
        // Atualmente liberado para todos (ambiente dev).
        // Em produção, deve-se restringir a admins:
        // return $user->hasRole('admin');
        return true;
    });
}
```

## 3. Como Funciona
O Scramble analisa o código fonte (Controllers, FormRequests, JsonResources) e gera a doc:
- **Endpoints**: Detectados das rotas (`routes/api.php`).
- **Parâmetros**: Inferidos dos métodos `validate()` ou classes `FormRequest`.
- **Respostas**: Inferidas dos métodos `metrics` (JsonResources) ou retornos diretos.
- **Autenticação**: Detecta automaticamente o uso de Bearer Token (Sanctum/JWT).

## 4. Manutenção
A documentação é **"Zero Config"**. Ao criar um novo controller ou mudar uma validação, a página de documentação é atualizada automaticamente na próxima atualização da página. Não é necessário rodar comandos de build.
