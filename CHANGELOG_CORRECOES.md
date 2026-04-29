# Changelog de Correções — UNIMAXX-ADMIN

## [1.1.0] - 2026-04-29

### Segurança
- 🔒 Removidas credenciais hardcoded do README (verificado, não existiam)
- 🔒 Implementado Refresh Token em cookie httpOnly, secure e sameSite=\'strict\'
- 🔒 Adicionada sanitização de HTML com DOMPurify em `backend/src/modules/help/index.js`
- 🔒 Padronizado tempo de expiração dos tokens (Access: 2h, Refresh: 7d) em `backend/src/routes/admin/auth.js` e `backend/src/config/env.js`
- 🔒 Adicionado `.gitignore` robusto na raiz, backend e frontend

### Correções de Bugs
- 🐛 Resolvido conflito de merge no README (verificado, não existia)
- 🐛 Removida duplicação de código em `backend/src/routes/admin/auth.js`
- 🐛 Corrigida rota `POST /track` (movida antes do `module.exports`) em `backend/src/routes/public/index.js`
- 🐛 Implementada exclusão de arquivos físicos ao deletar registros em `backend/src/routes/admin/banners.js`, `backend/src/routes/admin/social.js`, `backend/src/modules/help/index.js`, `backend/src/routes/admin/solutions.js` e `backend/src/routes/admin/segments.js`
- 🐛 Centralizadas constantes de configuração (`MAX_UPLOAD_SIZE`) em `backend/src/config/env.js` e atualizado `backend/src/middleware/upload.js`

### Melhorias
- ✨ Criado API Client centralizado com Axios e interceptores em `frontend/src/lib/api.ts`
- ✨ Melhorada validação de schemas Zod para `blocks_json` em `backend/src/validation/admin.js`
- ✨ Melhorado feedback de erro no frontend com toast notifications (sonner) em `frontend/src/components/ImageUploadField.tsx`
- ✨ Corrigidos links de preview no frontend para páginas genéricas em `frontend/src/admin/GenericPagesManager.tsx`

