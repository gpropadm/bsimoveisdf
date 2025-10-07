# WhatsApp com CallMeBot (100% GRATUITO) ✅

## 📌 O que é?

**CallMeBot** é um serviço GRATUITO que funciona 100% na Vercel via HTTP (sem Puppeteer/Chrome).

- ✅ **Totalmente GRATUITO**
- ✅ **Funciona na Vercel** (serverless)
- ✅ **Simples de configurar** (5 minutos)
- ⚠️ Limite: ~100 mensagens/dia (suficiente para começar)

---

## 🚀 Como configurar (PASSO A PASSO)

### 1️⃣ Obter API Key do CallMeBot

1. Adicione o número **+34 644 44 71 79** nos seus contatos como "CallMeBot"
2. Envie a mensagem: **"I allow callmebot to send me messages"**
3. Você receberá sua **API Key** de volta
4. Guarde essa API Key

### 2️⃣ Configurar variáveis de ambiente

No arquivo `.env` local e na **Vercel**, adicione:

```env
WHATSAPP_ADMIN_PHONE="5561996900444"
CALLMEBOT_API_KEY="sua-api-key-aqui"
```

**Na Vercel:**
1. Acesse: Settings → Environment Variables
2. Adicione as 2 variáveis acima
3. Salve e faça **Redeploy**

### 3️⃣ Testar

Quando um lead for criado, você receberá a mensagem no WhatsApp automaticamente!

---

## ✅ Como funciona

Quando um **novo lead** é cadastrado:
1. Sistema captura os dados do cliente e imóvel
2. Formata uma mensagem bonita
3. Envia via CallMeBot para `WHATSAPP_ADMIN_PHONE`
4. Você recebe no WhatsApp em segundos

---

## 📝 Exemplo de mensagem

```
🔔 NOVO LEAD INTERESSADO

👤 Cliente: João Silva
📱 WhatsApp: 61996900444
📧 Email: joao@email.com

🏠 Imóvel: Apartamento 3 quartos Asa Sul
💰 Valor: R$ 450.000

💬 Mensagem:
"Gostaria de agendar uma visita"

📅 Recebido: 07/10/2025 15:30
🆔 Lead ID: 123
```

---

## ⚠️ Limitações

- **~100 mensagens/dia** (limite gratuito)
- Não envia imagens (só texto)
- Depende do serviço CallMeBot estar online

---

## �� Comparação

| Característica | UltraMsg | CallMeBot |
|---|---|---|
| **Custo** | US$39/mês (~R$195) | **GRATUITO** |
| **Funciona Vercel** | ✅ Sim | ✅ Sim |
| **Limite msgs/dia** | Ilimitado | ~100 |
| **Envia imagens** | ✅ Sim | ❌ Não |
| **Configuração** | Simples | Muito Simples |

---

## 🔧 Troubleshooting

### Não está recebendo mensagens

1. Verifique se adicionou o número +34 644 44 71 79 nos contatos
2. Confirme que recebeu a API Key
3. Verifique se `CALLMEBOT_API_KEY` está na Vercel
4. Verifique se `WHATSAPP_ADMIN_PHONE` está correto (com DDI 55)

### API Key inválida

- Delete o contato e refaça o processo
- Envie novamente: "I allow callmebot to send me messages"

---

## 💡 Quando migrar para solução paga?

Quando você tiver **mais de 3-5 clientes**, migre para:
- **Z-API** (R$ 49/mês) - mensagens ilimitadas + imagens
- Continue usando CallMeBot e economize
