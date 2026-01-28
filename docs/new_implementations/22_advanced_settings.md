# 22. Configurações Avançadas (Estoque, Visual e Integrações)

## Objetivo
Expandir as configurações do sistema para incluir opções operacionais (controle de estoque), visuais (white-label) e de integração (WhatsApp), conforme solicitado.

## Mudanças Propostas

### 1. Banco de Dados (`company_settings`)
Adicionar as seguintes colunas:

**Operacional & Estoque:**
- `enable_stock_control` (boolean, default: true): Se o sistema deve validar/bloquear vendas sem estoque.
- `global_min_stock` (integer, default: 5): Quantidade mínima padrão para alerta de estoque baixo (substitui necessidade de definir por produto).

**Visual (White-Label):**
- `logo_url` (string, nullable): URL da logo para o Topbar/Sidebar.
- `login_bg_url` (string, nullable): URL para o fundo da tela de login.
- `welcome_message` (string, nullable): Frase de boas-vindas no Dashboard.

**Integrações & Outros:**
- `currency_symbol` (string, default: 'R$'): Símbolo monetário global.
- `whatsapp_number` (string, nullable): Número para contato/botões.
- `delivery_message` (text, nullable): Mensagem padrão ao despachar pedidos.

### 2. Backend (Laravel)
- **Migration**: Adicionar colunas novas.
- **Model** (`CompanySetting`): Adicionar ao `$fillable` e `$casts` (boolean).
- **Controller** (`CompanySettingController`): Atualizar validação (`update` rule).

### 3. Frontend (Next.js)
- **Reorganização de Abas**:
    1. **Geral**: Identidade + **Visual** (Logo, Cores, BG, Msg Boas-vindas).
    2. **Operacional (Novo)**: Estoque, Moeda, WhatsApp, Msg Entrega.
    3. **Fiscal**: (Mantém).
    4. **Endereço**: (Mantém).
    5. **Sistema**: Refresh Rate, Token, Email (Tech stuff).

- **Traduções**: Adicionar chaves para todos os novos campos em `translations.ts`.

## Plano de Execução

1. [ ] Criar Migration para novas colunas.
2. [ ] Atualizar Model e Controller no Backend.
3. [ ] Atualizar `translations.ts` com novos termos.
4. [ ] Atualizar `SettingsPage.tsx`:
    - Adicionar campos ao estado inicial.
    - Criar nova aba "Operacional".
    - Mover/Adicionar inputs conforme novo layout.
