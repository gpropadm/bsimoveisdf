"""
Production Monitor Agent - Monitoramento especializado para produção
"""
import asyncio
import os
import aiohttp
from datetime import datetime, timedelta
from typing import Dict, Any, List
from loguru import logger
import controlflow as cf

# Local imports
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from config.database import db

@cf.flow
class ProductionMonitorAgent:
    """
    Agente especializado para ambiente de produção
    - Monitoramento mais robusto
    - Retry logic avançado
    - Health checks
    - Alertas de falha
    """

    def __init__(self):
        self.name = "Production Monitor Agent"
        self.site_url = os.getenv('NEXTJS_URL', 'https://modelo-site-imob.vercel.app')
        self.webhook_url = os.getenv('WEBHOOK_URL')
        self.slack_webhook = os.getenv('SLACK_WEBHOOK_URL')
        self.max_retries = 5
        self.retry_delays = [1, 2, 5, 10, 30]  # Progressive backoff
        logger.info(f"🏭 {self.name} inicializado para {self.site_url}")

    @cf.task
    async def check_site_health(self) -> Dict[str, Any]:
        """
        Verifica se o site está respondendo
        """
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.site_url}/api/health", timeout=10) as response:
                    if response.status == 200:
                        return {'status': 'healthy', 'response_time': response.headers.get('X-Response-Time', 'unknown')}
                    else:
                        return {'status': 'unhealthy', 'status_code': response.status}
        except Exception as e:
            return {'status': 'error', 'error': str(e)}

    @cf.task
    async def send_production_alert(self, message: str, level: str = "warning") -> bool:
        """
        Envia alertas para Slack/Webhook em produção
        """
        alerts_sent = 0

        # Slack alert
        if self.slack_webhook:
            try:
                slack_payload = {
                    "text": f"🚨 {level.upper()}: {message}",
                    "channel": "#alerts",
                    "username": "ImobiNext Agents",
                    "icon_emoji": ":robot_face:"
                }

                async with aiohttp.ClientSession() as session:
                    async with session.post(self.slack_webhook, json=slack_payload) as response:
                        if response.status == 200:
                            alerts_sent += 1
                            logger.info("✅ Slack alert enviado")
            except Exception as e:
                logger.error(f"❌ Erro ao enviar Slack alert: {e}")

        # Webhook alert
        if self.webhook_url:
            try:
                webhook_payload = {
                    "level": level,
                    "message": message,
                    "timestamp": datetime.now().isoformat(),
                    "service": "imobinext_agents"
                }

                async with aiohttp.ClientSession() as session:
                    async with session.post(self.webhook_url, json=webhook_payload) as response:
                        if response.status == 200:
                            alerts_sent += 1
                            logger.info("✅ Webhook alert enviado")
            except Exception as e:
                logger.error(f"❌ Erro ao enviar webhook alert: {e}")

        return alerts_sent > 0

    @cf.task
    async def robust_api_call(self, endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Faz chamadas de API com retry robusto para produção
        """
        url = f"{self.site_url}{endpoint}"

        for attempt in range(self.max_retries):
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        url,
                        json=payload,
                        headers={'Authorization': f"Bearer {os.getenv('AGENT_AUTH_TOKEN', '')}"},
                        timeout=30
                    ) as response:

                        result = await response.json()

                        if response.status == 200 and result.get('success'):
                            return {
                                'success': True,
                                'data': result,
                                'attempt': attempt + 1
                            }
                        else:
                            logger.warning(f"⚠️ API falhou (tentativa {attempt + 1}): {result}")

            except asyncio.TimeoutError:
                logger.warning(f"⏱️ Timeout na tentativa {attempt + 1}")
            except Exception as e:
                logger.error(f"❌ Erro na tentativa {attempt + 1}: {e}")

            # Aguardar antes da próxima tentativa
            if attempt < self.max_retries - 1:
                delay = self.retry_delays[min(attempt, len(self.retry_delays) - 1)]
                await asyncio.sleep(delay)

        # Todas as tentativas falharam
        await self.send_production_alert(
            f"API call failed após {self.max_retries} tentativas: {endpoint}",
            "error"
        )

        return {
            'success': False,
            'error': f'Failed after {self.max_retries} attempts',
            'endpoint': endpoint
        }

    @cf.task
    async def process_lead_with_production_safety(self, lead: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa lead com segurança para produção
        """
        lead_id = lead.get('id')

        try:
            # 1. Validar dados obrigatórios
            if not lead.get('name') or not lead.get('phone'):
                logger.error(f"❌ Lead {lead_id} com dados incompletos")
                return {'success': False, 'error': 'Dados incompletos'}

            # 2. Verificar se já foi processado (evitar duplicação)
            if lead.get('agentProcessed'):
                logger.info(f"⏭️ Lead {lead_id} já processado, pulando")
                return {'success': True, 'skipped': True}

            # 3. Buscar configurações atualizadas
            settings = db.get_site_settings()
            whatsapp_number = settings.get('contactWhatsapp')

            if not whatsapp_number:
                await self.send_production_alert(
                    "WhatsApp não configurado nas configurações do site",
                    "error"
                )
                return {'success': False, 'error': 'WhatsApp não configurado'}

            # 4. Enviar via API robusta
            result = await self.robust_api_call('/api/whatsapp/send', {
                'to': whatsapp_number,
                'message': self.format_production_message(lead, settings),
                'source': 'production_agent',
                'lead_id': lead_id
            })

            # 5. Marcar como processado se sucesso
            if result['success']:
                db.mark_lead_processed(lead_id, 'sent_production')
                logger.info(f"✅ Lead {lead_id} processado com sucesso em produção")
            else:
                db.mark_lead_processed(lead_id, 'error_production')

            return result

        except Exception as e:
            logger.error(f"💥 Erro ao processar lead {lead_id} em produção: {e}")
            await self.send_production_alert(
                f"Erro crítico no processamento do lead {lead_id}: {str(e)}",
                "critical"
            )
            return {'success': False, 'error': str(e)}

    def format_production_message(self, lead: Dict[str, Any], settings: Dict[str, Any]) -> str:
        """
        Formata mensagem otimizada para produção
        """
        # Mensagem mais concisa e profissional para produção
        property_title = lead.get('property_title', lead.get('propertyTitle', 'Imóvel'))
        property_price = lead.get('property_price', lead.get('propertyPrice'))

        message = f"""🏠 *NOVO LEAD - {property_title.upper()}*

👤 *Cliente:* {lead.get('name')}
📞 *Telefone:* {lead.get('phone')}"""

        if lead.get('email'):
            message += f"\n📧 *Email:* {lead.get('email')}"

        if property_price:
            try:
                price_formatted = f"R$ {float(property_price):,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
                message += f"\n💰 *Valor:* {price_formatted}"
            except:
                message += f"\n💰 *Valor:* R$ {property_price}"

        if lead.get('message', '').strip():
            message += f"\n\n💬 *Mensagem:*\n{lead.get('message')[:200]}{'...' if len(lead.get('message', '')) > 200 else ''}"

        message += f"\n\n⏰ {datetime.now().strftime('%d/%m/%Y %H:%M')}"
        message += f"\n🔗 {settings.get('siteName', 'ImobiNext')}"

        return message

    @cf.task
    async def daily_production_report(self) -> Dict[str, Any]:
        """
        Relatório diário de produção
        """
        today = datetime.now().date()
        yesterday = today - timedelta(days=1)

        # Buscar estatísticas do dia
        stats_query = f"""
        SELECT
            COUNT(*) as total_leads,
            COUNT(CASE WHEN "agentProcessed" = true THEN 1 END) as processed_leads,
            COUNT(CASE WHEN "agentStatus" = 'sent_production' THEN 1 END) as sent_leads,
            COUNT(CASE WHEN "agentStatus" LIKE '%error%' THEN 1 END) as error_leads
        FROM "Lead"
        WHERE DATE("createdAt") = '{yesterday}'
        """

        try:
            stats = db.execute_query(stats_query)
            if stats:
                stat = stats[0]

                report_message = f"""📊 *RELATÓRIO DIÁRIO - {yesterday.strftime('%d/%m/%Y')}*

📝 *Total de Leads:* {stat['total_leads']}
✅ *Processados:* {stat['processed_leads']}
📱 *Enviados WhatsApp:* {stat['sent_leads']}
❌ *Erros:* {stat['error_leads']}

📈 *Taxa de Sucesso:* {(stat['sent_leads'] / max(stat['total_leads'], 1) * 100):.1f}%

🤖 *Sistema operando em produção*"""

                # Enviar relatório
                await self.send_production_alert(report_message, "info")

                return {
                    'success': True,
                    'stats': stat,
                    'date': str(yesterday)
                }

        except Exception as e:
            logger.error(f"❌ Erro ao gerar relatório diário: {e}")
            return {'success': False, 'error': str(e)}

# Global instance
production_monitor = ProductionMonitorAgent()