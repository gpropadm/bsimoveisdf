"""
WhatsApp Sender Agent - Envia notificações via WhatsApp
"""
import asyncio
import os
import aiohttp
import json
from datetime import datetime
from typing import Dict, Any, List
from loguru import logger
import controlflow as cf

# Local imports
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from config.database import db

@cf.flow
class WhatsAppSenderAgent:
    """
    Agente responsável por enviar mensagens via WhatsApp
    """

    def __init__(self):
        self.name = "WhatsApp Sender Agent"
        self.nextjs_url = os.getenv('NEXTJS_URL', 'http://localhost:3000')
        self.max_retries = 3
        self.retry_delay = 5
        logger.info(f"🤖 {self.name} inicializado")

    @cf.task
    async def send_via_nextjs_api(self, phone: str, message: str) -> Dict[str, Any]:
        """
        Envia mensagem via API do Next.js (usando Baileys)
        """
        try:
            # Fazer requisição para API interna do Next.js
            url = f"{self.nextjs_url}/api/whatsapp/send"

            payload = {
                'to': phone,
                'message': message,
                'source': 'agent'
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload) as response:
                    result = await response.json()

                    if response.status == 200 and result.get('success'):
                        logger.info(f"✅ Mensagem enviada via Next.js API para {phone}")
                        return {
                            'success': True,
                            'method': 'nextjs_api',
                            'response': result
                        }
                    else:
                        logger.error(f"❌ Erro Next.js API: {result}")
                        return {
                            'success': False,
                            'method': 'nextjs_api',
                            'error': result.get('error', 'Erro desconhecido')
                        }

        except Exception as e:
            logger.error(f"❌ Erro ao enviar via Next.js API: {e}")
            return {
                'success': False,
                'method': 'nextjs_api',
                'error': str(e)
            }

    @cf.task
    async def send_via_evolution_api(self, phone: str, message: str) -> Dict[str, Any]:
        """
        Envia mensagem via Evolution API (fallback)
        """
        evolution_url = os.getenv('EVOLUTION_API_URL')
        evolution_key = os.getenv('EVOLUTION_API_KEY')
        evolution_instance = os.getenv('EVOLUTION_INSTANCE_NAME')

        if not all([evolution_url, evolution_key, evolution_instance]):
            return {
                'success': False,
                'method': 'evolution_api',
                'error': 'Evolution API não configurada'
            }

        try:
            url = f"{evolution_url}/message/sendText/{evolution_instance}"

            headers = {
                'Content-Type': 'application/json',
                'apikey': evolution_key
            }

            payload = {
                'number': phone,
                'textMessage': {
                    'text': message
                }
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=headers) as response:
                    result = await response.json()

                    if response.status == 200:
                        logger.info(f"✅ Mensagem enviada via Evolution API para {phone}")
                        return {
                            'success': True,
                            'method': 'evolution_api',
                            'response': result
                        }
                    else:
                        logger.error(f"❌ Erro Evolution API: {result}")
                        return {
                            'success': False,
                            'method': 'evolution_api',
                            'error': result
                        }

        except Exception as e:
            logger.error(f"❌ Erro ao enviar via Evolution API: {e}")
            return {
                'success': False,
                'method': 'evolution_api',
                'error': str(e)
            }

    @cf.task
    async def send_message_with_retry(self, phone: str, message: str, priority: str = "NORMAL") -> Dict[str, Any]:
        """
        Envia mensagem com retry automático
        """
        attempts = 0
        last_error = None

        # Determinar ordem de tentativas baseada na prioridade
        if priority == "QUENTE":
            methods = [self.send_via_nextjs_api, self.send_via_evolution_api]
        else:
            methods = [self.send_via_nextjs_api]

        while attempts < self.max_retries:
            attempts += 1

            for method in methods:
                try:
                    logger.info(f"📤 Tentativa {attempts} - Enviando para {phone} via {method.__name__}")

                    result = await method(phone, message)

                    if result['success']:
                        return {
                            'success': True,
                            'attempts': attempts,
                            'method': result['method'],
                            'response': result.get('response')
                        }
                    else:
                        last_error = result.get('error')
                        logger.warning(f"⚠️ Falha no método {method.__name__}: {last_error}")

                except Exception as e:
                    last_error = str(e)
                    logger.error(f"❌ Erro na tentativa {attempts}: {e}")

            # Aguardar antes da próxima tentativa
            if attempts < self.max_retries:
                await asyncio.sleep(self.retry_delay * attempts)

        # Todas as tentativas falharam
        return {
            'success': False,
            'attempts': attempts,
            'error': last_error or 'Todas as tentativas falharam'
        }

    @cf.task
    async def process_notification_queue(self, notifications: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Processa fila de notificações por prioridade
        """
        # Ordenar por prioridade: QUENTE -> MORNO -> FRIO
        priority_order = {"QUENTE": 1, "MORNO": 2, "FRIO": 3}
        sorted_notifications = sorted(
            notifications,
            key=lambda x: priority_order.get(x.get('priority', 'FRIO'), 3)
        )

        results = []

        for notification in sorted_notifications:
            try:
                lead_id = notification.get('lead_id')
                phone = notification.get('whatsapp_number')
                message = notification.get('message')
                priority = notification.get('priority', 'NORMAL')

                if not all([phone, message]):
                    logger.error(f"❌ Dados incompletos para lead {lead_id}")
                    results.append({
                        'lead_id': lead_id,
                        'success': False,
                        'error': 'Dados incompletos'
                    })
                    continue

                # Enviar mensagem
                result = await self.send_message_with_retry(phone, message, priority)

                # Salvar resultado
                notification_result = {
                    'lead_id': lead_id,
                    'success': result['success'],
                    'attempts': result.get('attempts'),
                    'method': result.get('method'),
                    'timestamp': datetime.now().isoformat()
                }

                if result['success']:
                    # Marcar lead como processado com sucesso
                    db.mark_lead_processed(lead_id, 'whatsapp_sent')
                    logger.info(f"✅ Lead {lead_id} notificado com sucesso")
                else:
                    # Marcar como erro
                    db.mark_lead_processed(lead_id, 'whatsapp_error')
                    notification_result['error'] = result.get('error')
                    logger.error(f"❌ Falha ao notificar lead {lead_id}: {result.get('error')}")

                results.append(notification_result)

                # Delay entre mensagens para evitar spam
                await asyncio.sleep(2)

            except Exception as e:
                logger.error(f"❌ Erro ao processar notificação {notification.get('lead_id')}: {e}")
                results.append({
                    'lead_id': notification.get('lead_id'),
                    'success': False,
                    'error': str(e)
                })

        return results

    @cf.task
    async def send_test_message(self, phone: str) -> Dict[str, Any]:
        """
        Envia mensagem de teste
        """
        test_message = f"""🧪 *TESTE DO SISTEMA DE AGENTES*

✅ WhatsApp Sender Agent funcionando!
⏰ Enviado em: {datetime.now().strftime('%d/%m/%Y às %H:%M:%S')}

🤖 Sistema de notificação automática ativo"""

        return await self.send_message_with_retry(phone, test_message, "TESTE")

# Função para executar como serviço independente
async def main():
    """Função principal do agente WhatsApp"""
    agent = WhatsAppSenderAgent()

    # Teste inicial
    settings = db.get_site_settings()
    test_phone = settings.get('contactWhatsapp', '5548998645864')

    logger.info("🧪 Enviando mensagem de teste...")
    test_result = await agent.send_test_message(test_phone)

    if test_result['success']:
        logger.info("✅ Teste de WhatsApp bem-sucedido!")
    else:
        logger.error(f"❌ Teste de WhatsApp falhou: {test_result.get('error')}")

    # Manter agente em execução para processar requisições
    logger.info("🔄 WhatsApp Sender Agent em execução...")
    while True:
        await asyncio.sleep(10)

if __name__ == "__main__":
    # Configurar logs
    logger.add("logs/whatsapp_sender.log", rotation="1 day", retention="30 days")

    # Executar agente
    asyncio.run(main())