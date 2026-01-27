# Implementação 07: Sidebar Responsiva e Aprimorada

## Visão Geral
A Sidebar foi refatorada para oferecer uma experiência de navegação moderna, responsiva e clara. Agora ela se adapta a dispositivos móveis e fornece feedback visual imediato sobre a localização do usuário no sistema.

---

## 1. Responsividade (Mobile Drawer)

### Comportamento
- **Desktop (>= 768px)**: A Sidebar permanece fixa na esquerda (`w-64`), e o conteúdo principal é deslocado (`ml-64`).
- **Mobile (< 768px)**:
    - A Sidebar fica oculta por padrão (`-translate-x-full`).
    - Uma **Barra de Topo (Header)** fixa aparece, contendo o logo e um botão "Menu" (☰).
    - Ao abrir, a Sidebar desliza suavemente sobre o conteúdo (`z-40`) com um fundo escurecido (Overlay) para focar a atenção.
    - Clicar no Overlay ou em qualquer link fecha a Sidebar automaticamente.

---

## 2. Estado Ativo (Active State)

### Lógica Dinâmica
Utilizamos o hook `usePathname` do Next.js para determinar a rota atual e aplicar estilos condicionalmente.

### Estilos
- **Item Ativo**:
    - Fundo: Rosa suave (`bg-brand-pink/20`).
    - Borda: Rosa (`border-brand-pink/30`).
    - Texto: Chocolate (`text-brand-choco`) e **Negrito**.
    - Sombra leve.
- **Item Inativo**:
    - Fundo: Transparente.
    - Hover: Fundo branco translúcido (`bg-white/40`) e leve escala (`scale-[1.02]`).

---

## 3. Melhorias de UX

- **Cursores**: Todos os itens clicáveis (Links, Botão de Logout, Menu Toggle) foram padronizados com `cursor-pointer`.
- **Transições**: Adicionada `transition-all duration-300` para suavizar a abertura do menu e os efeitos de hover.
- **Logout Visual**: O botão de Logout agora tem um efeito de "zoom" no ícone ao passar o mouse.

---

## Como Testar

1.  **Navegação**: Clique nos diferentes itens do menu (Overview, Orders, Users) e observe a "pílula" de destaque mudando.
2.  **Mobile**:
    - Diminua a janela do navegador (F12 -> Toggle Device Toolbar).
    - Verifique se a Sidebar some e o botão Menu aparece.
    - Abra o menu e tente navegar.
3.  **Temas**: A Sidebar e seus estados ativos funcionam perfeitamente tanto no Light quanto no Dark Mode.
