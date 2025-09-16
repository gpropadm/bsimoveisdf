"""
Production Main - Orquestrador otimizado para produção
"""
import asyncio
import os
import signal
from datetime import datetime, time
from loguru import logger
import controlflow as cf

# Local imports
from core.lead_monitor import LeadMonitorAgent
from core.production_monitor import ProductionMonitorAgent
from config.database import db

@cf.flow
class ProductionOrchestrator:
    """
    Orquestrador otimizado para ambiente de produção
    """

    def __init__(self):
        self.lead_monitor = LeadMonitorAgent()
        self.production_monitor = ProductionMonitorAgent()
        self.running = False
        self.graceful_shutdown = False

        # Configurações de produção
        self.check_interval = int(os.getenv('AGENT_CHECK_INTERVAL', 60))  # 1 minuto
        self.daily_report_time = time(9, 0)  # 9:00 AM

        logger.info("🏭 Production Orchestrator inicializado")

    async def setup_signal_handlers(self):
        """
        Configura handlers para shutdown graceful
        """
        def signal_handler(signum, frame):
            logger.info(f"📡 Recebido sinal {signum}, iniciando shutdown graceful...")
            self.graceful_shutdown = True

        signal.signal(signal.SIGTERM, signal_handler)
        signal.signal(signal.SIGINT, signal_handler)

    @cf.task
    async def production_health_check(self) -> Dict[str, Any]:
        """
        Health check completo para produção
        """
        checks = {}

        # 1. Verificar site
        site_health = await self.production_monitor.check_site_health()
        checks['site'] = site_health

        # 2. Verificar banco
        try:
            leads = db.get_unprocessed_leads()
            checks['database'] = {
                'status': 'healthy',
                'unprocessed_leads': len(leads)
            }
        except Exception as e:
            checks['database'] = {
                'status': 'error',
                'error': str(e)
            }

        # 3. Verificar configurações
        settings = db.get_site_settings()
        checks['whatsapp_config'] = {
            'status': 'configured' if settings.get('contactWhatsapp') else 'missing',
            'number': settings.get('contactWhatsapp', 'not_set')
        }

        # Status geral
        all_healthy = all(
            check.get('status') in ['healthy', 'configured']
            for check in checks.values()
        )

        return {
            'overall_status': 'healthy' if all_healthy else 'degraded',
            'timestamp': datetime.now().isoformat(),
            'checks': checks
        }

    @cf.task
    async def process_leads_production(self) -> Dict[str, Any]:
        """
        Processa leads com lógica de produção
        """
        try:
            # Buscar leads não processados
            leads = db.get_unprocessed_leads()

            if not leads:
                return {
                    'processed': 0,
                    'success': 0,
                    'errors': 0,
                    'message': 'Nenhum lead para processar'
                }

            logger.info(f"🔄 Processando {len(leads)} leads em produção...")

            results = {
                'processed': 0,
                'success': 0,
                'errors': 0,
                'details': []
            }

            # Processar cada lead com segurança
            for lead in leads:
                result = await self.production_monitor.process_lead_with_production_safety(lead)

                results['processed'] += 1

                if result.get('success') and not result.get('skipped'):
                    results['success'] += 1
                elif not result.get('skipped'):
                    results['errors'] += 1
                    results['details'].append({
                        'lead_id': lead.get('id'),
                        'error': result.get('error')
                    })

                # Delay entre processamentos para não sobrecarregar
                await asyncio.sleep(1)

            # Log do resultado
            if results['errors'] > 0:
                logger.warning(f"⚠️ Processamento concluído com {results['errors']} erros")
            else:
                logger.info(f"✅ Processamento concluído: {results['success']} sucessos")

            return results

        except Exception as e:
            logger.error(f"💥 Erro crítico no processamento de leads: {e}")
            await self.production_monitor.send_production_alert(
                f"Erro crítico no processamento: {str(e)}",
                "critical"
            )
            return {
                'processed': 0,
                'success': 0,
                'errors': 1,
                'critical_error': str(e)
            }

    @cf.task
    async def should_send_daily_report(self) -> bool:
        """
        Verifica se deve enviar relatório diário
        """
        now = datetime.now().time()
        return (
            self.daily_report_time <= now <= time(self.daily_report_time.hour, self.daily_report_time.minute + 5)
        )

    async def run_production_cycle(self):
        """
        Executa um ciclo de produção completo
        """
        cycle_start = datetime.now()

        try:
            # 1. Health check
            health = await self.production_health_check()

            if health['overall_status'] != 'healthy':
                await self.production_monitor.send_production_alert(
                    f"Sistema com problemas: {health}",
                    "warning"
                )

            # 2. Processar leads
            if health['checks']['database']['status'] == 'healthy':
                results = await self.process_leads_production()

                if results.get('critical_error'):
                    logger.error("🚨 Erro crítico detectado, pausando processamento")
                    return False  # Indica que deve pausar

            # 3. Relatório diário (se for a hora)
            if await self.should_send_daily_report():
                await self.production_monitor.daily_production_report()

            cycle_duration = (datetime.now() - cycle_start).total_seconds()
            logger.debug(f"📊 Ciclo concluído em {cycle_duration:.2f}s")

            return True

        except Exception as e:
            logger.error(f"💥 Erro no ciclo de produção: {e}")
            await self.production_monitor.send_production_alert(
                f"Erro no ciclo de produção: {str(e)}",
                "error"
            )
            return True  # Continua tentando

    async def run_production_monitoring(self):
        """
        Executa monitoramento contínuo em produção
        """
        self.running = True
        logger.info("🚀 Iniciando monitoramento de produção...")

        # Enviar alerta de inicialização
        await self.production_monitor.send_production_alert(
            "🤖 Sistema de agentes iniciado em produção",
            "info"
        )

        cycle_count = 0
        consecutive_errors = 0

        while self.running and not self.graceful_shutdown:
            try:
                cycle_count += 1
                logger.info(f"🔄 Ciclo #{cycle_count} - {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")

                # Executar ciclo
                success = await self.run_production_cycle()

                if success:
                    consecutive_errors = 0
                else:
                    consecutive_errors += 1

                # Se muitos erros consecutivos, aumentar intervalo
                if consecutive_errors >= 3:
                    error_interval = min(self.check_interval * 2, 300)  # Max 5 min
                    logger.warning(f"⚠️ Muitos erros, aumentando intervalo para {error_interval}s")
                    await asyncio.sleep(error_interval)
                    consecutive_errors = 0
                else:
                    await asyncio.sleep(self.check_interval)

            except asyncio.CancelledError:
                logger.info("⏹️ Operação cancelada")
                break
            except Exception as e:
                consecutive_errors += 1
                logger.error(f"💥 Erro no loop principal: {e}")

                if consecutive_errors >= 5:
                    await self.production_monitor.send_production_alert(
                        f"Sistema instável após {consecutive_errors} erros consecutivos",
                        "critical"
                    )
                    break

                await asyncio.sleep(min(self.check_interval, 60))

        # Shutdown
        logger.info("🏁 Finalizando monitoramento de produção...")
        await self.production_monitor.send_production_alert(
            "🛑 Sistema de agentes finalizado",
            "info"
        )

