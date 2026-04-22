# Security Guide - UNIMAXX Admin

## ✅ Implementações de Segurança

### 1. Autenticação
- JWT com expiração de 24h
- Rate limiting no login (5 tentativas/15min)
- Senhas hasheadas com bcrypt (12 rounds)

### 2. Proteção de Dados
- Helmet.js para headers de segurança
- CORS configurado para domínios específicos
- Sanitização de inputs
- Validação de tipos com TypeScript

### 3. Upload de Arquivos
- Limite de tamanho (10MB)
- Validação de MIME type
- Nomes de arquivo sanitizados
- Pasta uploads fora do public

### 4. SQL Injection
- Uso de prepared statements em todas as queries
- ORM/SQLite com parametrização

### 5. XSS Protection
- Content Security Policy (CSP)
- Escape de output em componentes React
- Sanitização de HTML em rich text

## ⚠️ Checklist Pré-Deploy

- [ ] Alterar JWT_SECRET (mínimo 32 caracteres)
- [ ] Configurar HTTPS
- [ ] Atualizar CORS origins
- [ ] Desativar logs de debug
- [ ] Configurar backups automáticos
- [ ] Remover credenciais de teste
- [ ] Ativar rate limiting

## 🔒 Headers de Segurança Configurados

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Referrer-Policy: same-origin
Content-Security-Policy: default-src 'self'
```
