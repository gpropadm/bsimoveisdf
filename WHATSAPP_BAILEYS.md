# WhatsApp com Baileys (Gratuito)

## 📌 O que mudou?

Substituímos o **UltraMsg** (pago US$39/mês) pelo **Baileys** (GRATUITO).

## 🚀 Como configurar

### 1. Variável de ambiente

No arquivo `.env`, adicione:

```env
WHATSAPP_ADMIN_PHONE="5561996900444"
```

### 2. Iniciar o servidor

```bash
npm run dev
```

### 3. Conectar o WhatsApp

Faça uma requisição POST para conectar:

```bash
curl -X POST http://localhost:3000/api/whatsapp/baileys/connect
```

### 4. Escanear QR Code

Após o passo 3, um **QR Code** aparecerá no terminal do servidor.

1. Abra o WhatsApp no celular
2. Vá em **Dispositivos Vinculados**
3. Escaneie o QR Code que apareceu no terminal

### 5. Verificar conexão

```bash
curl http://localhost:3000/api/whatsapp/baileys/connect
```

Deve retornar: `{ "connected": true }`

## ✅ Como funciona

- Quando um **novo lead** é criado, uma mensagem é enviada automaticamente para o número configurado em `WHATSAPP_ADMIN_PHONE`
- A mensagem inclui:
  - Nome do cliente
  - Telefone e email
  - Imóvel de interesse
  - Mensagem do cliente

## 📝 Exemplo de mensagem enviada

```
*NOVO LEAD INTERESSADO*

*Cliente:* João Silva
*WhatsApp:* 61996900444
*Email:* joao@email.com

*Imóvel de interesse:*
Apartamento 3 quartos Asa Sul
*Valor:* R$ 450.000

*Mensagem do cliente:*
"Gostaria de agendar uma visita"

*Recebido em:* 07/10/2025 15:30
*Lead ID:* 123
```

## ⚠️ Importante

- O WhatsApp precisa estar conectado para enviar mensagens
- Se o servidor reiniciar, você precisará escanear o QR Code novamente (a sessão fica salva na pasta `whatsapp-session`)
- **Não abuse** do envio de mensagens para evitar ban do WhatsApp

## 🆚 Comparação

| Característica | UltraMsg | Baileys |
|---|---|---|
| Custo | US$39/mês | Gratuito |
| Configuração | Simples | QR Code |
| Estabilidade | Alta | Média |
| Risco de ban | Baixo | Médio (se usar demais) |

## 🔧 Troubleshooting

### QR Code não aparece
- Verifique se a pasta `whatsapp-session` tem permissões de escrita

### Não está enviando mensagens
- Verifique se o WhatsApp está conectado: `GET /api/whatsapp/baileys/connect`
- Reconecte se necessário: `POST /api/whatsapp/baileys/connect`

### Sessão expirou
- Delete a pasta `whatsapp-session`
- Reconecte e escaneie o QR Code novamente
