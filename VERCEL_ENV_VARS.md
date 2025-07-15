# Variáveis de Ambiente para Vercel

## ⚠️ URGENTE: Configure estas variáveis na Vercel

Vá para https://vercel.com/seu-projeto/settings/environment-variables e adicione:

### 1. NextAuth (OBRIGATÓRIO)
```
NEXTAUTH_URL=https://faimoveis-site.vercel.app
NEXTAUTH_SECRET=faimoveis_super_secret_key_2025_production_very_strong_password_123456789
```

### 2. Database (OBRIGATÓRIO)
```
DATABASE_URL=postgresql://neondb_owner:npg_2jyDtYQTe0RZ@ep-morning-art-acmxwsl8-pooler.sa-east-1.aws.neon.tech/neondb
```

### 3. Site Configuration (OBRIGATÓRIO)
```
SITE_URL=https://faimoveis-site.vercel.app
SITE_NAME=Faimoveis
```

### 4. Contact Information (OBRIGATÓRIO)
```
CORRETOR_NAME=Nome do Corretor
CORRETOR_PHONE=5511999999999
CORRETOR_EMAIL=contato@faimoveis.com.br
```

## Como Configurar na Vercel:

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em Settings > Environment Variables
4. Adicione cada variável acima
5. Redeploy o projeto

## Gerar NEXTAUTH_SECRET:

Execute no terminal:
```bash
openssl rand -base64 32
```

Ou use: https://generate-secret.vercel.app/32

## ⚠️ IMPORTANTE:
- Todas as variáveis devem ser configuradas como "Production"
- Depois de adicionar, faça um novo deploy
- Teste o login em https://faimoveis.vercel.app/admin/login