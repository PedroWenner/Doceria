# 19. Reformulação da Tela de Configurações (V2) e Novos Parâmetros

## 1. Nova Interface em Abas
Para melhorar a organização e usabilidade, a tela de Parâmetros do Sistema (`/dashboard/settings`) foi reestruturada utilizando um layout de abas (**Tabs**).

### Abas Implementadas
1.  **🏢 Geral**: Nome do sistema, cor da marca, descrição.
2.  **⚖️ Fiscal**: CNPJ (com busca automática), Regime Tributário, Inscrições Estadual/Municipal.
3.  **📍 Endereço**: CEP (com busca automática), Logradouro, Bairro, Cidade, Estado.
4.  **⚙️ Sistema**: Novas configurações técnicas e operacionais.

## 2. Novos Parâmetros do Sistema

### Taxa de Atualização de Pedidos (`orders_refresh_rate`)
-   **Descrição**: Define o intervalo de tempo (em segundos) que o painel de pedidos aguarda antes de buscar novas atualizações automaticamente.
-   **Local**: Aba "Sistema".
-   **Banco de Dados**: Coluna `orders_refresh_rate` (integer, default: 60) na tabela `company_settings`.
-   **Uso**: Permite ajustar a carga no servidor em dias de alto movimento (aumentando o tempo) ou garantir agilidade na cozinha (diminuindo o tempo).

### Configuração de E-mail (SMTP)
-   **Decisão de Arquitetura**: Manter as credenciais de e-mail (`MAIL_HOST`, `MAIL_PASSWORD`, etc.) exclusivas do arquivo `.env`.
-   **Motivo**: Segurança. Evitar expor senhas de infraestrutura na interface administrativa ou no banco de dados.
-   **Interface**: Adicionado um card informativo na aba "Sistema" orientando o administrador a contatar o suporte técnico para alterações de e-mail.

## 3. Detalhes Técnicos

### Backend (Laravel)
-   Migration criada: `2026_01_28_193128_add_orders_refresh_rate_to_company_settings_table.php`
-   Model `CompanySetting`: Adicionado `orders_refresh_rate` ao array `$fillable`.

### Frontend (Next.js)
-   Componente reutilizável de abas com estado local (`activeTab`).
-   Carregamento de dados unificado (`fetchSettings`) populando todos os campos independentemente da aba ativa.
-   Validação de campos numéricos (`min="10"`, `max="3600"`).
