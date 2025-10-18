# 🚀 Guia de Deploy - Sistema CRM Avançado

## 📋 **PRÉ-REQUISITOS**

Antes de fazer o deploy, você precisa:

1. ✅ Conta no GitHub (já tem: https://github.com/gpropadm/bsimoveisdf)
2. ✅ Conta na Vercel (para hospedagem)
3. ✅ Banco de dados PostgreSQL (Neon, Supabase ou outro)
4. ✅ Chave da API Anthropic Claude (https://console.anthropic.com/)

---

## 🗄️ **PASSO 1: Configurar Banco de Dados**

### **Opção A: Neon (Recomendado - Gratuito)**

1. Acesse: https://neon.tech/
2. Crie uma conta
3. Crie um novo projeto
4. Copie a `DATABASE_URL` (formato PostgreSQL)

### **Opção B: Supabase (Alternativa)**

1. Acesse: https://supabase.com/
2. Crie uma conta
3. Crie um novo projeto
4. Em "Settings" → "Database" copie a Connection String

---

## 🔐 **PASSO 2: Obter Chave da API Anthropic**

1. Acesse: https://console.anthropic.com/
2. Faça login ou crie uma conta
3. Vá em "API Keys"
4. Clique em "Create Key"
5. Copie a chave (começa com `sk-ant-...`)

**Importante:** Esta chave é necessária para o Bot WhatsApp e Chatbot funcionarem!

---

## 🌐 **PASSO 3: Deploy na Vercel**

### **3.1 Conectar GitHub à Vercel**

1. Acesse: https://vercel.com/
2. Faça login com GitHub
3. Clique em "Add New..." → "Project"
4. Importe o repositório: `gpropadm/bsimoveisdf`
5. Clique em "Import"

### **3.2 Configurar Variáveis de Ambiente**

Na tela de configuração do projeto, adicione as variáveis:

#### **Variáveis Obrigatórias:**

```bash
# Banco de Dados
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Autenticação
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=gere_senha_aleatoria_aqui

# IA - Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
```

#### **Como gerar NEXTAUTH_SECRET:**

```bash
# No terminal local:
openssl rand -base64 32
```

Ou use: https://generate-secret.vercel.app/32

### **3.3 Deploy**

1. Clique em "Deploy"
2. Aguarde o build (2-5 minutos)
3. ✅ Seu site está no ar!

---

## 🗃️ **PASSO 4: Configurar Banco de Dados em Produção**

Depois do deploy, você precisa criar as tabelas:

### **4.1 Gerar Cliente Prisma**

```bash
npm run build
```

Isso já roda automaticamente:
- `prisma generate` (gera cliente)
- `prisma db push` (cria tabelas)

### **4.2 Popular Dados Iniciais (Seed)**

Execute manualmente uma vez:

```bash
# Via terminal Vercel ou localmente:
node prisma/seed-crm.js
```

Isso cria:
- ✅ 7 stages do funil Kanban
- ✅ 14 regras de Lead Scoring
- ✅ 1 bot padrão

---

## 🤖 **PASSO 5: Configurar WhatsApp Bot (Opcional)**

Se quiser ativar o Bot WhatsApp, escolha um provedor:

### **Opção A: Evolution API (Gratuito - Recomendado)**

1. Instale em um servidor (VPS, Railway, Render):

```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e API_KEY="sua_chave_secreta" \
  atendai/evolution-api:latest
```

2. Adicione as variáveis na Vercel:

```bash
WHATSAPP_PROVIDER=evolution
EVOLUTION_API_URL=https://seu-servidor.com
EVOLUTION_API_KEY=sua_chave_secreta
EVOLUTION_INSTANCE_NAME=bot-imoveis
```

3. Configure o webhook:

```bash
curl -X POST https://seu-servidor.com/webhook/set/bot-imoveis \
  -H "apikey: sua_chave_secreta" \
  -d '{
    "url": "https://seu-site.vercel.app/api/bot/whatsapp/webhook",
    "events": ["messages.upsert"]
  }'
```

### **Opção B: Modo Simulação (Para Testes)**

```bash
WHATSAPP_PROVIDER=simulation
```

Isso permite testar via API sem WhatsApp real.

---

## ✅ **PASSO 6: Verificar Instalação**

Depois do deploy, teste:

### **6.1 Acessar o Site**
```
https://seu-dominio.vercel.app
```

### **6.2 Fazer Login Admin**
```
https://seu-dominio.vercel.app/admin/login
```

**Credenciais padrão:**
- Email: admin@imobinext.com
- Senha: ULTRAPHINK

**⚠️ IMPORTANTE:** Mude a senha depois!

### **6.3 Acessar CRM Kanban**
```
https://seu-dominio.vercel.app/admin/crm
```

Você deve ver os 7 stages vazios!

### **6.4 Acessar Monitor de Bots**
```
https://seu-dominio.vercel.app/admin/bot-monitor
```

### **6.5 Testar Bot (via API)**

```bash
curl -X POST https://seu-dominio.vercel.app/api/bot/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+5561999999999",
    "text": "Quero apartamento 2 quartos",
    "id": "test_1"
  }'
```

Se retornar uma resposta JSON com `success: true`, está funcionando!

---

## 🔧 **VARIÁVEIS DE AMBIENTE - RESUMO**

### **Mínimas para Funcionar:**

```bash
# Obrigatórias
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://seu-site.vercel.app
NEXTAUTH_SECRET=senha_secreta_aqui
ANTHROPIC_API_KEY=sk-ant-...

# Recomendadas
WHATSAPP_PROVIDER=simulation
NODE_ENV=production
```

### **Opcionais (para recursos extras):**

```bash
# WhatsApp Bot Real
EVOLUTION_API_URL=...
EVOLUTION_API_KEY=...
EVOLUTION_INSTANCE_NAME=...

# Upload de Imagens
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Mapas
NEXT_PUBLIC_MAPBOX_TOKEN=...
```

---

## 🐛 **TROUBLESHOOTING**

### **Erro: "Prisma Client not found"**

Solução:
```bash
# No painel Vercel, em "Settings" → "General"
# Build Command: npm run build
# Isso já inclui: prisma generate && prisma db push
```

### **Erro: "NEXTAUTH_URL não configurada"**

Solução:
```bash
# Adicione nas variáveis de ambiente:
NEXTAUTH_URL=https://seu-dominio.vercel.app
```

### **Bot não responde**

Solução:
1. Verifique se `ANTHROPIC_API_KEY` está configurada
2. Verifique se o bot foi criado (rode o seed)
3. Veja os logs na Vercel

### **Banco de dados não conecta**

Solução:
1. Verifique se `DATABASE_URL` está correta
2. Certifique-se que tem `?sslmode=require` no final
3. Teste a conexão no Neon/Supabase

---

## 📊 **CHECKLIST FINAL**

Antes de usar em produção:

- [ ] Deploy na Vercel concluído
- [ ] Banco de dados configurado (Neon/Supabase)
- [ ] Variáveis de ambiente configuradas
- [ ] Seed executado (stages + regras)
- [ ] Login admin funciona
- [ ] CRM Kanban carrega
- [ ] Bot responde (teste via API)
- [ ] Senha admin alterada

---

## 🎉 **PRONTO!**

Seu sistema está no ar com:
- ✅ CRM Visual Kanban
- ✅ Lead Scoring Automático
- ✅ Bot WhatsApp com IA
- ✅ Monitor de Conversas
- ✅ Sistema de Tarefas
- ✅ Dashboard completo

**Acesse e teste:**
- 🏠 Site: https://seu-dominio.vercel.app
- 📊 CRM: https://seu-dominio.vercel.app/admin/crm
- 🤖 Monitor: https://seu-dominio.vercel.app/admin/bot-monitor

---

## 📞 **SUPORTE**

Problemas? Abra uma issue no GitHub:
https://github.com/gpropadm/bsimoveisdf/issues
