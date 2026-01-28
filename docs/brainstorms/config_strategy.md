# 🧠 Brainstorm: Estratégia de Configuração (Banco vs .env)

### Contexto
Precisamos definir onde armazenar configurações como o **Intervalo de Atualização da Tela de Pedidos** e **Configurações de E-mail**.

---

### Opção A: Intervalo de Atualização (Orders Refresh Rate)
Definir de quanto em quanto tempo o Backoffice buscará novos pedidos automaticamente.

✅ **Local Recomendado:** Banco de Dados (`company_settings`)
- **Motivo:** É uma regra de negócio que pode variar conforme a operação (ex: dia de pico vs dia calmo).
- **Vantagem:** O administrador altera na tela de Configurações e a mudança reflete instantaneamente para todos os usuários logados.
- **Implementação:** Adicionar coluna `orders_refresh_rate` (integer, default 60 segundos).

📊 **Esforço:** Baixo.

---

### Opção B: Configuração de E-mail (SMTP)
Definir host, porta, usuário e senha do servidor de e-mail.

✅ **Local Recomendado:** Arquivo `.env` (Padrão Laravel)
- **Motivo:** Credenciais de infraestrutura/segurança.
- **Segurança:** Evita expor senhas no banco de dados e na interface administrativa.
- **Padrão:** O Laravel já possui estrutura nativa (`MAIL_HOST`, `MAIL_PORT` etc.) que é segura e performática.

❌ **Contra:** Requer acesso ao servidor para alterar.

📊 **Esforço:** Nulo (Configuração nativa).

---

## 💡 Recomendação

1.  **Adicionar `orders_refresh_rate` na tabela `company_settings`**.
    -   Permite flexibilidade operacional.
2.  **Manter configurações de E-mail no `.env`**.
    -   Garante segurança e segue boas práticas de DevOps.

**Próximos Passos:**
-   Criar migration para adicionar coluna na tabela.
-   Adicionar input numérico na tela de Configurações.
-   Usar esse valor na página de Pedidos (`Polling`).
