# 🏭 Agentes IA - Configuração para PRODUÇÃO

Sistema de agentes otimizado para ambiente de produção com **ControlFlow**.

## 🚀 Deploy Rápido para Produção

```bash
cd agents/deploy/
./production_setup.sh
```

## 🔧 Configuração de Produção

### **1. Variáveis de Ambiente (.env)**

```env
# ===== PRODUÇÃO =====
NODE_ENV="production"
NEXTJS_URL="https://modelo-site-imob.vercel.app"
AGENT_AUTH_TOKEN="sua-chave-super-secreta-aqui"

# ===== BANCO (PostgreSQL recomendado) =====
DATABASE_URL="postgresql://user:pass@host:5432/db"

# ===== WHATSAPP =====
# Evolution API (mais estável que Baileys para produção)
EVOLUTION_API_URL="https://evolution-api.com"
EVOLUTION_API_KEY="sua-chave-evolution"
EVOLUTION_INSTANCE_NAME="imobiliaria_bot"

# ===== MONITORAMENTO =====
SLACK_WEBHOOK_URL="https://hooks.slack.com/..."
WEBHOOK_URL="https://seu-monitoring.com/webhook"

# ===== AGENTES =====
AGENT_CHECK_INTERVAL=60  # 1 minuto
CONTROLFLOW_LOG_LEVEL="INFO"
```

### **2. Banco de Dados (Adicionar campos)**

No `prisma/schema.prisma`, adicione ao modelo Lead:

```prisma
model Lead {
  // ... campos existentes ...

  // Campos para agentes
  agentProcessed    Boolean?   @default(false)
  agentStatus       String?    // 'sent', 'error', 'processed'
  agentProcessedAt  DateTime?
}
```

Execute:
```bash
npx prisma db push
```

### **3. Segurança da API**

Adicione no `.env` da Vercel:
```env
AGENT_AUTH_TOKEN=sua-chave-super-secreta-forte
```

## 🎯 Execução em Produção

### **Método 1: Script de Monitoramento (Recomendado)**

```bash
# Iniciar agentes
./monitor_agents.sh start

# Verificar status
./monitor_agents.sh status

# Ver logs em tempo real
./monitor_agents.sh logs

# Parar agentes
./monitor_agents.sh stop

# Reiniciar
./monitor_agents.sh restart
```

### **Método 2: Systemd Service**

```bash
# Instalar serviço
sudo cp imobinext-agents.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable imobinext-agents

# Controlar serviço
sudo systemctl start imobinext-agents
sudo systemctl status imobinext-agents
sudo systemctl stop imobinext-agents
```

### **Método 3: Docker (Futuro)**

```bash
# TODO: Implementar containerização
docker-compose up -d agents
```

## 📊 Monitoramento em Produção

### **Health Checks**

```bash
# Verificar site
curl https://modelo-site-imob.vercel.app/api/health

# Verificar agentes (se expostos)
curl http://localhost:8001/health
```

### **Logs Estruturados**

```bash
# Ver logs principais
tail -f logs/production.log

# Logs específicos
tail -f logs/lead_monitor.log
tail -f logs/whatsapp_sender.log

# Buscar erros
grep "ERROR" logs/production.log

# Estatísticas do dia
grep "$(date +%Y-%m-%d)" logs/production.log | grep "Ciclo concluído"
```

### **Alertas Automáticos**

- ✅ **Slack**: Alertas em canal #alerts
- ✅ **Webhook**: POST para sistema de monitoramento
- ✅ **Email**: Via webhook para SMTP
- ✅ **Relatórios diários**: Enviados às 9:00 AM

## 🛡️ Segurança em Produção

### **Autenticação de API**
- Token Bearer obrigatório para `/api/whatsapp/send`
- Validação de origem dos requests

### **Rate Limiting**
- Delay de 1-2s entre mensagens WhatsApp
- Retry progressivo (1s, 2s, 5s, 10s, 30s)
- Max 5 tentativas por lead

