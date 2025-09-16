"""
Main orchestrator for all agents
"""
import asyncio
import os
from datetime import datetime
from loguru import logger
import controlflow as cf

# Local imports
from core.lead_monitor import LeadMonitorAgent
from core.whatsapp_sender import WhatsAppSenderAgent
from config.database import db

@cf.flow
class AgentOrchestrator:
    """
    Orquestrador principal que coordena todos os agentes
    """

    def __init__(self):
        self.lead_monitor = LeadMonitorAgent()
        self.whatsapp_sender = WhatsAppSenderAgent()
        self.running = False
        logger.info("🎯 Agent Orchestrator inicializado")

    @cf.task
    async def run_lead_processing_cycle(self):
        """
        Executa um ciclo completo de processamento de leads
        """
        try:
            logger.info("🔄 Iniciando ciclo de processamento de leads...")

            # 1. Monitorar e processar novos leads
            notifications = await self.lead_monitor.process_leads_batch()

            if not notifications:
                logger.debug("📭 Nenhuma notificação para processar")
                return

            # 2. Enviar notificações via WhatsApp
            logger.info(f"📤 Processando {len(notifications)} notificações...")
            results = await self.whatsapp_sender.process_notification_queue(notifications)

            # 3. Relatório do ciclo
            successful = sum(1 for r in results if r.get('success'))
            failed = len(results) - successful

            logger.info(f"📊 Ciclo concluído - Sucesso: {successful}, Falhas: {failed}")

            # 4. Log detalhado para falhas
            if failed > 0:
                for result in results:
                    if not result.get('success'):
                        logger.error(f"❌ Lead {result.get('lead_id')}: {result.get('error')}")

        except Exception as e:
            logger.error(f"💥 Erro no ciclo de processamento: {e}")

    async def run_continuous(self):
        """
        Executa orquestração contínua
        """
        self.running = True
        logger.info("🚀 Iniciando orquestração contínua dos agentes")

        cycle_count = 0

        while self.running:
            try:
                cycle_count += 1
                logger.info(f"🔄 Ciclo #{cycle_count} - {datetime.now().strftime('%H:%M:%S')}")

                # Executar ciclo de processamento
                await self.run_lead_processing_cycle()

                # Aguardar próximo ciclo
                check_interval = int(os.getenv('AGENT_CHECK_INTERVAL', 30))
                await asyncio.sleep(check_interval)

            except KeyboardInterrupt:
                logger.info("⏹️ Parando orquestração...")
                self.running = False
                break
            except Exception as e:
                logger.error(f"💥 Erro na orquestração: {e}")
                await asyncio.sleep(10)  # Aguardar menos em caso de erro

        logger.info("🏁 Orquestração finalizada")

    def stop(self):
        """Para a orquestração"""
        self.running = False

# Health check endpoint simulation
async def health_check():
    """Verifica saúde do sistema"""
    try:
        # Testar conexão com banco
        leads = db.get_unprocessed_leads()

        # Testar configurações
        settings = db.get_site_settings()

        return {
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'database': 'connected',
            'unprocessed_leads': len(leads),
            'whatsapp_configured': bool(settings.get('contactWhatsapp'))
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'timestamp': datetime.now().isoformat(),
            'error': str(e)
        }

async def main():
    """Função principal"""

    # Configurar logging
    log_level = os.getenv('CONTROLFLOW_LOG_LEVEL', 'INFO')
    logger.remove()
    logger.add(
        "logs/agents.log",
        level=log_level,
        rotation="1 day",
        retention="30 days",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}"
    )
    logger.add(
        lambda msg: print(msg, end=""),
        level=log_level,
        format="<green>{time:HH:mm:ss}</green> | <level>{level}</level> | <cyan>{name}</cyan> | {message}"
    )

    logger.info("🤖 Iniciando sistema de agentes IA...")

    # Verificar saúde inicial
    health = await health_check()
    logger.info(f"🏥 Health Check: {health}")

    if health['status'] != 'healthy':
        logger.error("❌ Sistema não está saudável, verifique configurações")
        return

    # Inicializar orquestrador
    orchestrator = AgentOrchestrator()

    try:
        # Executar continuamente
        await orchestrator.run_continuous()
    except KeyboardInterrupt:
        logger.info("👋 Recebido sinal de parada...")
    finally:
        orchestrator.stop()
        logger.info("🏁 Sistema de agentes finalizado")

if __name__ == "__main__":
    # Criar diretório de logs se não existir
    os.makedirs("logs", exist_ok=True)

    # Executar sistema
    asyncio.run(main())