#!/usr/bin/env python3
"""
AGENTE REAL - Monitora leads e envia WhatsApp
FUNCIONA DE VERDADE - SEM COMPLICAÇÃO!
"""
import time
import requests
import json
from datetime import datetime
import os
import sys

# Configurações
DATABASE_URL = "https://modelo-site-imob.vercel.app/api/leads"
WHATSAPP_PHONE = "5561996900444"  # Seu WhatsApp
CHECK_INTERVAL = 10  # 10 segundos para teste rápido

# UltraMsg
ULTRAMSG_INSTANCE = "instance143095"
ULTRAMSG_TOKEN = "9992dt6kzw35ma6u"

def send_whatsapp_ultramsg(phone: str, message: str) -> bool:
    """Envia WhatsApp via UltraMsg"""
    try:
        url = f"https://api.ultramsg.com/{ULTRAMSG_INSTANCE}/messages/chat"

        payload = {
            "token": ULTRAMSG_TOKEN,
            "to": phone,
            "body": message
        }

        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }

        print(f"📱 ENVIANDO VIA ULTRAMSG PARA: {phone}")

        response = requests.post(url, data=payload, headers=headers)

        if response.status_code == 200:
            print("✅ WHATSAPP ENVIADO COM SUCESSO!")
            return True
        else:
            print(f"❌ Erro UltraMsg: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return False

def get_leads():
    """Busca leads da API"""
    try:
        response = requests.get(DATABASE_URL)
        if response.status_code == 200:
            data = response.json()
            return data.get('leads', [])
        else:
            print(f"❌ Erro ao buscar leads: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Erro ao conectar API: {e}")
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
🆔 *ID do Lead:* {lead.get('id', 'N/A')}

🌐 *Site:* https://modelo-site-imob.vercel.app

⚡ *AGENTE AUTOMÁTICO ATIVO*"""

    return message

def main():
    """Loop principal do agente"""
    print("🤖 AGENTE REAL INICIADO!")
    print("📱 UltraMsg configurado")
    print(f"🔄 Verificando leads a cada {CHECK_INTERVAL} segundos")
    print("✅ PRONTO PARA CAPTURAR LEADS!")
    print("")

    processed_leads = set()

    while True:
        try:
            print(f"⏰ {datetime.now().strftime('%H:%M:%S')} - Verificando novos leads...")

            leads = get_leads()

            if leads:
                print(f"📊 Encontrados {len(leads)} leads total")

                # Processar apenas leads novos
                for lead in leads:
                    lead_id = lead.get('id')

                    if lead_id not in processed_leads:
                        print(f"🆕 NOVO LEAD DETECTADO: {lead.get('name')} - ID: {lead_id}")

                        # Formatar e enviar mensagem
                        message = format_lead_message(lead)
                        success = send_whatsapp_ultramsg(WHATSAPP_PHONE, message)

                        if success:
                            processed_leads.add(lead_id)
                            print(f"✅ Lead {lead_id} processado com sucesso!")
                        else:
                            print(f"❌ Falha ao processar lead {lead_id}")

                        print("-" * 50)
            else:
                print("📭 Nenhum lead encontrado")

            print(f"😴 Aguardando {CHECK_INTERVAL} segundos...")
            print("")
            time.sleep(CHECK_INTERVAL)

        except KeyboardInterrupt:
            print("\n👋 Agente finalizado pelo usuário")
            break
        except Exception as e:
            print(f"❌ Erro no loop principal: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()