### **Logs Seguros**
- Não loggar dados sensíveis (senhas, tokens)
- Rotação automática de logs (30 dias)
- Compressão automática

## 🔧 Troubleshooting

### **Agentes não processam leads**

```bash
# Verificar processo
./monitor_agents.sh status

# Verificar logs
tail -f logs/production.log

# Testar banco
python3 -c "from config.database import db; print(len(db.get_unprocessed_leads()))"

# Reiniciar
./monitor_agents.sh restart
```

### **WhatsApp não envia**

```bash
# Testar API diretamente
curl -X POST https://modelo-site-imob.vercel.app/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"to": "5548998645864", "message": "teste produção"}'

# Verificar Evolution API (se usando)
curl -X GET "https://evolution-api.com/instance/status/INSTANCE_NAME" \
  -H "apikey: SUA_KEY"
```

### **Performance Issues**

```bash
# Monitorar resources
top -p $(pgrep -f production_main.py)

# Verificar conexões DB
netstat -an | grep :5432  # PostgreSQL

# Logs de performance
grep "Ciclo concluído" logs/production.log | tail -20
```

## 📈 Métricas de Produção

### **KPIs Principais**
- **Leads processados/hora**: Objetivo > 50
- **Taxa de sucesso WhatsApp**: Objetivo > 95%
- **Tempo de resposta médio**: Objetivo < 30s
- **Uptime dos agentes**: Objetivo > 99%

### **Dashboards (Futuro)**
- Grafana com métricas em tempo real
- Alertas proativos
- Análise de tendências

## 🔄 Backup e Recovery

### **Backup Automático**
```bash
# Executar backup
./backup_logs.sh

# Agendar via crontab
0 2 * * * /home/alex/site-imobiliaria-v2/agents/backup_logs.sh
```

### **Recovery**
```bash
# Restaurar logs
tar -xzf backups/logs_backup_YYYYMMDD_HHMMSS.tar.gz

# Reprocessar leads perdidos
python3 -c "
from config.database import db
db.execute_query('UPDATE \"Lead\" SET \"agentProcessed\" = false WHERE \"agentStatus\" = \"error\"')
"
```

## 🚀 Otimizações de Produção

### **Performance**
- ✅ Pool de conexões PostgreSQL
- ✅ Retry progressivo
- ✅ Logs assíncronos
- ✅ Graceful shutdown

### **Reliability**
- ✅ Health checks automáticos
- ✅ Circuit breaker para APIs
- ✅ Dead letter queue para falhas
- ✅ Monitoring proativo

### **Scalability**
- 🔄 Horizontal scaling (múltiplas instâncias)
- 🔄 Load balancing
- 🔄 Queue-based processing
- 🔄 Microservices architecture

## 📞 Suporte

### **Logs para Debug**
```bash
# Aumentar verbosidade temporariamente
export CONTROLFLOW_LOG_LEVEL="DEBUG"
./monitor_agents.sh restart

# Voltar ao normal
export CONTROLFLOW_LOG_LEVEL="INFO"
./monitor_agents.sh restart
```

### **Contatos**
- **Logs**: `logs/production.log`
- **Configuração**: `.env`
- **Status**: `./monitor_agents.sh status`

---

## 🎯 Checklist de Deploy

- [ ] Configurar `.env` com valores de produção
- [ ] Atualizar schema Prisma com campos de agente
- [ ] Configurar Evolution API ou Baileys
- [ ] Testar health check: `/api/health`
- [ ] Configurar alertas Slack/Webhook
- [ ] Executar `./production_setup.sh`
- [ ] Iniciar agentes: `./monitor_agents.sh start`
- [ ] Verificar logs: `./monitor_agents.sh logs`
- [ ] Testar envio de lead real
- [ ] Configurar backup automático
- [ ] Documentar runbook operacional

**🏭 Sistema pronto para produção 24/7!**