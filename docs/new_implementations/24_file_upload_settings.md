# 24. Upload de Imagens Real (Logo e Background)

## Objetivo
Substituir os campos de URL de texto (`logo_url`, `login_bg_url`) por upload real de arquivos de imagem, armazenando-os no servidor local (`public/storage`).

## Mudanças Propostas

### 1. Backend (`CompanySettingController.php`)
- Alterar validação para aceitar arquivos `image` ou `string` nullable (para compatibilidade caso venha url antiga, mas o form enviará file).
- Na verdade, `FormData` enviará arquivo. Validação: `nullable|image|max:2048`.
- Verificar `hasFile('logo_url')`.
- Salvar imagem.
- Atualizar campo no banco.

### 2. Frontend (`SettingsPage.tsx`)
- Alterar input `logo_url` para `type="file"`.
- Alterar input `login_bg_url` para `type="file"`.
- Estado: Adicionar campos de arquivo (ex: `logoFile`, `bgFile`) ao estado ou direto no FormData.
- Preview: Mostrar imagem atual (do banco) ou preview local do arquivo selecionado.

## Plano de Execução
1. [ ] Backend: Atualizar lógica de update para tratar Upload.
2. [ ] Frontend: Atualizar inputs para File Upload.
3. [ ] Frontend: Ajustar envio para FormData.
