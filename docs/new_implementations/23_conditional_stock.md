# 23. Campos de Estoque Condicionais

## Objetivo
Tornar os campos "Quantidade em Estoque" e "Estoque Mínimo" opcionais e ocultá-los (ou deixá-los não obrigatórios) no formulário de produtos quando o parâmetro global `enable_stock_control` estiver desativado.

## Mudanças Propostas

### 1. Frontend (`ProductsPage.tsx`)
- **Estado**: Adicionar `stockControlEnabled` para armazenar `enable_stock_control`.
- **Fetch**: Buscar configurações em `/api/settings` ao carregar a página.
- **Formulário**:
    - Se `stockControlEnabled === false`:
        - Ocultar `div` dos inputs de estoque.
        - Ou: Remover atributo `required` e desabilitar inputs.
        - Definir valor padrão (ex: 0 ou null) ao salvar se estiver oculto.

### 2. Backend (`ProductController.php`)
- Verificar se a validação exige `stock_quantity`.
- Se o controle estiver desligado, talvez a validação deva ser relaxada ou o valor ignorado.
- *Nota*: O usuário pediu apenas para "não precisar preencher", o que implica mudança no Frontend. O Backend deve aceitar se enviarmos um valor default ou nullable.

## Plano de Execução
1. [ ] Atualizar `ProductsPage.tsx` para buscar settings.
2. [ ] Condicionar a renderização dos inputs de estoque no Modal.
3. [ ] Ajustar `handleSave` para enviar valores padrão caso o controle esteja desligado.
