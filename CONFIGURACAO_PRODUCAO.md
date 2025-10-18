# 🚀 Configuração de Produção - BSI Imóveis DF

## ✅ **PUSH PARA GITHUB CONCLUÍDO!**

Repositório: https://github.com/gpropadm/bsimoveisdf

---

## 📋 **PRÓXIMOS PASSOS - DEPLOY NA VERCEL**

### **PASSO 1: Importar Projeto na Vercel**

1. Acesse: https://vercel.com/
2. Faça login com GitHub
3. Clique em "Add New..." → "Project"
4. Busque: `gpropadm/bsimoveisdf`
5. Clique em "Import"

---

### **PASSO 2: Configurar Variáveis de Ambiente**

Na tela de configuração, clique em "Environment Variables" e adicione:

#### **🔴 OBRIGATÓRIAS (Sem essas o sistema NÃO funciona):**

```bash
# 1. Banco de Dados PostgreSQL
DATABASE_URL
# Valor: postgresql://user:password@host:5432/database?sslmode=require
# Obtenha em: https://neon.tech/ (gratuito)

# 2. URL do Site
NEXTAUTH_URL
# Valor: https://seu-dominio.vercel.app
# (deixe em branco primeiro, a Vercel vai te dar o domínio)

# 3. Chave Secreta de Autenticação
NEXTAUTH_SECRET
# Valor: gere em https://generate-secret.vercel.app/32
# Ou use: openssl rand -base64 32

# 4. Chave da API Anthropic Claude
ANTHROPIC_API_KEY
# Valor: sk-ant-...
# Obtenha em: https://console.anthropic.com/
```

#### **🟡 RECOMENDADAS (para WhatsApp Bot funcionar):**

```bash
# Provedor WhatsApp
WHATSAPP_PROVIDER
# Valor: simulation
# (use "simulation" para testar sem WhatsApp real)

# Ou se quiser WhatsApp real:
WHATSAPP_PROVIDER
# Valor: evolution

EVOLUTION_API_URL
# Valor: URL do seu servidor Evolution API

EVOLUTION_API_KEY
# Valor: Sua chave da Evolution API

EVOLUTION_INSTANCE_NAME
# Valor: bot-imoveis
```

#### **🟢 OPCIONAIS (recursos extras):**

```bash
# Upload de imagens (Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

# Mapas (Mapbox)
NEXT_PUBLIC_MAPBOX_TOKEN

# Ambiente
NODE_ENV
# Valor: production
```

---

### **PASSO 3: Deploy**

1. Clique em "Deploy"
2. Aguarde o build (3-5 minutos)
3. ✅ Deploy concluído!
4. Você receberá um domínio: `https://bsimoveisdf.vercel.app`

---

### **PASSO 4: Atualizar NEXTAUTH_URL**

Depois do primeiro deploy:

1. Vá em "Settings" → "Environment Variables"
2. Edite `NEXTAUTH_URL`
3. Atualize para: `https://bsimoveisdf.vercel.app` (ou seu domínio)
4. Clique em "Redeploy" para aplicar

---

### **PASSO 5: Configurar Banco de Dados**

#### **5.1 Criar Conta no Neon (Gratuito)**

1. Acesse: https://neon.tech/
2. Crie uma conta
3. Clique em "Create Project"
4. Nome: `bsimoveisdf`
5. Região: São Paulo (mais próximo)
6. Copie a `DATABASE_URL`

#### **5.2 Adicionar no Vercel**

1. Vá em "Settings" → "Environment Variables"
2. Adicione `DATABASE_URL`
3. Cole a URL copiada do Neon
4. Clique em "Save"
5. Redeploy o projeto

#### **5.3 Popular Dados Iniciais (Seed)**

Depois do deploy, execute UMA VEZ:

**Via Terminal Local:**
```bash
# Configure DATABASE_URL localmente
export DATABASE_URL="postgresql://..."

# Execute o seed
node prisma/seed-crm.js
```

**Ou via Vercel CLI:**
```bash
npx vercel env pull
node prisma/seed-crm.js
```

Isso cria:
- ✅ 7 stages do funil Kanban
- ✅ 14 regras de Lead Scoring
- ✅ 1 bot padrão

---

### **PASSO 6: Obter Chave Anthropic**

1. Acesse: https://console.anthropic.com/
2. Faça login (pode usar Google)
3. Vá em "API Keys"
4. Clique em "Create Key"
5. Nome: `bsimoveisdf-production`
6. Copie a chave (começa com `sk-ant-...`)
7. Cole no Vercel como `ANTHROPIC_API_KEY`

**Importante:**
- Custa ~$0.003 por 1000 tokens
- Uma conversa de bot = ~500 tokens = $0.0015
- Com $5 de crédito = ~3.333 conversas
- Anthropic dá $5 gratuitos para testar!

---

### **PASSO 7: Testar Instalação**

