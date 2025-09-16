'use client';

import { useState, useEffect } from 'react';

interface WhatsAppMessage {
  id: string;
  to: string;
  message: string;
  timestamp: string;
  source: string;
}

export default function WhatsAppMessagesPage() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar mensagens do banco
    const loadMessages = async () => {
      try {
        const response = await fetch('/api/whatsapp/pending');
        const data = await response.json();

        if (data.success) {
          setMessages(data.messages.map((msg: any) => ({
            id: msg.id,
            to: msg.to,
            message: msg.message,
            timestamp: msg.createdAt,
            source: msg.source
          })));
        }
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
      }
      setLoading(false);
    };

    loadMessages();

    // Atualizar a cada 5 segundos
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Mensagem copiada! Cole no WhatsApp Web.');
  };

  const markAsSent = (id: string) => {
    const updated = messages.map(msg =>
      msg.id === id ? { ...msg, sent: true } : msg
    );
    setMessages(updated);
    localStorage.setItem('whatsapp_messages', JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando mensagens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">📱</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Mensagens WhatsApp Pendentes
            </h1>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 text-xl">⚠️</div>
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">
                  Como Funciona (Modo Manual)
                </h3>
                <p className="text-yellow-700 text-sm">
                  1. Quando um cliente demonstra interesse, a mensagem aparece aqui<br/>
                  2. Clique em "Copiar Mensagem" e cole no WhatsApp Web<br/>
                  3. Marque como "Enviada" após enviar
                </p>
              </div>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium mb-2">Nenhuma mensagem pendente</h3>
              <p className="text-sm">As mensagens de interesse dos clientes aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-gray-900">
                        Para: {message.to}
                      </div>
                      <div className="text-sm text-gray-500">
                        {message.source} • {new Date(message.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(message.message)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        📋 Copiar
                      </button>
                      <button
                        onClick={() => markAsSent(message.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                      >
                        ✅ Enviada
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded p-3 text-sm font-mono whitespace-pre-wrap">
                    {message.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}