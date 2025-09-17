#!/usr/bin/env python3
"""
WhatsApp via UltraMsg - SEM SANDBOX, SEM LIMITAÇÕES
"""
import requests
import os
from datetime import datetime

def send_whatsapp_ultramsg(phone: str, message: str) -> bool:
    """
    Envia WhatsApp via UltraMsg (funciona sem sandbox)

    Para usar:
    1. Acesse: https://ultramsg.com
    2. Crie conta gratis
    3. Pegue seu instance_id e token
    4. Configure as variáveis de ambiente
    """

    # Configurações UltraMsg (exemplo)
    instance_id = os.getenv('ULTRAMSG_INSTANCE_ID', 'instance12345')
    token = os.getenv('ULTRAMSG_TOKEN', 'your_token_here')

    if instance_id == 'instance12345' or token == 'your_token_here':
        print("⚠️  Configure as variáveis ULTRAMSG_INSTANCE_ID e ULTRAMSG_TOKEN")
        print("📋 Acesse: https://ultramsg.com para obter credenciais")
        return False

    try:
        # URL da API UltraMsg
        url = f"https://api.ultramsg.com/{instance_id}/messages/chat"

        # Payload
        payload = {
            "token": token,
            "to": phone,
            "body": message
        }

        # Headers
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }

        print(f"📱 ENVIANDO VIA ULTRAMSG PARA: {phone}")

        response = requests.post(url, data=payload, headers=headers)

        if response.status_code == 200:
            response_data = response.json()
            print("✅ WHATSAPP ENVIADO COM SUCESSO!")
            print(f"📋 Response: {response_data}")

            # Salvar log
            with open('logs/whatsapp_ultramsg.log', 'a', encoding='utf-8') as f:
                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                f.write(f"\n{'='*80}\n")
                f.write(f"✅ ULTRAMSG ENVIADO - {timestamp}\n")
                f.write(f"📱 PARA: {phone}\n")
                f.write(f"📋 Response: {response_data}\n")
                f.write(f"{'='*80}\n")
                f.write(f"{message}\n")
                f.write(f"{'='*80}\n\n")

            return True
        else:
            print(f"❌ Erro UltraMsg: {response.status_code}")
            print(f"📋 Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return False

def test_ultramsg():
    """Teste do UltraMsg"""

    message = """🏠 *TESTE SISTEMA IMOBILIÁRIO - ULTRAMSG*

✅ WhatsApp funcionando sem sandbox!
🚀 Sistema de leads 100% operacional
🤖 Claude IA + UltraMsg integrados

📋 Configuração concluída com sucesso!"""

    # Testar com número brasileiro
    success = send_whatsapp_ultramsg("5561996900444", message)

    if success:
        print("\n🎉 SISTEMA FUNCIONANDO!")
        print("📱 Mensagem enviada via UltraMsg")
        print("🚀 Pronto para receber leads reais!")
    else:
        print("\n⚙️ Configure suas credenciais UltraMsg para usar")

if __name__ == "__main__":
    test_ultramsg()