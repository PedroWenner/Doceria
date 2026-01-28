# Implementação 12: Internacionalização (i18n)

## Visão Geral
Implementamos um sistema leve de tradução no Frontend para suportar **Português (PT-BR)** (Padrão) e **Inglês (EN-US)**, com troca instantânea via Toggle no Sidebar.

## Arquitetura
Optamos por uma abordagem baseada em **React Context** em vez de Roteamento (`/pt/`, `/en/`) para manter a simplicidade de uma SPA e permitir a troca de idioma sem recarregar a página ou alterar a URL.

### Componentes Chave

1.  **Dicionário de Traduções (`app/utils/translations.ts`)**
    Objeto tipado contendo todas as strings do sistema.
    ```typescript
    export const translations = {
      pt: { common: { save: 'Salvar' }, ... },
      en: { common: { save: 'Save' }, ... }
    };
    ```

2.  **Contexto (`app/context/LanguageContext.tsx`)**
    - Persiste a escolha no `localStorage`.
    - Fornece a função hook `useLanguage()`.
    - Função `t('key.path')` para resolver strings aninhadas.

3.  **Toggle (`app/components/LanguageToggle.tsx`)**
    - Botão de alternância com bandeiras (🇧🇷 / 🇺🇸).
    - Localizado no Sidebar, ao lado do Theme Toggle.

4.  **Máscara de Moeda (BRL)**
    - Utilitário: `app/utils/formatters.ts`
    - Formato de Entrada: `R$ 1.234,56` (Máscara automática ao digitar).
    - Formato de Envio (API): `1234.56` (Float padrão).
    - Componentes: Aplicado no formulário de Produtos.

## Como Adicionar Novas Traduções

1. Abra `app/utils/translations.ts`.
2. Adicione a chave em ambos os objetos `pt` e `en`.
   ```typescript
   // pt
   products: { new_feature: 'Nova Funcionalidade' }
   // en
   products: { new_feature: 'New Feature' }
   ```
3. No componente, use:
   ```typescript
   const { t } = useLanguage();
   <span>{t('products.new_feature')}</span>
   ```

## Páginas Atualizadas
- **Login**: Títulos, labels, botões e mensagens de erro.
- **Sidebar**: Itens de menu e botão de logout.
- **Users**: Tabelas, modais e ações.
- **Products**: Tabelas, formulários, badges de status e estoque.
