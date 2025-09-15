'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, User, X, MapPin } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

interface AvailableTime {
  time: string;
  displayTime: string;
  available: boolean;
}

export default function AppointmentModal({ isOpen, onClose, property }: AppointmentModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState<AvailableTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Gerar próximos 7 dias (exceto domingos)
  const getNextWeekDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Pular domingos (0 = domingo)
      if (date.getDay() !== 0) {
        days.push({
          date: date.toISOString().split('T')[0],
          display: date.toLocaleDateString('pt-BR', { 
            weekday: 'short', 
            day: '2-digit', 
            month: 'short' 
          })
        });
      }
    }
    
    return days;
  };

  const fetchAvailableTimes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/appointments/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.availableSlots && data.availableSlots.length > 0) {
          // Converter slots da API para formato do componente
          const formattedTimes = data.availableSlots.map((slot: { hora: string; status: string }) => ({
            time: slot.hora,
            displayTime: slot.hora,
            available: slot.status === 'disponível'
          }));
          
          setAvailableTimes(formattedTimes);
        } else {
          // Se não há horários, mostrar padrão
          setAvailableTimes(getDefaultTimeSlots());
        }
      } else {
        // Fallback para horários padrão
        setAvailableTimes(getDefaultTimeSlots());
      }
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
      // Fallback para horários padrão
      setAvailableTimes(getDefaultTimeSlots());
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Buscar horários disponíveis quando data é selecionada
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimes();
    }
  }, [selectedDate, fetchAvailableTimes]);

  const getDefaultTimeSlots = (): AvailableTime[] => {
    const times = [
      '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'
    ];
    
    return times.map(time => ({
      time,
      displayTime: time,
      available: true
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !clientData.name || !clientData.email || !clientData.phone) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          clientName: clientData.name,
          clientPhone: clientData.phone,
          clientEmail: clientData.email,
          propertyTitle: property.title,
          propertyAddress: property.address,
          propertyId: property.id
        }),
      });

      const result = await response.json();

      if (result.success) {
        const detalhes = result.details || {};

        // Abrir WhatsApp automaticamente
        if (result.whatsappUrl) {
          window.open(result.whatsappUrl, '_blank');
        }

        alert(`✅ Visita agendada com sucesso!

📅 Data: ${detalhes.data || selectedDate}
⏰ Hora: ${detalhes.hora || selectedTime}
👤 Cliente: ${detalhes.cliente || clientData.name}
📞 Telefone: ${detalhes.telefone || clientData.phone}
🏠 Imóvel: ${detalhes.imovel || property.title}
👨‍💼 Corretor: ${result.corretor || 'João Silva'}

📱 WhatsApp aberto para confirmação!
💾 Agendamento salvo no sistema

Entraremos em contato para confirmar!`);
        onClose();
        // Reset form
        setSelectedDate('');
        setSelectedTime('');
        setClientData({ name: '', email: '', phone: '' });
      } else {
        // Horário não disponível - mostrar alternativas
        if (result.alternatives && result.alternatives.length > 0) {
          const alternativesText = result.alternatives
            .slice(0, 3)
            .map((alt: { hora: string; corretor: string }, index: number) => `${index + 1}. ${alt.hora} - ${alt.corretor}`)
            .join('\n');
          
          alert(`${result.message}

💡 Horários alternativos disponíveis hoje:
${alternativesText}

✨ Recomendamos selecionar um desses horários para garantir sua visita!`);
        } else {
          alert(result.message || '🚨 Não foi possível agendar sua visita neste momento. Nossa equipe entrará em contato em breve!');
        }
      }
    } catch (error) {
      console.error('Erro ao agendar visita:', error);
      alert('🔌 Parece que houve um problema de conexão. Verifique sua internet e tente novamente, ou entre em contato conosco!');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Agendar Visita</h2>
            <p className="text-gray-600 mt-1">Escolha o melhor horário para conhecer o imóvel</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Property Info */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin size={16} className="mr-1" />
            <span>{property.address}</span>
          </div>
          <div className="text-2xl font-bold text-teal-600">
            {property.type === 'venda' ? 'R$' : 'R$'} {property.price.toLocaleString('pt-BR')}
            {property.type === 'aluguel' && '/mês'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dados do Cliente */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center">
              <User size={20} className="mr-2" />
              Seus Dados
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={clientData.name}
                  onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  required
                  value={clientData.phone}
                  onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={clientData.email}
                onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          {/* Seleção de Data */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center">
              <Calendar size={20} className="mr-2" />
              Escolha a Data
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {getNextWeekDays().map((day) => (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedDate === day.date
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">{day.display}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Seleção de Horário */}
          {selectedDate && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center">
                <Clock size={20} className="mr-2" />
                Escolha o Horário
              </h4>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time.time}
                      type="button"
                      onClick={() => setSelectedTime(time.time)}
                      disabled={!time.available}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedTime === time.time
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : time.available
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {time.displayTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedDate || !selectedTime}
              className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Agendando...' : 'Agendar Visita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}