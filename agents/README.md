# 🤖 Sistema de Agentes IA - Monitoramento de Leads

Sistema inteligente que monitora automaticamente novos leads e envia notificações via WhatsApp usando **ControlFlow**.

## 🎯 **Funcionalidades**

### **Agentes Implementados:**

1. **Lead Monitor Agent** 🔍
   - Monitora tabela `Lead` em tempo real
   - Classifica prioridade automaticamente (QUENTE/MORNO/FRIO)
   - Processa leads não enviados

2. **WhatsApp Sender Agent** 📱
   - Envia notificações via Baileys ou Evolution API
   - Sistema de retry inteligente
   - Suporte a múltiplos provedores

3. **Agent Orchestrator** 🎭
   - Coordena todos os agentes
   - Monitoramento contínuo
   - Health checks automáticos

## 🚀 **Setup Rápido**

```bash
cd agents/
./scripts/setup.sh
```

### **1. Configurar Ambiente**

```bash
# Ativar ambiente virtual
source agents_env/bin/activate

# Copiar configurações
cp .env.example .env
```

### **2. Configurar .env**

```env
# Database (SQLite atual do projeto)
DATABASE_URL="sqlite:///./prisma/dev.db"

# Next.js
NEXTJS_URL="http://localhost:3000"

# Configurações dos agentes
AGENT_CHECK_INTERVAL=30
CONTROLFLOW_LOG_LEVEL="INFO"
```

### **3. Atualizar Schema Prisma**

Adicione ao modelo `Lead` em `prisma/schema.prisma`:

```prisma
model Lead {
  // ... campos existentes ...

  // Campos para agentes
  agentProcessed    Boolean?   @default(false)
  agentStatus       String?    // 'sent', 'error', 'processed'
  agentProcessedAt  DateTime?
}
```

Execute a migração:
```bash
cd ..  # Voltar para root do projeto
npx prisma db push
```

### **4. Iniciar Agentes**

```bash
cd agents/
python main.py
```

## 📋 **Como Funciona**

### **Fluxo Automático:**

```
1. 👤 Cliente preenche lead no site
2. 💾 Lead salvo no banco (agentProcessed = false)
3. 🔍 Lead Monitor detecta novo lead
4. 🧠 IA classifica prioridade do lead
5. 📝 Gera template de mensagem personalizada
6. 📱 WhatsApp Sender envia notificação
7. ✅ Lead marcado como processado
```

### **Classificação Inteligente:**

- **🔥 QUENTE**: Cliente com dados completos + palavras urgentes
- **🟡 MORNO**: Cliente interessado com alguns dados
- **❄️ FRIO**: Lead básico sem urgência

### **Templates Automáticos:**

```
🏠 NOVO INTERESSE EM IMÓVEL

🔥 PRIORIDADE: QUENTE

📋 Dados do Cliente:
👤 Nome: João Silva
📞 Telefone: (48) 99999-9999
📧 Email: joao@email.com

🏘️ Imóvel de Interesse:
🏠 Título: Apartamento 3 Quartos Centro
💰 Valor: R$ 450.000,00
🔗 Link: https://site.com/imovel/apt-centro

💬 Mensagem do Cliente:
"Preciso urgentemente de um apartamento!"

⏰ Recebido em: 15/09/2025 às 14:30
```

## 🔧 **Comandos Úteis**

### **Testar Sistema:**

```bash
# Health check
python -c "import asyncio; from main import health_check; print(asyncio.run(health_check()))"

# Testar classificação
python -c "from core.lead_monitor import LeadMonitorAgent; agent = LeadMonitorAgent(); print(agent.classify_lead_priority({'message': 'preciso urgente', 'phone': '123', 'property_price': 500000}))"

# Testar WhatsApp
python -c "import asyncio; from core.whatsapp_sender import WhatsAppSenderAgent; print(asyncio.run(WhatsAppSenderAgent().send_test_message('5548998645864')))"
```

### **Logs:**

```bash
# Ver logs em tempo real
tail -f logs/agents.log

# Logs específicos
tail -f logs/lead_monitor.log
tail -f logs/whatsapp_sender.log
```

## 🔗 **Integração com Next.js**

### **API Endpoint Criado:**

- `POST /api/whatsapp/send` - Envia mensagens via agentes

### **Modificação Sugerida na API de Leads:**

Em `/api/leads/route.ts`, após criar o lead:

```typescript
// Opcional: Trigger imediato via webhook
fetch('http://localhost:8001/trigger-lead', {
  method: 'POST',
  body: JSON.stringify({ leadId: lead.id })
});
```

## 📊 **Monitoramento**

### **Métricas Automáticas:**
- Leads processados por hora
- Taxa de sucesso do WhatsApp
- Tempo de resposta dos agentes
- Classificação de prioridades

### **Dashboard (Futuro):**
- Interface web para monitorar agentes
- Logs em tempo real
- Configuração de templates
- Estatísticas detalhadas

## 🛠️ **Troubleshooting**

### **Agentes não processam leads:**
```bash
# Verificar banco
python -c "from config.database import db; print(db.get_unprocessed_leads())"

# Verificar configurações
python -c "from config.database import db; print(db.get_site_settings())"
```

### **WhatsApp não envia:**
```bash
# Testar conexão Baileys
curl -X POST http://localhost:3000/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{"to": "5548998645864", "message": "teste"}'
```

### **Logs para debug:**
```bash
# Aumentar verbosidade
export CONTROLFLOW_LOG_LEVEL="DEBUG"
python main.py
```

## 🎯 **Próximas Funcionalidades**

- [ ] Dashboard web para agentes
- [ ] Templates customizáveis via admin
- [ ] Agendamento inteligente de mensagens
- [ ] Integração com CRM
- [ ] Webhooks para terceiros
- [ ] Métricas avançadas

---

**🤖 Sistema desenvolvido com ControlFlow + Next.js + Prisma**

Para suporte: verifique os logs em `logs/` ou execute health check.