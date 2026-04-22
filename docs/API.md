# API Documentation - UNIMAXX Admin

## Autenticação
Todas as rotas admin requerem Bearer Token no header:
```
Authorization: Bearer <token>
```

## Endpoints

### Temas
- `GET /api/admin/theme` - Obter configurações do tema
- `PUT /api/admin/theme` - Atualizar tema

### Páginas
- `GET /api/admin/pages` - Listar páginas
- `POST /api/admin/pages` - Criar página
- `GET /api/admin/pages/:id` - Obter página específica
- `PUT /api/admin/pages/:id` - Atualizar página
- `DELETE /api/admin/pages/:id` - Excluir página
- `PUT /api/admin/pages/:id/publish` - Publicar/Despublicar

### Componentes
- `GET /api/admin/components` - Listar componentes
- `POST /api/admin/components` - Criar componente

### Mídia
- `GET /api/admin/media` - Listar arquivos
- `POST /api/admin/media/upload` - Upload de arquivos (multipart/form-data)
- `DELETE /api/admin/media/:id` - Excluir arquivo

### Menus
- `GET /api/admin/menus/:location` - Obter menu (header/footer)
- `PUT /api/admin/menus/:location` - Atualizar menu

### Analytics
- `GET /api/admin/analytics` - Estatísticas gerais

## Estrutura de Componentes (Page Builder)

```json
{
  "id": "comp-uuid",
  "type": "hero|text|features|...",
  "props": { 
    // Propriedades específicas do componente
  },
  "styles": {
    "padding": "40px 20px",
    "margin": "0",
    "backgroundColor": "#fff",
    "customCSS": ""
  }
}
```

## Upload de Arquivos

Limite: 10MB por arquivo
Tipos permitidos: jpg, jpeg, png, gif, webp, mp4, pdf

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "files=@imagem.jpg" \
  /api/admin/media/upload
```
