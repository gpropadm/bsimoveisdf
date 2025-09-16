"""
Criar lead de teste para verificar se os agentes funcionam
"""
import asyncio
from config.database import db
from datetime import datetime

async def create_test_lead():
    """Cria um lead de teste no banco"""

    # Dados do lead de teste
    test_lead_data = {
        'name': 'João Silva Teste',
        'email': 'joao.teste@email.com',
        'phone': '5561999887766',
        'message': 'Olá! Estou muito interessado neste apartamento. Preciso agendar uma visita urgente, pois quero comprar logo.',
        'propertyTitle': 'Apartamento 3 Quartos Centro',
        'propertyPrice': 450000.0,
        'propertyType': 'venda',
        'source': 'teste_agentes',
        'status': 'novo'
    }

    try:
        # Inserir lead diretamente no banco
        query = """
        INSERT INTO leads (
            id, name, email, phone, message, "propertyTitle", "propertyPrice",
            "propertyType", source, status, "agentProcessed", "createdAt", "updatedAt"
        ) VALUES (
            gen_random_uuid()::text, :name, :email, :phone, :message, :propertyTitle,
            :propertyPrice, :propertyType, :source, :status, false, NOW(), NOW()
        )
        """

        db.execute_query(query, test_lead_data)

        print("✅ Lead de teste criado com sucesso!")
        print(f"👤 Nome: {test_lead_data['name']}")
        print(f"📞 Telefone: {test_lead_data['phone']}")
        print(f"🏠 Imóvel: {test_lead_data['propertyTitle']}")
        print(f"💰 Valor: R$ {test_lead_data['propertyPrice']:,.2f}")
        print(f"💬 Mensagem: {test_lead_data['message'][:50]}...")
        print()
        print("🤖 Os agentes devem processar este lead no próximo ciclo (até 60 segundos)")
        print("📱 Uma notificação WhatsApp será enviada para:", db.get_site_settings().get('contactWhatsapp'))

    except Exception as e:
        print(f"❌ Erro ao criar lead de teste: {e}")

if __name__ == "__main__":
    asyncio.run(create_test_lead())