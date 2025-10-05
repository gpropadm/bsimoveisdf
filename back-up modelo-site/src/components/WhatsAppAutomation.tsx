'use client';

import { useState, useEffect } from 'react';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  active: boolean;
}

interface WhatsAppStats {
  messagesSentToday: number;
  activeAutomations: number;
  leadsContacted: number;
  responseRate: number;
}

export default function WhatsAppAutomation() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [stats, setStats] = useState<WhatsAppStats>({
    messagesSentToday: 0,
    activeAutomations: 0,
    leadsContacted: 0,
    responseRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [whatsappConfigured, setWhatsappConfigured] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [testAutomation, setTestAutomation] = useState('');

  useEffect(() => {
    fetchAutomations();
    fetchStats();
  }, []);

  const fetchAutomations = async () => {
    try {
      const response = await fetch('/api/whatsapp/automation');
      const data = await response.json();

      if (data.success) {
        setAutomations(data.data);
        setWhatsappConfigured(data.whatsappConfigured);
      }
    } catch (error) {
      console.error('Erro ao buscar automações:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // Simular estatísticas (você pode criar uma API real)
    setStats({
      messagesSentToday: Math.floor(Math.random() * 50) + 10,
      activeAutomations: 6,
      leadsContacted: Math.floor(Math.random() * 100) + 20,
      responseRate: Math.floor(Math.random() * 30) + 15
    });
  };

  const testAutomationMessage = async () => {
    if (!selectedLeadId || !testAutomation) {
      alert('Selecione um lead e uma automação para testar');
      return;
    }

    setTestMode(true);

    try {
      const response = await fetch('/api/whatsapp/automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: testAutomation,
          leadId: selectedLeadId,
          data: {
            // Dados de teste
            propertyTitle: 'Casa de Teste - 3 quartos',
            visitDate: 'Amanhã às 14h',
            oldPrice: 500000,
            newPrice: 450000,
            properties: [
              {
                title: 'Apartamento Teste',
                price: 300000,
                city: 'São Paulo',
                slug: 'apartamento-teste'
              }
            ]
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Mensagem de teste enviada com sucesso!');
        fetchStats(); // Atualizar estatísticas
      } else {
        alert('❌ Erro ao enviar: ' + result.message);
      }
    } catch (error) {
      alert('❌ Erro na comunicação com servidor');
      console.error(error);
    } finally {
      setTestMode(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              📱 Automação WhatsApp
              {whatsappConfigured ? (
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">✅ Ativo</span>
              ) : (
                <span className="bg-red-500/30 text-xs px-2 py-1 rounded-full">⚠️ Não configurado</span>
              )}
            </h2>
            <p className="opacity-90">
              Sistema inteligente de follow-up automático via WhatsApp
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{stats.messagesSentToday}</div>
            <div className="text-sm opacity-90">mensagens hoje</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mensagens Enviadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.messagesSentToday}</p>
            </div>
            <div className="text-2xl">📤</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Automações Ativas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.activeAutomations}</p>
            </div>
            <div className="text-2xl">🤖</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Leads Contatados</p>
              <p className="text-2xl font-bold text-purple-600">{stats.leadsContacted}</p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Resposta</p>
              <p className="text-2xl font-bold text-orange-600">{stats.responseRate}%</p>
            </div>
            <div className="text-2xl">💬</div>
          </div>
        </div>
      </div>

      {/* Configuração de Automações */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          ⚙️ Automações Configuradas
        </h3>

        <div className="space-y-4">
          {automations.map((automation) => (
            <div key={automation.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{automation.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{automation.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="font-medium">Trigger:</span> {automation.trigger}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    automation.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {automation.active ? '✅ Ativo' : '⏸️ Pausado'}
                  </span>

                  <button
                    onClick={() => {
                      // Toggle automation (implementar se necessário)
                      console.log('Toggle automation:', automation.id);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {automation.active ? 'Pausar' : 'Ativar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teste de Automação */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🧪 Testar Automação
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID do Lead para Teste
            </label>
            <input
              type="text"
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              placeholder="ID do lead (opcional)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Automação
            </label>
            <select
              value={testAutomation}
              onChange={(e) => setTestAutomation(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Selecionar automação</option>
              {automations.map(automation => (
                <option key={automation.id} value={automation.id}>
                  {automation.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={testAutomationMessage}
              disabled={testMode || !testAutomation}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                testMode || !testAutomation
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {testMode ? '🔄 Enviando...' : '📤 Testar Envio'}
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600">⚠️</span>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Modo de Teste:</p>
              <ul className="text-xs space-y-1">
                <li>• Se o WhatsApp não estiver configurado, será apenas simulado</li>
                <li>• Use um ID de lead válido para testar com dados reais</li>
                <li>• Deixe vazio para usar dados de exemplo</li>
                <li>• As mensagens de teste são registradas no banco de dados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Configuração do WhatsApp */}
      {!whatsappConfigured && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4">
            ⚠️ WhatsApp Não Configurado
          </h3>

          <p className="text-red-700 mb-4">
            Para ativar a automação WhatsApp, configure as seguintes variáveis de ambiente:
          </p>

          <div className="bg-white rounded border p-4 font-mono text-sm">
            <div className="space-y-1 text-gray-600">
              <div>WHATSAPP_API_URL=https://api.ultramsg.com</div>
              <div>WHATSAPP_TOKEN=sua_api_token</div>
              <div>WHATSAPP_INSTANCE_ID=sua_instancia</div>
              <div>WHATSAPP_BOT_NUMBER=5548999999999</div>
            </div>
          </div>

          <p className="text-xs text-red-600 mt-4">
            💡 Recomendamos usar UltraMsg ou similar. Reinicie o servidor após configurar.
          </p>
        </div>
      )}
    </div>
  );
}