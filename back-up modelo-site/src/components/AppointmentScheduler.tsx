'use client';

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import AppointmentModal from './AppointmentModal';

interface AppointmentSchedulerProps {
  propertyId: string;
  propertyTitle: string;
}

export default function AppointmentScheduler({ propertyId, propertyTitle }: AppointmentSchedulerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Criar objeto property para o modal
  const property = {
    id: propertyId,
    title: propertyTitle,
    address: 'Endereço não informado', // O modal vai buscar do contexto
    price: 0, // O modal vai buscar do contexto
    type: 'venda' // O modal vai buscar do contexto
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full border border-gray-300 text-gray-600 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
      >
        <Calendar size={20} />
        Agendar Visita
      </button>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        property={property}
      />
    </>
  );
}