# Implementação 06: Temas e layout Personalizado

## Visão Geral
Implementamos um sistema de temas dinâmico para atender aos requisitos de "Alta Visibilidade" e um modo "Dark Luxury".

---

## 1. Arquitetura CSS (`globals.css`)
Substituímos cores estáticas por **Variáveis CSS** e definimos dois schemas:

### Light Mode (High Visibility)
Focado em contraste e saturação para melhor legibilidade.
- **Fundo**: Cremer (`#FFFDF5`)
- **Texto**: Marrom Escuro (`#2D1B18`)
- **Destaques**: Rosa Saturado e Dourado Ouro.

### Dark Mode (Dark Luxury)
Focado em elegância noturna.
- **Fundo**: Café muito escuro (`#1A1110`)
- **Texto**: Creme claro (`#FFF8E1`)
- **Glassmorphism**: Adaptado para usar fundo escuro translúcido.

---

## 2. Componentes

### ThemeContext (`app/context/ThemeContext.tsx`)
- Gerencia o estado global do tema (`light` | `dark`).
- Persiste a escolha do usuário no `localStorage`.
- Aplica o atributo `data-theme` na tag `<html>`.

### ThemeToggle (`app/components/ThemeToggle.tsx`)
- Botão/Ícone adicionado ao topo da Sidebar.
- Alterna instantaneamente entre os temas.
- Ícones: ☀️ (Light) e 🌙 (Dark).

### GlassCard (`app/components/GlassCard.tsx`)
- Atualizado para usar variáveis `--glass-bg` e `--glass-border`.
- **Light**: Branco translúcido (Vidro clássico).
- **Dark**: Preto translúcido (Vidro fumê).

---

## Como Testar

1.  Observe o botão de Sol/Lua no topo da Sidebar.
2.  Clique para alternar.
3.  Verifique a mudança imediata de cores em todo o layout (Sidebar, Tabelas, Cards).
4.  Recarregue a página, a escolha deve permanecer salva.
