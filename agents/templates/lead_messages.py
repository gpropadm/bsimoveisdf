"""
WhatsApp message templates for lead notifications
"""
from typing import Dict, Any
from datetime import datetime

class LeadMessageTemplates:

    @staticmethod
    def format_lead_notification(lead: Dict[str, Any], settings: Dict[str, Any]) -> str:
        """Format lead notification message"""

        # Extract lead data
        lead_name = lead.get('name', 'Não informado')
        lead_phone = lead.get('phone', 'Não informado')
        lead_email = lead.get('email', 'Não informado')
        lead_message = lead.get('message', 'Sem mensagem')

        # Property data
        property_title = lead.get('property_title', lead.get('propertyTitle', 'Imóvel não especificado'))
        property_price = lead.get('property_price', lead.get('propertyPrice'))
        property_type = lead.get('property_type', lead.get('propertyType', ''))
        property_slug = lead.get('property_slug', '')

        # Format price
        price_text = ""
        if property_price:
            try:
                price_formatted = f"R$ {float(property_price):,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
                price_text = f"💰 *Valor:* {price_formatted}"
            except:
                price_text = f"💰 *Valor:* R$ {property_price}"

        # Property URL
        site_url = settings.get('siteUrl', 'https://modelo-site-imob.vercel.app')
        property_url = f"{site_url}/imovel/{property_slug}" if property_slug else ""

        # Build message
        message = f"""🏠 *NOVO INTERESSE EM IMÓVEL*

📋 *Dados do Cliente:*
👤 *Nome:* {lead_name}
📞 *Telefone:* {lead_phone}
📧 *Email:* {lead_email}

🏘️ *Imóvel de Interesse:*
🏠 *Título:* {property_title}"""

        if property_type:
            message += f"\n🏷️ *Tipo:* {property_type.title()}"

        if price_text:
            message += f"\n{price_text}"

        if property_url:
            message += f"\n🔗 *Link:* {property_url}"

        if lead_message and lead_message.strip():
            message += f"""

💬 *Mensagem do Cliente:*
"{lead_message}"
"""

        message += f"""

⏰ *Recebido em:* {datetime.now().strftime('%d/%m/%Y às %H:%M')}

_🤖 Notificação automática do sistema_"""

        return message

    @staticmethod
    def format_appointment_reminder(appointment: Dict[str, Any]) -> str:
        """Format appointment reminder message"""
        return f"""⏰ *LEMBRETE DE AGENDAMENTO*

📅 *Data:* {appointment.get('date')}
🕐 *Hora:* {appointment.get('time')}
👤 *Cliente:* {appointment.get('client_name')}
📞 *Telefone:* {appointment.get('client_phone')}
🏠 *Imóvel:* {appointment.get('property_title')}

_Agendamento em 1 hora!_"""

    @staticmethod
    def format_daily_summary(leads_count: int, appointments_count: int) -> str:
        """Format daily summary message"""
        return f"""📊 *RESUMO DIÁRIO - {datetime.now().strftime('%d/%m/%Y')}*

📝 *Novos Leads:* {leads_count}
📅 *Agendamentos:* {appointments_count}

✨ *Sistema funcionando perfeitamente!*

_🤖 Relatório automático do ImobiNext_"""

    @staticmethod
    def get_template_by_type(template_type: str, data: Dict[str, Any], settings: Dict[str, Any] = None) -> str:
        """Get message template by type"""

        if settings is None:
            settings = {}

        templates = {
            'lead_notification': LeadMessageTemplates.format_lead_notification,
            'appointment_reminder': LeadMessageTemplates.format_appointment_reminder,
            'daily_summary': LeadMessageTemplates.format_daily_summary
        }

        template_func = templates.get(template_type)
        if not template_func:
            return f"Template '{template_type}' não encontrado"

        try:
            if template_type == 'lead_notification':
                return template_func(data, settings)
            else:
                return template_func(data)
        except Exception as e:
            return f"Erro ao gerar template: {str(e)}"