Depois do deploy, acesse:

#### **7.1 Site Público**
```
https://bsimoveisdf.vercel.app
```

#### **7.2 Login Admin**
```
https://bsimoveisdf.vercel.app/admin/login
```

**Credenciais padrão:**
- Email: `admin@imobinext.com`
- Senha: `ULTRAPHINK`

**⚠️ IMPORTANTE:** Mude a senha imediatamente!

#### **7.3 CRM Kanban**
```
https://bsimoveisdf.vercel.app/admin/crm
```

Você deve ver os 7 stages vazios!

#### **7.4 Monitor de Bots**
```
https://bsimoveisdf.vercel.app/admin/bot-monitor
```

#### **7.5 Testar Bot via API**

```bash
curl -X POST https://bsimoveisdf.vercel.app/api/bot/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+5561999999999",
    "text": "Quero apartamento 2 quartos em Águas Claras",
    "id": "test_1"
  }'
```

Se retornar JSON com `"success": true`, está funcionando! 🎉

---

## 🔧 **RESUMO DAS VARIÁVEIS (COPIAR E COLAR)**

### **Configuração Mínima (sem WhatsApp real):**

```bash
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
NEXTAUTH_URL=https://bsimoveisdf.vercel.app
NEXTAUTH_SECRET=cole_aqui_senha_gerada
ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
WHATSAPP_PROVIDER=simulation
NODE_ENV=production
```

### **Configuração Completa (com WhatsApp real):**

```bash
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
NEXTAUTH_URL=https://bsimoveisdf.vercel.app
NEXTAUTH_SECRET=cole_aqui_senha_gerada
ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
WHATSAPP_PROVIDER=evolution
EVOLUTION_API_URL=https://seu-servidor-evolution.com
EVOLUTION_API_KEY=sua_chave_evolution
EVOLUTION_INSTANCE_NAME=bot-imoveis
NODE_ENV=production
```

---

## ✅ **CHECKLIST FINAL**

Antes de considerar pronto:

- [ ] Deploy na Vercel concluído
- [ ] Domínio atribuído (bsimoveisdf.vercel.app)
- [ ] Banco Neon configurado
- [ ] `DATABASE_URL` adicionada
- [ ] `NEXTAUTH_URL` atualizada
- [ ] `NEXTAUTH_SECRET` gerada e adicionada
- [ ] `ANTHROPIC_API_KEY` adicionada
- [ ] Seed executado (stages criados)
- [ ] Login admin testado
- [ ] CRM Kanban carrega
- [ ] Bot responde via API
- [ ] Senha admin alterada

---

## 🐛 **PROBLEMAS COMUNS**

### **Build falha com "Prisma Client not found"**

✅ **Solução:** O build automático já roda `prisma generate`. Se falhar:
1. Vá em Settings → General
2. Build Command: `npm run build`
3. Isso já inclui: `prisma generate && prisma db push`

### **Erro: "NEXTAUTH_URL não configurada"**

✅ **Solução:**
1. Adicione nas env vars: `NEXTAUTH_URL=https://bsimoveisdf.vercel.app`
2. Redeploy

### **Bot não responde**

✅ **Solução:**
1. Verifique se `ANTHROPIC_API_KEY` está configurada
2. Veja os logs: Vercel → Project → Deployments → Latest → Logs
3. Execute o seed se não rodou ainda

### **Login não funciona**

✅ **Solução:**
1. Verifique se `NEXTAUTH_SECRET` está configurada
2. Certifique-se que `NEXTAUTH_URL` está correta (com https://)
3. Limpe cache do navegador

---

## 📊 **FUNCIONALIDADES DISPONÍVEIS**

Depois do deploy, você terá:

✅ **CRM Visual Kanban**
- Drag & drop entre stages
- 7 etapas do funil
- Histórico automático

✅ **Lead Scoring Automático**
- Pontuação 0-100
- Classificação: Cold/Warm/Hot/Very Hot
- 14 regras inteligentes

✅ **Bot WhatsApp com IA**
- Responde automaticamente
- Extrai informações
- Cria leads
- Calcula score

✅ **Monitor de Conversas**
- Tempo real
- Chat completo
- Lead Score visual

✅ **Dashboard**
- Estatísticas
- Métricas
- Gestão completa

---

## 🎉 **PRONTO PARA PRODUÇÃO!**

Seu sistema está completo e pronto para:
- ✅ Receber clientes
- ✅ Automatizar atendimento
- ✅ Qualificar leads
- ✅ Gerenciar funil de vendas
- ✅ Aumentar conversões

**URL Produção:**
```
https://bsimoveisdf.vercel.app
```

**Suporte:**
- 📧 Issues: https://github.com/gpropadm/bsimoveisdf/issues
- 📚 Docs: Ver arquivos .md no repositório

---

**Desenvolvido com ❤️ usando Claude Code**
