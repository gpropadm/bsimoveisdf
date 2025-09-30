'use client';

import { useState, useEffect } from 'react';

interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  scheduledDate: string;
  status: string;
  notes?: string;
  property?: {
    title: string;
    address: string;
  };
}

export default function TestAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este agendamento?')) {
      try {
        const response = await fetch(`/api/appointments/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchAppointments(); // Recarregar lista
        }
      } catch (error) {
        console.error('Erro ao deletar agendamento:', error);
      }
    }
  };

  if (loading) {
    return <div className="p-8">Carregando agendamentos...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Agendamentos de Teste
          </h1>
          
          <div className="text-sm text-gray-600 mb-4">
            Total de agendamentos: {appointments.length}
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum agendamento encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {appointment.clientName}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          appointment.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Telefone:</strong> {appointment.clientPhone}</p>
                        <p><strong>Data/Hora:</strong> {new Date(appointment.scheduledDate).toLocaleString('pt-BR')}</p>
                        {appointment.property && (
                          <p><strong>Imóvel:</strong> {appointment.property.title}</p>
                        )}
                        {appointment.notes && (
                          <p><strong>Observações:</strong> {appointment.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteAppointment(appointment.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Deletar
                    </button>
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