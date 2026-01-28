# Implementação 14: Melhorias de UI/UX

## Componentes Globais

### 1. LoadingSpinner (`app/components/LoadingSpinner.tsx`)
Um indicador de carregamento animado e centralizado, substituindo os textos simples de "Carregando...".

**Características:**
- **Centralização Vertical:** Usa `min-h-[70vh]` para garantir que o spinner fique no centro visual da tela, não no topo.
- **Identidade Visual:** Cores da marca (Chocolate e Rosa).
- **Animação:** Spinner giratório + Texto pulsante.

**Uso:**
```tsx
import LoadingSpinner from '@/app/components/LoadingSpinner';

if (isLoading) return <LoadingSpinner />;
```

**Aplicado em:**
- `UsersPage`
- `ProductsPage`
- `AuditPage`

### 2. LanguageToggle (`app/components/LanguageToggle.tsx`)
Melhoria visual no seletor de idiomas.

**Mudanças:**
- **Design Circular:** Alinhado com o `ThemeToggle`.
- **Bandeiras:** Uso de imagens reais (`flagcdn.com`) ao invés de emojis.
- **Hover:** Efeito de escala ao passar o mouse.

---

## Melhorias de Formulário

### Máscara de Moeda
- Implementada formatação automática para BRL (`R$ 1.000,00`) no input de preço de produtos.
- Conversão transparente de/para float no envio para API.
