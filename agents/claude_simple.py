"""
Agente Claude via API HTTP simples
"""
import asyncio
import os
import signal
import aiohttp
import json
from datetime import datetime
from loguru import logger
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Local imports
from config.database import db
from templates.lead_messages import LeadMessageTemplates

class ClaudeSimpleAgent:
    """
    Agente Claude usando HTTP direto
    """

    def __init__(self):
        self.running = False
        self.graceful_shutdown = False
        self.check_interval = int(os.getenv('AGENT_CHECK_INTERVAL', 60))
        self.nextjs_url = os.getenv('NEXTJS_URL', 'https://modelo-site-imob.vercel.app')
        self.agent_token = os.getenv('AGENT_AUTH_TOKEN', '')
        self.anthropic_api_key = os.getenv('ANTHROPIC_API_KEY')

        if not self.anthropic_api_key:
            raise ValueError("❌ ANTHROPIC_API_KEY não configurada!")

        logger.info("🤖 Claude Simple Agent inicializado")

    async def analyze_lead_with_claude(self, lead: dict) -> dict:
        """
        Analisa lead usando Claude via HTTP direto
        """
        try:
            # Preparar contexto
            context = f"""
LEAD PARA ANÁLISE:

Nome: {lead.get('name', 'N/A')}
Email: {lead.get('email', 'N/A')}
Telefone: {lead.get('phone', 'N/A')}
Mensagem: "{lead.get('message', 'N/A')}"

IMÓVEL:
Título: {lead.get('property_title', lead.get('propertyTitle', 'N/A'))}
Preço: R$ {lead.get('property_price', lead.get('propertyPrice', 0)):,.2f}
Tipo: {lead.get('property_type', lead.get('propertyType', 'N/A'))}

TAREFA: Analise este lead e retorne APENAS um JSON:
{{
    "priority": "QUENTE|MORNO|FRIO",
    "urgency_score": 1-10,
    "interest_level": "ALTO|MÉDIO|BAIXO",
    "buying_intent": "COMPRAR_AGORA|PESQUISANDO|CURIOSIDADE",
    "recommended_action": "LIGAR_URGENTE|AGENDAR_VISITA|ENVIAR_INFO|ACOMPANHAR",
    "analysis": "Resumo em 1-2 frases",
    "key_points": ["ponto1", "ponto2"]
}}

Considere urgência, completude dos dados, valor do imóvel e intenção de compra.
            """

            # Payload para Claude API
            payload = {
                "model": "claude-3-sonnet-20240229",
                "max_tokens": 500,
                "temperature": 0.1,
                "messages": [
                    {
                        "role": "user",
                        "content": context
                    }
                ]
            }

            headers = {
                "Content-Type": "application/json",
                "x-api-key": self.anthropic_api_key,
                "anthropic-version": "2023-06-01"
            }

            # Chamar Claude API
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "https://api.anthropic.com/v1/messages",
                    json=payload,
                    headers=headers,
                    timeout=30
                ) as response:

                    if response.status == 200:
                        result = await response.json()
                        response_text = result['content'][0]['text'].strip()

                        # Extrair JSON
                        start = response_text.find('{')
                        end = response_text.rfind('}') + 1
                        json_str = response_text[start:end]

                        analysis = json.loads(json_str)
                        logger.info(f"🧠 Claude analisou: {analysis['priority']} - {analysis['analysis']}")
                        return analysis
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ Claude API erro {response.status}: {error_text[:100]}")
                        raise Exception(f"Claude API falhou: {response.status}")

        except Exception as e:
            logger.error(f"❌ Erro na análise Claude: {e}")
            # Fallback simples
            return {
                "priority": "MORNO",
                "urgency_score": 5,
                "interest_level": "MÉDIO",
                "buying_intent": "PESQUISANDO",
                "recommended_action": "ENVIAR_INFO",
                "analysis": "Análise automática (Claude indisponível)",
                "key_points": ["Lead detectado", "Aguardando análise"]
            }

    async def send_whatsapp_notification(self, lead: dict, analysis: dict) -> bool:
        """
        Envia notificação via WhatsApp com insights Claude
        """
        try:
            # Buscar configurações
            settings = db.get_site_settings()
            whatsapp_number = settings.get('contactWhatsapp')

            if not whatsapp_number:
                logger.error("❌ WhatsApp não configurado")
                return False

            # Gerar mensagem inteligente
            priority = analysis['priority']
            urgency = analysis['urgency_score']
            action = analysis['recommended_action']

            priority_emoji = {"QUENTE": "🔥", "MORNO": "🟡", "FRIO": "❄️"}
            action_emoji = {
                "LIGAR_URGENTE": "📞",
                "AGENDAR_VISITA": "📅",
                "ENVIAR_INFO": "📧",
                "ACOMPANHAR": "👀"
            }

            # Mensagem base
            base_message = LeadMessageTemplates.format_lead_notification(lead, settings)

            # Adicionar insights Claude
            ai_message = f"""
{priority_emoji.get(priority, '📝')} *ANÁLISE CLAUDE IA - {priority}*
🎯 Urgência: {urgency}/10
{action_emoji.get(action, '💡')} Ação: {action.replace('_', ' ')}

💭 *Claude Analysis*: {analysis['analysis']}

📋 *Pontos Chave*:
{chr(10).join(f"• {point}" for point in analysis['key_points'])}

---
{base_message}
            """

            # Tentar envio via Next.js API
            url = f"{self.nextjs_url}/api/whatsapp/send"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.agent_token}'
            }

            payload = {
                'to': whatsapp_number,
                'message': ai_message.strip(),
                'source': 'claude_simple_agent',
                'lead_id': lead.get('id'),
                'claude_analysis': analysis
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=headers, timeout=30) as response:
                    if response.status == 200:
                        result = await response.json()
                        if result.get('success'):
                            logger.info(f"✅ WhatsApp enviado via Claude IA")
                            return True

                    logger.warning(f"⚠️ Next.js API falhou: {response.status}")
                    return False

        except Exception as e:
            logger.error(f"❌ Erro ao enviar WhatsApp: {e}")
            return False

    async def process_leads_cycle(self):
        """
        Processa leads com Claude IA
        """
        try:
            leads = db.get_unprocessed_leads()

            if not leads:
                logger.debug("📭 Nenhum lead para processar")
                return

            logger.info(f"🔄 Processando {len(leads)} leads com Claude IA...")

            for lead in leads:
                try:
                    # Análise Claude
                    analysis = await self.analyze_lead_with_claude(lead)

                    # Enviar notificação
                    success = await self.send_whatsapp_notification(lead, analysis)

                    # Marcar como processado
                    status = 'claude_sent' if success else 'claude_error'
                    db.mark_lead_processed(lead.get('id'), status)

                    if success:
                        logger.info(f"✅ Lead {lead.get('id')} - {analysis['priority']} ({analysis['urgency_score']}/10)")
                    else:
                        logger.error(f"❌ Falha no lead {lead.get('id')}")

                    # Delay entre leads
                    await asyncio.sleep(3)

                except Exception as e:
                    logger.error(f"❌ Erro ao processar lead {lead.get('id')}: {e}")
                    db.mark_lead_processed(lead.get('id'), 'error')

        except Exception as e:
            logger.error(f"💥 Erro no ciclo: {e}")

    async def run_monitoring(self):
        """
        Loop principal de monitoramento
        """
        self.running = True
        logger.info("🚀 Iniciando monitoramento Claude IA...")

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
                logger.error(f"💥 Erro no loop: {e}")
                await asyncio.sleep(10)

        logger.info("🏁 Claude Agent finalizado")

    def setup_signal_handlers(self):
        """
        Configura handlers para shutdown
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
        "logs/claude_simple.log",
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

    logger.info("🤖 Iniciando Claude Simple Agent para PRODUÇÃO...")

    # Verificar configurações
    if not os.getenv('DATABASE_URL'):
        logger.error("❌ DATABASE_URL não configurada")
        return

    if not os.getenv('ANTHROPIC_API_KEY'):
        logger.error("❌ ANTHROPIC_API_KEY não configurada")
        return

    # Inicializar agente
    agent = ClaudeSimpleAgent()
    agent.setup_signal_handlers()

    try:
        # Executar monitoramento
        await agent.run_monitoring()
    except KeyboardInterrupt:
        logger.info("👋 Recebido Ctrl+C, parando...")
    finally:
        agent.running = False
        logger.info("🏁 Claude Simple Agent finalizado")

if __name__ == "__main__":
    # Garantir diretório de logs
    os.makedirs("logs", exist_ok=True)

    # Executar
    asyncio.run(main())