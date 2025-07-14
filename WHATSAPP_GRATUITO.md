# 📱 WhatsApp Gratuito com Baileys

## 🚀 **Como Funcionar sem WhatsApp Business API**

### 1. **Configure o .env**
```bash
# Adicione no seu .env
SITE_URL="http://localhost:3000"
CORRETOR_PHONE="5511999999999"
CORRETOR_NAME="João Silva"
```

### 2. **Inicie o WhatsApp**
```bash
# Terminal 1: Inicie o site
npm run dev

# Terminal 2: Inicie o WhatsApp
npm run whatsapp
```

### 3. **Escaneie QR Code**
1. Aparecerá um QR Code no terminal
2. Abra seu WhatsApp no celular
3. Vá em **Menu → Dispositivos conectados**
4. Clique **Conectar dispositivo**
5. Escaneie o QR Code

### 4. **Pronto! 🎉**
- WhatsApp conectado ao seu número pessoal
- Notificações automáticas funcionando
- Corretor recebe mensagens instantâneas

## 🔄 **Fluxo Automático:**

### **Cliente agenda:**
1. Preenche formulário no site
2. Sistema verifica disponibilidade
3. **WhatsApp envia AUTOMATICAMENTE** para corretor

### **Corretor recebe:**
```
📋 Novo Agendamento!
👤 Cliente: Maria Silva
📞 Telefone: (11) 99999-9999
📅 Data: Segunda, 15/07/2024
⏰ Hora: 14:00
🏠 Imóvel: Casa no Centro

Responda:
✅ OK - para confirmar
❌ NEGAR - para negar
📅 REAGENDAR - para novo horário
```

### **Cliente recebe:**
```
✅ Agendamento Confirmado!
📅 Data: Segunda, 15/07/2024
⏰ Hora: 14:00
🏠 Imóvel: Casa no Centro
👤 Corretor: João Silva
📞 Contato: (11) 99999-9999

Responda:
✅ CONFIRMAR presença
📅 REAGENDAR
❌ CANCELAR
```

## 🎯 **Benefícios:**

✅ **Gratuito** - Sem custos de API
✅ **Instantâneo** - Notificações em tempo real
✅ **Automático** - Corretor não precisa ver admin
✅ **Interativo** - Respostas por WhatsApp
✅ **Backup** - Admin sempre disponível

## 🛠️ **Troubleshooting:**

### **QR Code não aparece:**
- Verifique se instalou: `npm install @whiskeysockets/baileys qrcode-terminal`
- Rode novamente: `npm run whatsapp`

### **Desconecta sozinho:**
- Normal! WhatsApp reconecta automaticamente
- Mantenha o terminal aberto

### **Mensagens não chegam:**
- Verifique se WhatsApp está conectado
- Terminal deve mostrar: "✅ WhatsApp conectado!"

## 🔧 **Comandos Úteis:**

```bash
# Iniciar WhatsApp
npm run whatsapp

# Iniciar site
npm run dev

# Verificar logs
# Terminal mostra status de conexão e mensagens
```

## 🌟 **Resultado:**

**SEM WhatsApp:** Corretor verifica admin manualmente
**COM WhatsApp:** Corretor recebe notificação instantânea no celular!

---

**Agora o corretor nunca mais precisa ficar olhando o admin! 📱✨**