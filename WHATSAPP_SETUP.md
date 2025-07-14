# 📱 Configuração WhatsApp + Google Sheets

## 🔧 Sistema Implementado

✅ **Google Sheets Integration** - Verificação de disponibilidade
✅ **WhatsApp Notifications** - Notificações automáticas
✅ **RAG System** - Respostas inteligentes
✅ **Webhook Handler** - Processamento de respostas
✅ **Appointment Modal** - Interface atualizada

## 📋 Estrutura da Planilha

Sua planilha deve ter as seguintes colunas:

```
A: Data      | B: Hora  | C: Corretor    | D: Status      | E: Cliente | F: Telefone    | G: Imovel
2024-07-15   | 09:00    | João Silva     | disponível     | -          | -              | -
2024-07-15   | 10:00    | João Silva     | disponível     | -          | -              | -
2024-07-15   | 11:00    | João Silva     | ocupado        | Maria      | 11999998888    | Casa Centro
```

## 🚀 Configuração do Google Sheets

### 1. Criar Service Account
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Ative a Google Sheets API
4. Crie uma Service Account
5. Baixe o arquivo JSON das credenciais

### 2. Configurar Planilha
1. Compartilhe sua planilha com o email da Service Account
2. Dê permissão de "Editor"
3. Copie o ID da planilha (da URL)

### 3. Configurar .env
```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----"
```

## 📱 Configuração WhatsApp

### Opção 1: Twilio (Recomendado para produção)
```bash
# Instalar dependência
npm install twilio

# Configurar .env
WHATSAPP_API_URL="https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json"
WHATSAPP_API_TOKEN="your_twilio_token"
```

### Opção 2: WhatsApp Business API
```bash
# Configurar .env
WHATSAPP_API_URL="https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages"
WHATSAPP_API_TOKEN="your_facebook_token"
WHATSAPP_VERIFY_TOKEN="your_webhook_verify_token"
```

### Opção 3: Baileys (Gratuito)
```bash
# Instalar dependência
npm install @whiskeysockets/baileys

# Configurar webhook local
# Usar ngrok para expor localhost
```

## 🔄 Fluxo do Sistema

1. **Cliente agenda** → Sistema verifica Google Sheets
2. **Se disponível** → Agenda e envia WhatsApp para cliente + corretor
3. **Se ocupado** → Envia alternativas via WhatsApp
4. **Corretor responde** → Sistema processa via webhook
5. **Cliente confirma** → Sistema atualiza Google Sheets

## 📨 Exemplos de Mensagens

### Para Cliente (Confirmação):
```
✅ Agendamento Confirmado!
📅 Data: Segunda, 15/07/2024
⏰ Hora: 14:00
🏠 Imóvel: Casa no Centro
👤 Corretor: João Silva
📞 Contato: (11) 99999-9999

Responda:
✅ CONFIRMAR
📅 REAGENDAR
❌ CANCELAR
```

### Para Corretor (Novo Agendamento):
```
📋 Novo Agendamento!
👤 Cliente: Maria Silva
📞 Telefone: (11) 99999-9999
📅 Data: Segunda, 15/07/2024
⏰ Hora: 14:00
🏠 Imóvel: Casa no Centro

Responda:
✅ CONFIRMAR
❌ NEGAR
📅 REAGENDAR
```

## 🔧 Instalação

```bash
# Instalar dependências
npm install googleapis axios

# Configurar .env (copie do .env.example)
cp .env.example .env

# Preencher variáveis no .env
```

## 🧪 Testando o Sistema

1. **Teste Google Sheets**:
   - Acesse `/api/appointments/check-availability`
   - Verifique se retorna dados da planilha

2. **Teste WhatsApp**:
   - Configure webhook em `/api/whatsapp/webhook`
   - Envie mensagem de teste

3. **Teste Completo**:
   - Acesse página do imóvel
   - Clique em "Agendar Visita"
   - Preencha dados e teste

## 🛠️ Troubleshooting

### Erro Google Sheets
- Verificar permissões da planilha
- Validar Service Account
- Checar formato das credenciais

### Erro WhatsApp
- Verificar token de acesso
- Validar webhook URL
- Testar conectividade API

## 📞 Próximos Passos

1. **Configurar WhatsApp API** (escolha uma opção)
2. **Preencher .env** com suas credenciais
3. **Testar sistema completo**
4. **Treinar corretor** para usar respostas
5. **Monitorar logs** para ajustes

---

**Sistema desenvolvido com integração Google Sheets + WhatsApp + RAG**