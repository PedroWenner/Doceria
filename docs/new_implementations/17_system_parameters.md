# Implementação 17: Parâmetros do Sistema (Configurações Gerais)

## Visão Geral
Centralização das configurações da loja (Identidade, Fiscal e Endereço) em uma única tela administrativa.

## Backend
### Model: `CompanySetting`
Tabela Singleton (sempre usamos o ID 1) para armazenar:
- **Geral**: Nome do Sistema, Descrição, Cor da Marca, Logo.
- **Fiscal**: CNPJ, IE, IM, Regime.
- **Endereço**: Completo.

### API
- `GET /api/settings`: Retorna as configurações atuais.
- `PUT /api/settings`: Atualiza os dados.
- Proteção: Apenas administradores.

## Frontend
### Página de Configurações (`/dashboard/settings`)
- Formulário unificado com 3 seções em Cards de Vidro (`GlassCard`).
- **Color Picker** nativo para escolha da cor da marca.
- Inputs de texto para dados cadastrais e fiscais.
- Botão flutuante ou fixo para salvar.

## Uso
Acesse **⚙️ Parâmetros do Sistema** no menu lateral.
Esses dados serão utilizados futuramente para gerar PDFs (recibos/pedidos) e customizar o tema da loja dinamicamente (Brand Color).
