"""
Testar notificação usando Evolution API diretamente
"""
import asyncio
import aiohttp
import os
from config.database import db
from templates.lead_messages import LeadMessageTemplates

async def test_evolution_api():
    """Testar Evolution API diretamente"""

    # Buscar configurações
    settings = db.get_site_settings()
    whatsapp_number = settings.get('contactWhatsapp', '5561996900444')

    # Buscar lead de teste
    leads = db.get_unprocessed_leads()
    if not leads:
        print("❌ Nenhum lead para testar")
        return

    lead = leads[0]
    print(f"📱 Testando notificação para: {whatsapp_number}")
    print(f"🆔 Lead: {lead['name']} ({lead['id'][:8]}...)")

    # Gerar mensagem
    message = LeadMessageTemplates.format_lead_notification(lead, settings)
    message = f"🔥 *PRIORIDADE: TESTE*\n\n{message}"

    print(f"💬 Mensagem gerada ({len(message)} caracteres)")
    print("📝 Prévia:", message[:100] + "...")

    # Testar Evolution API
    evolution_url = "https://evolution-api.onrender.com"
    evolution_key = "B6D711FCDE4D4FD5936544120E713976"
    evolution_instance = "site-imobiliaria"

    url = f"{evolution_url}/message/sendText/{evolution_instance}"
    headers = {
        'Content-Type': 'application/json',
        'apikey': evolution_key
    }

    payload = {
        'number': whatsapp_number,
        'textMessage': {
            'text': message
        }
    }

    try:
        async with aiohttp.ClientSession() as session:
            print("📡 Enviando via Evolution API...")
            async with session.post(url, json=payload, headers=headers, timeout=30) as response:
                result = await response.text()

                print(f"📊 Status: {response.status}")
                print(f"📋 Resposta: {result[:200]}...")

                if response.status == 200:
                    print("✅ SUCESSO! Mensagem enviada via Evolution API")

                    # Marcar lead como processado
                    db.mark_lead_processed(lead['id'], 'evolution_api_sent')
                    print(f"✅ Lead {lead['id'][:8]}... marcado como processado")

                else:
                    print(f"❌ Erro na Evolution API: {response.status}")

    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    asyncio.run(test_evolution_api())