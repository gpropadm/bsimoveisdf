# Sistema de Marca d'Água Automática

## Visão Geral

O sistema aplica automaticamente marca d'água em todas as imagens enviadas através do admin, protegendo as fotos da imobiliária e promovendo a marca.

## Funcionalidades

✅ **Marca d'água automática** em todas as imagens uploadadas
✅ **Configurável via variáveis de ambiente**
✅ **Design responsivo** - se adapta ao tamanho da imagem
✅ **Fallback seguro** - em caso de erro, mantém a imagem original
✅ **Performance otimizada** - processa em lotes para múltiplas imagens

## Configuração

### Variáveis de Ambiente (.env)

```bash
# Configurações de Marca d'Água
WATERMARK_TEXT="FAIMOVEIS"        # Texto da marca d'água
WATERMARK_OPACITY="0.4"           # Opacidade (0.1 a 1.0)
```

### Personalizações Disponíveis

No arquivo `/src/lib/watermark.ts` você pode ajustar:

- **Posição**: `center`, `bottom-right`, `bottom-left`, `top-right`, `top-left`
- **Cor**: `white`, `black`, ou qualquer cor CSS
- **Fonte**: Família da fonte
- **Tamanho**: Calculado automaticamente baseado na imagem

## Como Funciona

1. **Upload de Imagem**: Usuário faz upload via admin
2. **Processamento**: Sistema adiciona marca d'água automaticamente
3. **Cloudinary**: Imagem com marca d'água é enviada para o Cloudinary
4. **Resultado**: Imagem final com marca d'água fica disponível no site

## Exemplos de Resultado

### Marca d'Água Centralizada
- Texto semi-transparente no centro da imagem
- Fundo escuro atrás do texto para melhor legibilidade
- Sombra para destaque

### Design Responsivo
- Imagens pequenas: marca d'água menor
- Imagens grandes: marca d'água proporcional
- Mantém qualidade e não prejudica a visualização

## Vantagens

🔒 **Proteção**: Dificulta uso não autorizado das fotos
📈 **Marketing**: Promove a marca em cada imagem
⚡ **Automático**: Não requer ação manual
🎨 **Profissional**: Design elegante e discreto
🚀 **Performance**: Processamento rápido e eficiente

## Suporte Técnico

### Formatos Suportados
- JPEG/JPG
- PNG
- WebP
- GIF

### Limitações
- Máximo 5MB por imagem
- Máximo 30 imagens por upload
- Requer biblioteca Sharp instalada

### Logs
- Todos os processos são logados no console
- Possível monitorar sucesso/falha via logs do servidor

## Customização Avançada

Para personalizar ainda mais, edite o arquivo `/src/lib/watermark.ts`:

```typescript
// Exemplo de configuração personalizada
const watermarkOptions = {
  text: 'SUA IMOBILIÁRIA',
  fontSize: 80,
  opacity: 0.5,
  color: '#FF6B35',
  position: 'bottom-right'
}
```

## Desabilitação Temporária

Para desabilitar temporariamente, comente as linhas de marca d'água em `/src/app/api/admin/upload/route.ts`:

```typescript
// buffer = await addWatermark(buffer, { ... })
```

---

**Implementado em:** 2025-09-17
**Autor:** Claude Code
**Status:** ✅ Ativo e funcionando