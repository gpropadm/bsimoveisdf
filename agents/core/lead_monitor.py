"""
Lead Monitor Agent - Monitora novos leads e dispara notificações
"""
import asyncio
import os
from datetime import datetime
from typing import List, Dict, Any
from loguru import logger
import controlflow as cf

# Local imports
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from config.database import db
from templates.lead_messages import LeadMessageTemplates

@cf.flow
class LeadMonitorAgent:
    """
    Agente responsável por monitorar novos leads e classificá-los
    """

    def __init__(self):
        self.name = "Lead Monitor Agent"
        self.check_interval = int(os.getenv('AGENT_CHECK_INTERVAL', 30))
        logger.info(f"🤖 {self.name} inicializado - Intervalo: {self.check_interval}s")

    @cf.task
    def classify_lead_priority(self, lead: Dict[str, Any]) -> str:
        """
        Classifica a prioridade do lead usando IA
        """
        # Fatores para classificação
        has_phone = bool(lead.get('phone'))
        has_email = bool(lead.get('email'))
        has_message = bool(lead.get('message', '').strip())
        property_price = lead.get('property_price', 0)

        # Análise da mensagem
        message = lead.get('message', '').lower()
        urgent_keywords = ['urgente', 'hoje', 'agora', 'já', 'preciso', 'comprar']
        interested_keywords = ['interessado', 'quero', 'gostaria', 'visitar', 'agendar']

        score = 0

        # Pontuação baseada em dados completos
        if has_phone: score += 3
        if has_email: score += 2
        if has_message: score += 2

        # Pontuação baseada no valor do imóvel
        try:
            price = float(property_price or 0)
            if price > 500000: score += 3
            elif price > 200000: score += 2
            elif price > 100000: score += 1
        except:
            pass

        # Pontuação baseada na mensagem
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

    @cf.task
    def check_for_new_leads(self) -> List[Dict[str, Any]]:
        """
        Verifica se há novos leads não processados
        """
        try:
            leads = db.get_unprocessed_leads()
            logger.info(f"📊 Encontrados {len(leads)} leads não processados")
            return leads
        except Exception as e:
            logger.error(f"Erro ao buscar leads: {e}")
            return []

    @cf.task
    def prepare_lead_notification(self, lead: Dict[str, Any], priority: str) -> Dict[str, Any]:
        """
        Prepara dados para notificação do lead
        """
        # Buscar configurações do site
        settings = db.get_site_settings()

        # Gerar mensagem
        message = LeadMessageTemplates.format_lead_notification(lead, settings)

        # Adicionar prioridade à mensagem
        priority_emoji = {
            "QUENTE": "🔥",
            "MORNO": "🟡",
            "FRIO": "❄️"
        }

        message = f"{priority_emoji.get(priority, '📝')} *PRIORIDADE: {priority}*\n\n{message}"

        notification_data = {
            'lead_id': lead.get('id'),
            'lead_name': lead.get('name'),
            'whatsapp_number': settings.get('contactWhatsapp', '5548998645864'),
            'message': message,
            'priority': priority,
            'property_title': lead.get('property_title', lead.get('propertyTitle', '')),
            'timestamp': datetime.now().isoformat()
        }

        logger.info(f"📝 Notificação preparada para lead {lead.get('id')} - Prioridade: {priority}")
        return notification_data

    @cf.task
    def mark_lead_as_processed(self, lead_id: str, status: str = 'processed') -> bool:
        """
        Marca lead como processado no banco
        """
        try:
            success = db.mark_lead_processed(lead_id, status)
            if success:
                logger.info(f"✅ Lead {lead_id} marcado como processado")
            else:
                logger.error(f"❌ Erro ao marcar lead {lead_id} como processado")
            return success
        except Exception as e:
            logger.error(f"Erro ao marcar lead como processado: {e}")
            return False

    @cf.flow
    async def process_leads_batch(self) -> List[Dict[str, Any]]:
        """
        Processa um lote de leads e prepara notificações
        """
        # 1. Buscar novos leads
        leads = await self.check_for_new_leads()

        if not leads:
            logger.debug("📭 Nenhum lead novo encontrado")
            return []

        notifications = []

        # 2. Processar cada lead
        for lead in leads:
            try:
                # Classificar prioridade
                priority = await self.classify_lead_priority(lead)

                # Preparar notificação
                notification = await self.prepare_lead_notification(lead, priority)
                notifications.append(notification)

                logger.info(f"🔄 Lead {lead.get('id')} processado - {priority}")

            except Exception as e:
                logger.error(f"Erro ao processar lead {lead.get('id')}: {e}")

        logger.info(f"📦 Lote processado: {len(notifications)} notificações preparadas")
        return notifications

    async def run_continuous_monitoring(self):
        """
        Executa monitoramento contínuo de leads
        """
        logger.info(f"🚀 Iniciando monitoramento contínuo de leads")

        while True:
            try:
                # Processar lote de leads
                notifications = await self.process_leads_batch()

                # Se houver notificações, enviar para WhatsApp Agent
                if notifications:
                    # Aqui seria integração com WhatsApp Agent
                    # Por agora, apenas log
                    for notification in notifications:
                        logger.info(f"📤 Notificação pronta: {notification['lead_name']} - {notification['priority']}")

                # Aguardar próximo ciclo
                await asyncio.sleep(self.check_interval)

            except Exception as e:
                logger.error(f"Erro no monitoramento: {e}")
                await asyncio.sleep(5)  # Aguardar menos tempo em caso de erro

# Função principal para execução
async def main():
    """Função principal do agente"""
    agent = LeadMonitorAgent()
    await agent.run_continuous_monitoring()

if __name__ == "__main__":
    # Configurar logs
    logger.add("logs/lead_monitor.log", rotation="1 day", retention="30 days")

    # Executar agente
    asyncio.run(main())