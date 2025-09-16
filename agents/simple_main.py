"""
Simple Main - Agentes sem dependência de OpenAI
"""
import asyncio
import os
import signal
import aiohttp
from datetime import datetime
from loguru import logger
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Local imports
from config.database import db
from templates.lead_messages import LeadMessageTemplates

class SimpleAgentOrchestrator:
    """
    Orquestrador simplificado sem dependência de ControlFlow/OpenAI
    """

    def __init__(self):
        self.running = False
        self.graceful_shutdown = False
        self.check_interval = int(os.getenv('AGENT_CHECK_INTERVAL', 60))
        self.nextjs_url = os.getenv('NEXTJS_URL', 'https://modelo-site-imob.vercel.app')
        self.agent_token = os.getenv('AGENT_AUTH_TOKEN', '')

        logger.info("🤖 Simple Agent Orchestrator inicializado")

    def classify_lead_priority(self, lead: dict) -> str:
        """
        Classifica a prioridade do lead com lógica simples
        """
        score = 0

        # Pontuação por dados completos
        if lead.get('phone'): score += 3
        if lead.get('email'): score += 2
        if lead.get('message', '').strip(): score += 2

        # Pontuação por valor do imóvel
        try:
            price = float(lead.get('property_price', 0) or 0)
            if price > 500000: score += 3
            elif price > 200000: score += 2
            elif price > 100000: score += 1
        except:
            pass

        # Pontuação por palavras-chave
        message = lead.get('message', '').lower()
        urgent_keywords = ['urgente', 'hoje', 'agora', 'já', 'preciso', 'comprar']
        interested_keywords = ['interessado', 'quero', 'gostaria', 'visitar', 'agendar']

        if any(keyword in message for keyword in urgent_keywords):
            score += 4
        elif any(keyword in message for keyword in interested_keywords):
            score += 2

        # Classificação final
        if score >= 8:
            return "QUENTE"
        elif score >= 5:
            return "MORNO"
        else:
            return "FRIO"

    async def send_whatsapp_notification(self, lead: dict, priority: str) -> bool:
        """
        Envia notificação via múltiplos métodos (Next.js API + Evolution API)
        """
        try:
            # Buscar configurações
            settings = db.get_site_settings()
            whatsapp_number = settings.get('contactWhatsapp')

            if not whatsapp_number:
                logger.error("❌ WhatsApp não configurado")
                return False

            # Gerar mensagem
            message = LeadMessageTemplates.format_lead_notification(lead, settings)

            # Adicionar prioridade
            priority_emoji = {"QUENTE": "🔥", "MORNO": "🟡", "FRIO": "❄️"}
            message = f"{priority_emoji.get(priority, '📝')} *PRIORIDADE: {priority}*\n\n{message}"

            # Método 1: Tentar Next.js API primeiro
            success = await self._send_via_nextjs(whatsapp_number, message, lead.get('id'))
            if success:
                return True

            # Método 2: Fallback para Evolution API
            logger.info("🔄 Tentando Evolution API como fallback...")
            success = await self._send_via_evolution(whatsapp_number, message)
            return success

        except Exception as e:
            logger.error(f"❌ Erro geral ao enviar WhatsApp: {e}")
            return False

    async def _send_via_nextjs(self, whatsapp_number: str, message: str, lead_id: str) -> bool:
        """Envia via API do Next.js"""
        try:
            url = f"{self.nextjs_url}/api/whatsapp/send"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.agent_token}'
            }

            payload = {
                'to': whatsapp_number,
                'message': message,
                'source': 'simple_agent',
                'lead_id': lead_id
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=headers, timeout=30) as response:
                    if response.status == 200:
                        result = await response.json()
                        if result.get('success'):
                            logger.info(f"✅ Enviado via Next.js API")
                            return True

                    logger.warning(f"⚠️ Next.js API falhou: {response.status}")
                    return False

        except Exception as e:
            logger.warning(f"⚠️ Next.js API erro: {e}")
            return False

    async def _send_via_evolution(self, whatsapp_number: str, message: str) -> bool:
        """Envia via Evolution API"""
        try:
            # Credenciais Evolution API
            evolution_url = os.getenv('EVOLUTION_API_URL', 'https://evolution-api.onrender.com')
            evolution_key = os.getenv('EVOLUTION_API_KEY', 'B6D711FCDE4D4FD5936544120E713976')
            evolution_instance = os.getenv('EVOLUTION_INSTANCE_NAME', 'site-imobiliaria')

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

            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=headers, timeout=30) as response:
                    if response.status == 200:
                        logger.info(f"✅ Enviado via Evolution API")
                        return True
                    else:
                        result = await response.text()
                        logger.error(f"❌ Evolution API falhou: {response.status} - {result[:100]}...")
                        return False

        except Exception as e:
            logger.error(f"❌ Evolution API erro: {e}")
            return False

    async def process_leads_cycle(self):
        """
        Processa um ciclo de leads
        """
        try:
            # Buscar leads não processados
            leads = db.get_unprocessed_leads()

            if not leads:
                logger.debug("📭 Nenhum lead para processar")
                return

            logger.info(f"🔄 Processando {len(leads)} leads...")

            for lead in leads:
                try:
                    # Classificar prioridade
                    priority = self.classify_lead_priority(lead)

                    # Enviar notificação
                    success = await self.send_whatsapp_notification(lead, priority)

                    # Marcar como processado
                    status = 'whatsapp_sent' if success else 'whatsapp_error'
                    db.mark_lead_processed(lead.get('id'), status)

                    if success:
                        logger.info(f"✅ Lead {lead.get('id')} processado - {priority}")
                    else:
                        logger.error(f"❌ Falha no lead {lead.get('id')}")

                    # Delay entre leads
                    await asyncio.sleep(2)

                except Exception as e:
                    logger.error(f"❌ Erro ao processar lead {lead.get('id')}: {e}")
                    db.mark_lead_processed(lead.get('id'), 'error')

        except Exception as e:
            logger.error(f"💥 Erro no ciclo de processamento: {e}")

    async def health_check(self):
        """
        Verifica saúde do sistema
        """
        try:
            # Testar banco
            leads = db.get_unprocessed_leads()
            settings = db.get_site_settings()

            # Testar API
            health_url = f"{self.nextjs_url}/api/health"
            async with aiohttp.ClientSession() as session:
                async with session.get(health_url, timeout=10) as response:
                    api_status = response.status == 200

            return {
                'status': 'healthy',
                'database': 'connected',
                'api': 'connected' if api_status else 'error',
                'unprocessed_leads': len(leads),
                'whatsapp_configured': bool(settings.get('contactWhatsapp'))
            }

        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }

    async def run_monitoring(self):
        """
        Executa monitoramento contínuo
        """
        self.running = True
        logger.info("🚀 Iniciando monitoramento de leads...")

        # Health check inicial
        health = await self.health_check()
        logger.info(f"🏥 Status inicial: {health}")

        cycle_count = 0

        while self.running and not self.graceful_shutdown:
            try:
                cycle_count += 1
                logger.info(f"🔄 Ciclo #{cycle_count} - {datetime.now().strftime('%H:%M:%S')}")

                # Processar leads
                await self.process_leads_cycle()

                # Aguardar próximo ciclo
                await asyncio.sleep(self.check_interval)

            except asyncio.CancelledError:
                logger.info("⏹️ Monitoramento cancelado")
                break
            except Exception as e:
                logger.error(f"💥 Erro no loop principal: {e}")
                await asyncio.sleep(10)

        logger.info("🏁 Monitoramento finalizado")

    def setup_signal_handlers(self):
        """
        Configura handlers para shutdown graceful
        """
        def signal_handler(signum, frame):
            logger.info(f"📡 Recebido sinal {signum}, parando...")
            self.graceful_shutdown = True

        signal.signal(signal.SIGTERM, signal_handler)
        signal.signal(signal.SIGINT, signal_handler)

async def main():
    """Função principal"""

    # Configurar logging
    logger.remove()
    logger.add(
        "logs/simple_agents.log",
        level="INFO",
        rotation="1 day",
        retention="30 days",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}"
    )
    logger.add(
        lambda msg: print(msg, end=""),
        level="INFO",
        format="<green>{time:HH:mm:ss}</green> | <level>{level}</level> | {message}"
    )

    logger.info("🤖 Iniciando agentes simples para PRODUÇÃO...")

    # Verificar configurações críticas
    if not os.getenv('DATABASE_URL'):
        logger.error("❌ DATABASE_URL não configurada")
        return

    # Inicializar orquestrador
    orchestrator = SimpleAgentOrchestrator()
    orchestrator.setup_signal_handlers()

    try:
        # Executar monitoramento
        await orchestrator.run_monitoring()
    except KeyboardInterrupt:
        logger.info("👋 Recebido Ctrl+C, parando...")
    finally:
        orchestrator.running = False
        logger.info("🏁 Agentes finalizados")

if __name__ == "__main__":
    # Garantir diretório de logs
    os.makedirs("logs", exist_ok=True)

    # Executar
    asyncio.run(main())