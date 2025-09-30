'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, MapPin, Eye, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  scheduledDate: string;
  duration: number;
  status: string;
  clientFeedback?: string;
  interestLevel?: number;
  property: {
    title: string;
    address: string;
    slug: string;
  };
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchAppointments();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    if (filter === 'agendado') {
      return appointment.status === 'agendado' || appointment.status === 'pending';
    }
    return appointment.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
      case 'pending':
        return 'bg-blue-100 text-[#7360ee]';
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'concluído':
        return 'bg-gray-100 text-gray-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusCount = (status: string) => {
    if (status === 'agendado') {
      return appointments.filter(appointment =>
        appointment.status === 'agendado' || appointment.status === 'pending'
      ).length;
    }
    return appointments.filter(appointment => appointment.status === status).length;
  };

  if (loading) {
    return (
      <AdminLayout title="Agendamentos" subtitle="Gerencie as visitas agendadas" currentPage="appointments">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Agendamentos" subtitle="Gerencie as visitas agendadas" currentPage="appointments">
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total: {appointments.length} agendamentos
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-orange-500 p-6 rounded-lg shadow-lg border-0">
            <div className="flex items-center">
              <div className="p-3 bg-white/30 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white">Agendados</p>
                <p className="text-3xl font-bold text-white">{getStatusCount('agendado')}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg border-0">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-100">Confirmados</p>
                <p className="text-3xl font-bold text-white">{getStatusCount('confirmado')}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg border-0">
            <div className="flex items-center">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-100">Concluídos</p>
                <p className="text-3xl font-bold text-white">{getStatusCount('concluído')}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-400 p-6 rounded-lg shadow-lg border-0">
            <div className="flex items-center">
              <div className="p-3 bg-white/30 rounded-lg">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white">Cancelados</p>
                <p className="text-3xl font-bold text-white">{getStatusCount('cancelado')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#7360ee] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos ({appointments.length})
          </button>
          <button
            onClick={() => setFilter('agendado')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'agendado'
                ? 'bg-[#FFB84D] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Agendados ({getStatusCount('agendado')})
          </button>
          <button
            onClick={() => setFilter('confirmado')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'confirmado'
                ? 'bg-[#7360ee] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Confirmados ({getStatusCount('confirmado')})
          </button>
          <button
            onClick={() => setFilter('concluído')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'concluído'
                ? 'bg-[#7360ee] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Concluídos ({getStatusCount('concluído')})
          </button>
          <button
            onClick={() => setFilter('cancelado')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'cancelado'
                ? 'bg-[#FF6B6B] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancelados ({getStatusCount('cancelado')})
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum agendamento encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imóvel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <User className="h-4 w-4 text-[#7360ee]" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.clientName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {appointment.clientPhone}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {appointment.clientEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.property.title}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {appointment.property.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          {new Date(appointment.scheduledDate).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(appointment.scheduledDate).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          {(appointment.status === 'agendado' || appointment.status === 'pending') && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'confirmado')}
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              Confirmar
                            </button>
                          )}
                          {appointment.status === 'confirmado' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'concluído')}
                              className="text-[#7360ee] hover:text-[#7360ee] font-medium"
                            >
                              Concluir
                            </button>
                          )}
                          {appointment.status !== 'cancelado' && appointment.status !== 'concluído' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'cancelado')}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
