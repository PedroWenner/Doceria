# Sistema de Temas do Storefront (Theme System)

Esta documentação detalha a implementação do sistema de temas para a loja virtual (Storefront), permitindo que os usuários alternem entre estéticas visuais distintas (ex: "Minimalista" vs "Colorido") de forma instantânea e persistente.

## 1. Visão Geral

O sistema foi projetado para ser **leve**, **semantico** e **extensível**. Ele utiliza variáveis de ambiente CSS nativas (Custom Properties) combinadas com o Tailwind CSS v4 para aplicar cores dinamicamente sem a necessidade de classes CSS condicionais complexas (ex: `bg-white dark:bg-black theme-colorful:bg-yellow` etc).

### Temas Disponíveis

1.  **Luxury Minimalist (Padrão)**:
    *   Foco em tons de cinza, preto e branco.
    *   Estética limpa, moderna e premium.
    *   Ideal para transmitir sofisticação.
2.  **Colorful Playful (Legado)**:
    *   Tons quentes: Rosa (`#FFC0CB`), Creme/Floral (`#FFFAF0`), Marrom (`#2D1B18`).
    *   Estética nostálgica, "doceira clássica".
    *   Ideal para transmitir acolhimento e diversão.

## 2. Arquitetura Técnica

### 2.1 CSS Variables (`globals.css`)

Todas as cores dinâmicas são definidas dentro de `:root` (padrão) e `[data-store-theme='colorful']` (override).

As variáveis semânticas principais são:

| Variável CSS | Descrição | Uso Típico |
| :--- | :--- | :--- |
| `--store-bg` | Cor de fundo da página | `bg-[var(--store-bg)]` nas `div` principais |
| `--store-card` | Cor de fundo de cartões/container | `bg-[var(--store-card)]` em cards de produto, modals |
| `--store-text` | Cor principal do texto | Títulos, preços, textos de destaque |
| `--store-text-muted` | Cor secundária do texto | Legendas, descrições curtas |
| `--store-primary` | Cor de ação primária | Botões de "Comprar", "Checkout", Badges de contagem |
| `--store-primary-fg` | Cor do texto sob a cor primária | Texto dentro dos botões primários |
| `--store-secondary` | Cor de ação secundária | Botões de "Entrar", fundos de destaque suave |
| `--store-border` | Cor de bordas | Divisores, bordas de inputs e cards |
| `--store-ring` | Cor de anéis de foco/sombra | `ring` outlines e sombras suaves |

### 2.2 React Context (`ThemeContext.tsx`)

O estado do tema é gerenciado globalmente pelo `ThemeContext`.

*   **Estado**: `storeTheme` (`'minimalist' | 'colorful'`).
*   **Persistência**: `localStorage.getItem('store_theme')`.
*   **Aplicação**: Ao alterar o tema, o hook atualiza o estado E define o atributo `data-store-theme` na tag `<html>` (via `document.documentElement`).

```tsx
// Exemplo de uso
const { storeTheme, toggleStoreTheme } = useTheme();

<button onClick={toggleStoreTheme}>
  {storeTheme === 'minimalist' ? 'Mudar para Colorido' : 'Mudar para Minimalista'}
</button>
```

## 3. Guia de Implementação para Desenvolvedores

Ao criar novas páginas ou componentes para o Storefront, **NÃO utilize cores hardcoded** do Tailwind (ex: `bg-white`, `text-gray-900`, `bg-pink-500`) se o elemento deve reagir ao tema.

Utilize o atributo `style` para injetar as variáveis CSS, garantindo compatibilidade total:

```tsx
// ❌ INCORRETO (Não muda com o tema)
<div className="bg-white border border-gray-200 text-gray-900">
  ...
</div>

// ✅ CORRETO (Reativo)
<div 
  className="border transition-colors duration-300"
  style={{ 
    backgroundColor: 'var(--store-card)', 
    borderColor: 'var(--store-border)',
    color: 'var(--store-text)' 
  }}
>
  ...
</div>
```

*Nota: Para casos simples, você pode configurar essas variáveis no `tailwind.config.ts` (ou `@theme` no CSS v4) para usar classes como `bg-store-card`, mas a injeção direta via style é a maneira mais robusta de garantir que o Tailwind v4 (que compila estaticamente) reconheça os valores dinâmicos do runtime.*

## 4. Adicionando Novos Temas

Para adicionar um terceiro tema (ex: "Dark Mode" ou "Sazonal"):

1.  Adicione o identificador ao tipo `StoreTheme` em `ThemeContext.tsx`.
2.  Crie um novo bloco CSS em `globals.css`:
    ```css
    [data-store-theme='dark'] {
      --store-bg: #111827;
      --store-card: #1F2937;
      --store-text: #F9FAFB;
      /* ... demais variáveis ... */
    }
    ```
3.  Atualize a lógica de `toggleStoreTheme` (ou crie um seletor) em `ThemeContext.tsx`.

---

**Autor**: Equipe de Frontend (Antigravity)
**Data**: 29/01/2026
