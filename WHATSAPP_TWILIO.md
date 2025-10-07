# WhatsApp com Twilio

## 📌 O que é?

**Twilio** é uma das maiores empresas de comunicação por API do mundo. Confiável e funciona 100% na Vercel.

- ✅ **Funciona 100% na Vercel** (API HTTP)
- ✅ **Paga por uso**: ~USD 0.005/msg (~R$ 0.025 por mensagem)
- ✅ **Sem mensalidade fixa** (só paga o que usar)
- ✅ **Trial grátis** para testar

---

## 🚀 Como configurar

### 1️⃣ Criar conta Twilio

1. Acesse: https://www.twilio.com/try-twilio
2. Crie sua conta (tem trial grátis)
3. Verifique seu número de telefone

### 2️⃣ Ativar WhatsApp Sandbox (para testes)

1. No painel Twilio: https://console.twilio.com/
2. Vá em **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Siga as instruções para ativar o Sandbox:
   - Envie uma mensagem para o número Twilio com o código fornecido
   - Ex: "join [seu-código]" para +1 415 523 8886

### 3️⃣ Pegar as credenciais

No painel Twilio, copie:
- **Account SID** (algo como: ACxxxxxxxxxxxx)
- **Auth Token** (clique em "show" para ver)
- **Número WhatsApp Twilio** (Ex: whatsapp:+14155238886)

### 4️⃣ Configurar variáveis na Vercel

Adicione na Vercel (Settings → Environment Variables):

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=seu-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
WHATSAPP_ADMIN_PHONE=5561996900444
```

### 5️⃣ Redeploy

- Deployments → ... → Redeploy (sem cache)

---

## ✅ Como funciona

Quando um lead é criado:
1. Sistema formata mensagem
2. Envia via Twilio para `WHATSAPP_ADMIN_PHONE`
3. Você recebe no WhatsApp instantaneamente

---

## 💰 Custos

- **Trial**: USD 15 grátis para testar
- **Produção**: ~USD 0.005/msg (~R$ 0.025)
- **100 mensagens/mês** = ~R$ 2.50
- **1000 mensagens/mês** = ~R$ 25

**Muito barato!** Você cobra R$ 60-100 dos clientes.

---

## 📝 Sandbox vs Produção

### **Sandbox (Trial/Teste)**
- Grátis para testar
- Precisa "join" no número Twilio antes
- Limite de mensagens

### **Produção (Pago)**
- Seu próprio número WhatsApp Business
- Sem limitações
- Precisa aprovação da Meta/Facebook

**Comece com Sandbox para testar!**

---

## 🔧 Troubleshooting

### Não recebe mensagens
- Verifique se fez "join" no Sandbox Twilio
- Confirme as variáveis na Vercel
- Veja os logs da Vercel

### Erro "Unverified number"
- No Sandbox, precisa fazer "join" primeiro
- Ou use produção com número aprovado

---

## 🆚 Comparação

| Item | CallMeBot | Twilio |
|---|---|---|
| **Custo** | Grátis | ~R$ 0.025/msg |
| **Funciona?** | ❌ Bugado | ✅ 100% |
| **Vercel** | ✅ Sim | ✅ Sim |
| **Confiável** | ❌ Não | ✅ Muito |
| **Trial** | Não | ✅ USD 15 |

**Twilio é a solução profissional!** 🚀