async def main():
    """Função principal para produção"""

    # Configurar logging para produção
    logger.remove()

    # Log estruturado para produção
    logger.add(
        "logs/production.log",
        level="INFO",
        rotation="1 day",
        retention="30 days",
        compression="gz",
        format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level} | {name}:{function}:{line} | {message}",
        serialize=True  # JSON structured logs
    )

    # Console output mais limpo
    logger.add(
        lambda msg: print(msg, end=""),
        level="INFO",
        format="<green>{time:HH:mm:ss}</green> | <level>{level}</level> | {message}"
    )

    logger.info("🏭 Iniciando sistema de agentes para PRODUÇÃO...")
    logger.info(f"🌍 Environment: {os.getenv('NODE_ENV', 'development')}")
    logger.info(f"🔗 Site URL: {os.getenv('NEXTJS_URL', 'não configurado')}")

    # Verificar variáveis críticas
    critical_vars = ['DATABASE_URL', 'NEXTJS_URL']
    missing_vars = [var for var in critical_vars if not os.getenv(var)]

    if missing_vars:
        logger.error(f"❌ Variáveis críticas não configuradas: {missing_vars}")
        return

    # Inicializar orquestrador
    orchestrator = ProductionOrchestrator()

    # Configurar signal handlers
    await orchestrator.setup_signal_handlers()

    try:
        # Health check inicial
        health = await orchestrator.production_health_check()
        logger.info(f"🏥 Health Check inicial: {health['overall_status']}")

        if health['overall_status'] != 'healthy':
            logger.warning("⚠️ Sistema não está completamente saudável, mas continuando...")

        # Executar monitoramento
        await orchestrator.run_production_monitoring()

    except KeyboardInterrupt:
        logger.info("👋 Recebido Ctrl+C, parando...")
    except Exception as e:
        logger.error(f"💥 Erro fatal: {e}")
    finally:
        orchestrator.running = False
        logger.info("🏁 Sistema finalizado")

if __name__ == "__main__":
    # Garantir diretório de logs
    os.makedirs("logs", exist_ok=True)

    # Executar
    asyncio.run(main())