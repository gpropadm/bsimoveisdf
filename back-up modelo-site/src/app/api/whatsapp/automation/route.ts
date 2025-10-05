import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Configurações do WhatsApp (você precisará configurar com sua API)
const WHATSAPP_CONFIG = {
  apiUrl: process.env.WHATSAPP_API_URL || 'https://api.ultramsg.com',
  token: process.env.WHATSAPP_TOKEN || '',
  instanceId: process.env.WHATSAPP_INSTANCE_ID || '',
  botNumber: process.env.WHATSAPP_BOT_NUMBER || '5548999999999'
};

interface WhatsAppMessage {
  to: string;
  body: string;
  type?: 'text' | 'image' | 'document';
  caption?: string;
  filename?: string;
}

// Função para enviar mensagem WhatsApp
async function sendWhatsAppMessage(message: WhatsAppMessage) {
  if (!WHATSAPP_CONFIG.token || !WHATSAPP_CONFIG.instanceId) {
    console.log('📱 WhatsApp não configurado - simulando envio:', message.body);
    return { success: true, messageId: 'simulated_' + Date.now() };
  }

  try {
    const response = await fetch(`${WHATSAPP_CONFIG.apiUrl}/${WHATSAPP_CONFIG.instanceId}/messages/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: WHATSAPP_CONFIG.token,
        to: message.to,
        body: message.body,
        priority: '1'
      })
    });

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return { success: false, error: error };
  }
}

// Templates de mensagens inteligentes
const MESSAGE_TEMPLATES = {
  welcome: (leadName: string, propertyTitle?: string) => `
🏠 Olá ${leadName}!

Obrigado pelo interesse ${propertyTitle ? `no imóvel "${propertyTitle}"` : 'em nossos imóveis'}!

Sou seu assistente inteligente e estou aqui para te ajudar a encontrar o imóvel perfeito! 🤖

📋 O que posso fazer por você:
• Enviar mais opções similares
• Agendar uma visita
• Simular financiamento
• Tirar suas dúvidas

🎯 Digite uma das opções:
1️⃣ Ver imóveis similares
2️⃣ Agendar visita
3️⃣ Calcular financiamento
4️⃣ Falar com corretor

*Resposta automática por IA 🤖*`,

  followUp1: (leadName: string) => `
Oi ${leadName}! 👋

Vi que você demonstrou interesse em nossos imóveis.

🎯 Separei algumas opções especiais que combinam com o seu perfil:

*[Aqui serão enviados 3 imóveis personalizados]*

💡 Dica: Imóveis com essas características costumam ser vendidos rapidamente!

Quer agendar uma visita? É só me avisar! 📅

*Mensagem automática - IA Imobiliária 🤖*`,

  followUp2: (leadName: string, daysAgo: number) => `
Oi ${leadName}!

Faz ${daysAgo} dias que você demonstrou interesse em nossos imóveis.

🔥 Temos novidades que podem te interessar:
• Novos imóveis na sua faixa de preço
• Condições especiais de financiamento
• Descontos para compra à vista

📞 Que tal conversarmos hoje?
Posso ligar para você ou você prefere WhatsApp?

*Seu assistente inteligente 🤖*`,

  propertyMatch: (leadName: string, properties: any[]) => {
    const propertyList = properties.map((prop, index) =>
      `${index + 1}. *${prop.title}*\n   💰 R$ ${prop.price.toLocaleString('pt-BR')}\n   📍 ${prop.city}\n   🔗 Ver: ${process.env.NEXT_PUBLIC_URL}/imovel/${prop.slug}`
    ).join('\n\n');

    return `🎯 ${leadName}, encontrei imóveis perfeitos para você!

Nossa IA analisou suas preferências e selecionou estas opções:

${propertyList}

✨ *Por que recomendamos:*
• Preço dentro do seu perfil
• Localização estratégica
• Alta valorização

Quer mais detalhes de algum? É só digitar o número!

*Recomendação por IA 🤖*`;
  },

  visitReminder: (leadName: string, propertyTitle: string, visitDate: string) => `
📅 Lembrete de Visita - ${leadName}

Sua visita ao imóvel *${propertyTitle}* está agendada para:
🗓️ ${visitDate}

📍 *Prepare-se para a visita:*
• Documentos de identificação
• Comprovante de renda (se interessar)
• Liste suas dúvidas

💡 *Dicas para a visita:*
✅ Observe iluminação natural
✅ Verifique acabamentos
✅ Teste torneiras e interruptores
✅ Veja a vista das janelas

Alguma dúvida? Estou aqui! 🤖

*Assistente Inteligente*`,

  priceAlert: (leadName: string, propertyTitle: string, oldPrice: number, newPrice: number) => `
🚨 ${leadName}, ALERTA DE PREÇO!

O imóvel "${propertyTitle}" que você visualizou teve o preço reduzido:

❌ Antes: R$ ${oldPrice.toLocaleString('pt-BR')}
✅ Agora: R$ ${newPrice.toLocaleString('pt-BR')}
💰 Economia: R$ ${(oldPrice - newPrice).toLocaleString('pt-BR')}

⚡ Esta é uma oportunidade única!
Imóveis com desconto costumam ser vendidos rapidamente.

Quer agendar uma visita urgente? 📞

*Alerta automático por IA 🤖*`
};

// Função para processar automação baseada no tipo
async function processAutomation(type: string, leadId: string, data: any = {}) {
  try {
    // Buscar dados do lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        property: true
      }
    });

    if (!lead) {
      return { success: false, error: 'Lead não encontrado' };
    }

    let message = '';
    let shouldSend = true;

    switch (type) {
      case 'welcome':
        message = MESSAGE_TEMPLATES.welcome(lead.name, lead.property?.title);
        break;

      case 'followup_1_day':
        const daysSince = Math.floor((Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince >= 1 && lead.status === 'novo') {
          message = MESSAGE_TEMPLATES.followUp1(lead.name);
        } else {
          shouldSend = false;
        }
        break;

      case 'followup_3_days':
        const daysSince3 = Math.floor((Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince3 >= 3 && lead.status !== 'convertido') {
          message = MESSAGE_TEMPLATES.followUp2(lead.name, daysSince3);
        } else {
          shouldSend = false;
        }
        break;

      case 'property_match':
        const matchingProperties = data.properties || [];
        if (matchingProperties.length > 0) {
          message = MESSAGE_TEMPLATES.propertyMatch(lead.name, matchingProperties);
        } else {
          shouldSend = false;
        }
        break;

      case 'visit_reminder':
        if (data.visitDate && data.propertyTitle) {
          message = MESSAGE_TEMPLATES.visitReminder(lead.name, data.propertyTitle, data.visitDate);
        } else {
          shouldSend = false;
        }
        break;

      case 'price_alert':
        if (data.propertyTitle && data.oldPrice && data.newPrice) {
          message = MESSAGE_TEMPLATES.priceAlert(lead.name, data.propertyTitle, data.oldPrice, data.newPrice);
        } else {
          shouldSend = false;
        }
        break;

      default:
        shouldSend = false;
    }

    if (!shouldSend) {
      return { success: true, message: 'Automação não aplicável no momento' };
    }

    // Enviar mensagem
    const result = await sendWhatsAppMessage({
      to: lead.phone || '',
      body: message
    });

    if (result.success) {
      // Registrar mensagem no banco
      await prisma.whatsAppMessage.create({
        data: {
          messageId: result.messageId,
          from: WHATSAPP_CONFIG.botNumber,
          to: lead.phone || '',
          body: message,
          fromMe: true,
          status: 'sent',
          source: 'automation',
          contactName: lead.name,
          timestamp: new Date()
        }
      });

      // Atualizar status do lead se necessário
      if (type === 'welcome' && lead.status === 'novo') {
        await prisma.lead.update({
          where: { id: leadId },
          data: {
            status: 'contatado',
            agentProcessed: true,
            agentStatus: 'whatsapp_sent',
            agentProcessedAt: new Date()
          }
        });
      }
    }

    return result;

  } catch (error) {
    console.error('Erro na automação WhatsApp:', error);
    return { success: false, error: error };
  }
}

// Endpoint principal da automação
export async function POST(request: Request) {
  try {
    const { action, leadId, data } = await request.json();

    if (!action || !leadId) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros obrigatórios: action e leadId'
      }, { status: 400 });
    }

    const result = await processAutomation(action, leadId, data);

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Automação executada com sucesso' : result.error,
      data: result
    });

  } catch (error) {
    console.error('Erro na API de automação WhatsApp:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// Endpoint para buscar automações disponíveis
export async function GET() {
  const automations = [
    {
      id: 'welcome',
      name: 'Mensagem de Boas-vindas',
      description: 'Enviada imediatamente quando um lead é criado',
      trigger: 'Novo lead',
      active: true
    },
    {
      id: 'followup_1_day',
      name: 'Follow-up 1 dia',
      description: 'Enviada 1 dia após o primeiro contato',
      trigger: 'Lead há 1 dia sem resposta',
      active: true
    },
    {
      id: 'followup_3_days',
      name: 'Follow-up 3 dias',
      description: 'Enviada 3 dias após o primeiro contato',
      trigger: 'Lead há 3 dias sem conversão',
      active: true
    },
    {
      id: 'property_match',
      name: 'Recomendações IA',
      description: 'Envia imóveis recomendados pela IA',
      trigger: 'Manual ou automático',
      active: true
    },
    {
      id: 'visit_reminder',
      name: 'Lembrete de Visita',
      description: 'Lembrete enviado antes da visita agendada',
      trigger: '1 dia antes da visita',
      active: true
    },
    {
      id: 'price_alert',
      name: 'Alerta de Preço',
      description: 'Notifica quando imóvel de interesse baixa o preço',
      trigger: 'Mudança de preço',
      active: true
    }
  ];

  return NextResponse.json({
    success: true,
    data: automations,
    whatsappConfigured: !!(WHATSAPP_CONFIG.token && WHATSAPP_CONFIG.instanceId)
  });
}