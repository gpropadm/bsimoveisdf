# 🚀 Deploy na Vercel - faimoveis.com.br

## 📋 Passo a Passo Completo

### 1. **Preparar o Projeto**

```bash
# Criar build de produção
npm run build

# Verificar se não há erros
npm run lint
```

### 2. **Configurar Vercel**

#### A. **Instalar Vercel CLI**
```bash
npm install -g vercel
```

#### B. **Login na Vercel**
```bash
vercel login
```

#### C. **Deploy Initial**
```bash
vercel --prod
```

### 3. **Configurar Domínio**

#### A. **Na Vercel Dashboard:**
1. Acesse: https://vercel.com/dashboard
2. Clique no projeto
3. Vá em **Settings → Domains**
4. Adicione: `faimoveis.com.br`
5. Adicione: `www.faimoveis.com.br`

#### B. **No seu provedor de domínio:**
Configure os DNS:
```
Type: A
Name: @
Value: 76.76.19.19

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4. **Variáveis de Ambiente**

Na Vercel Dashboard → Settings → Environment Variables:

```bash
# Database
DATABASE_URL="sua_url_do_banco_producao"

# NextAuth
NEXTAUTH_URL="https://faimoveis.com.br"
NEXTAUTH_SECRET="sua_chave_secreta_aqui"

# Google Sheets (opcional)
GOOGLE_SERVICE_ACCOUNT_EMAIL="seu_email@projeto.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_SHEET_ID="seu_id_da_planilha"

# Site Config
SITE_URL="https://faimoveis.com.br"
SITE_NAME="FA Imóveis"
CORRETOR_NAME="Seu Nome"
CORRETOR_PHONE="5511999999999"
CORRETOR_EMAIL="contato@faimoveis.com.br"
```

### 5. **Configurar Banco de Dados**

#### A. **Opção 1: Neon (Recomendado)**
```bash
# Grátis até 10GB
# Acesse: https://neon.tech
# Crie conta → Novo projeto → Copie a URL
```

#### B. **Opção 2: Supabase**
```bash
# Grátis até 2GB
# Acesse: https://supabase.com
# Crie conta → Novo projeto → Copie a URL
```

#### C. **Aplicar Migrações**
```bash
# Após configurar DATABASE_URL
npx prisma db push
```

### 6. **Configurar Build**

Arquivo `vercel.json`:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  }
}
```

### 7. **Comandos Úteis**

```bash
# Deploy de produção
vercel --prod

# Ver logs
vercel logs

# Ver domínios
vercel domains

# Remover deploy
vercel remove
```

### 8. **Verificações Finais**

- [ ] Site carrega em https://faimoveis.com.br
- [ ] Banco de dados conectado
- [ ] Imóveis aparecem na home
- [ ] Agendamentos funcionam
- [ ] Admin funciona (/admin/appointments)
- [ ] SSL configurado automaticamente

### 9. **Personalização para FA Imóveis**

Atualizar arquivos:
- `src/app/layout.tsx` → Título e meta tags
- `src/components/Header.tsx` → Logo e nome
- `src/components/Footer.tsx` → Informações da empresa
- `public/favicon.ico` → Favicon personalizado

### 10. **Monitoramento**

- **Analytics:** Vercel Analytics (gratuito)
- **Logs:** Vercel Functions Logs
- **Performance:** Vercel Speed Insights

---

## 🔧 Troubleshooting

### Erro de Build:
```bash
# Limpar cache
rm -rf .next
npm run build
```

### Erro de Database:
```bash
# Verificar conexão
npx prisma db push
```

### Erro de Domínio:
- Aguardar propagação DNS (24-48h)
- Verificar configuração no provedor

---

## 📞 Suporte

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deploy:** https://nextjs.org/docs/deployment
- **Prisma Deploy:** https://www.prisma.io/docs/guides/deployment