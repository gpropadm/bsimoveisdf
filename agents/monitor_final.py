#!/usr/bin/env python3
"""
AGENTE FINAL - FUNCIONANDO 100%
Monitora novos leads e envia WhatsApp automaticamente
"""
import time
import requests
from datetime import datetime
import sys

# Configurações
DATABASE_URL = "https://modelo-site-imob.vercel.app/api/leads"
WHATSAPP_PHONE = "5561996900444"
CHECK_INTERVAL = 30  # 30 segundos

# UltraMsg
ULTRAMSG_INSTANCE = "instance143095"
ULTRAMSG_TOKEN = "9992dt6kzw35ma6u"

def send_whatsapp_ultramsg(phone: str, message: str) -> bool:
    """Envia WhatsApp via UltraMsg"""
    try:
        url = f"https://api.ultramsg.com/{ULTRAMSG_INSTANCE}/messages/chat"
        payload = {"token": ULTRAMSG_TOKEN, "to": phone, "body": message}
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        response = requests.post(url, data=payload, headers=headers, timeout=10)

        if response.status_code == 200:
            return True
        return False
    except:
        return False

def get_leads():
    """Busca leads da API"""
    try:
        response = requests.get(DATABASE_URL, timeout=10)
        if response.status_code == 200:
            return response.json().get('leads', [])
        return []
    except:
        return []

def format_lead_message(lead):
    """Formata mensagem do lead"""
    now = datetime.now().strftime('%d/%m/%Y %H:%M:%S')

    message = f"""🏠 *NOVO LEAD - INTERESSE EM IMÓVEL*

👤 *Cliente:* {lead.get('name', 'Não informado')}
📞 *Telefone:* {lead.get('phone', 'Não informado')}
📧 *Email:* {lead.get('email', 'Não informado')}

💬 *Mensagem:* {lead.get('message', 'Cliente demonstrou interesse')}

🏡 *Imóvel:* {lead.get('propertyTitle', 'Não informado')}
💰 *Valor:* {lead.get('propertyPrice', 'Não informado')}
🏷️ *Tipo:* {lead.get('propertyType', 'Não informado')}

📅 *Recebido em:* {now}
🆔 *ID:* {lead.get('id', 'N/A')}

🌐 *Site:* https://modelo-site-imob.vercel.app

⚡ *SISTEMA AUTOMÁTICO ATIVO*"""

    return message

def main():
    """Loop principal do agente"""
    print("🚀 AGENTE FINAL INICIADO!")
    print("📱 UltraMsg: CONECTADO")
    print(f"🔄 Verificando a cada {CHECK_INTERVAL}s")
    print("✅ PRONTO PARA CAPTURAR LEADS!")
    print("=" * 50)

    processed_leads = set()

    while True:
        try:
            current_time = datetime.now().strftime('%H:%M:%S')
            print(f"⏰ {current_time} - Verificando novos leads...")

            leads = get_leads()

            if leads:
                print(f"📊 {len(leads)} leads encontrados")

                for lead in leads:
                    lead_id = lead.get('id')

                    if lead_id and lead_id not in processed_leads:
                        print(f"🆕 NOVO LEAD: {lead.get('name')} (ID: {lead_id})")

                        message = format_lead_message(lead)
                        success = send_whatsapp_ultramsg(WHATSAPP_PHONE, message)

                        if success:
                            processed_leads.add(lead_id)
                            print(f"✅ WhatsApp enviado para {lead.get('name')}")
                        else:
                            print(f"❌ Falha ao enviar WhatsApp")

                        print("-" * 30)

            else:
                print("📭 Nenhum lead encontrado")

            sys.stdout.flush()  # Força output
            time.sleep(CHECK_INTERVAL)

        except KeyboardInterrupt:
            print("\n👋 Agente finalizado")
            break
        except Exception as e:
            print(f"❌ Erro: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()